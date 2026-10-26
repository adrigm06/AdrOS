import { TerminalError } from './types.js';

const MAX_RESPONSE = 2 * 1024 * 1024;
const MAX_CACHE_WEIGHT = 4 * 1024 * 1024;
interface Pending { controller: AbortController; promise: Promise<unknown>; users: number }
interface Cached { value: unknown; expires: number; weight: number }

async function readJson(response: Response): Promise<unknown> {
  if (Number(response.headers.get('content-length')) > MAX_RESPONSE) throw new TerminalError('response_limit');
  if (!response.body) throw new TerminalError('malformed');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      length += result.value.byteLength;
      if (length > MAX_RESPONSE) { await reader.cancel(); throw new TerminalError('response_limit'); }
      chunks.push(result.value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new TerminalError('malformed'); }
}

export class PublicGithubClient {
  private cache = new Map<string, Cached>();
  private pending = new Map<string, Pending>();
  constructor(private fetcher: typeof fetch = globalThis.fetch.bind(globalThis), private now = () => Date.now(), private timeoutMs = 12000) {}

  async request(path: string, signal: AbortSignal): Promise<unknown> {
    if (signal.aborted) throw new TerminalError('cancelled');
    if (!path.startsWith('/repos/') || path.split('/').includes('..') || [...path].some(character => character.charCodeAt(0) <= 32 || character === '#')) throw new TerminalError('path');
    const cached = this.cache.get(path);
    if (cached && cached.expires > this.now()) return cached.value;
    this.cache.delete(path);
    let active = this.pending.get(path);
    if (!active) {
      const controller = new AbortController();
      const slot: Pending = { controller, users: 0, promise: Promise.resolve(null) };
      slot.promise = this.load(path, controller).finally(() => { if (this.pending.get(path) === slot) this.pending.delete(path); });
      active = slot;
      this.pending.set(path, active);
    }
    const current = active;
    current.users += 1;
    return new Promise((resolve, reject) => {
      let finished = false;
      const release = () => {
        if (finished) return false;
        finished = true;
        signal.removeEventListener('abort', abort);
        current.users -= 1;
        if (current.users === 0 && this.pending.get(path) === current) {
          this.pending.delete(path); current.controller.abort();
        }
        return true;
      };
      const abort = () => { if (release()) reject(new TerminalError('cancelled')); };
      signal.addEventListener('abort', abort, { once: true });
      current.promise.then(value => { if (release()) resolve(value); }, error => { if (release()) reject(error); });
      if (signal.aborted) abort();
    });
  }

  private async load(path: string, controller: AbortController) {
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.abort(); }, this.timeoutMs);
    try {
      const response = await this.fetcher(`https://api.github.com${path}`, {
        signal: controller.signal, credentials: 'omit', redirect: 'error', headers: { Accept: 'application/vnd.github+json' },
      });
      if (response.status === 404) throw new TerminalError('not_found');
      if (response.status === 403 || response.status === 429) throw new TerminalError('rate_limit');
      if (!response.ok) throw new TerminalError('network');
      const value = await readJson(response);
      if (controller.signal.aborted) throw new TerminalError(timedOut ? 'timeout' : 'cancelled');
      const weight = JSON.stringify(value).length * 2;
      this.cache.set(path, { value, expires: this.now() + 300000, weight });
      let total = [...this.cache.values()].reduce((sum, entry) => sum + entry.weight, 0);
      while (this.cache.size > 32 || total > MAX_CACHE_WEIGHT) {
        const oldest = this.cache.keys().next().value;
        if (!oldest) break;
        total -= this.cache.get(oldest)!.weight; this.cache.delete(oldest);
      }
      return value;
    } catch (error) {
      if (timedOut) throw new TerminalError('timeout');
      if (controller.signal.aborted) throw new TerminalError('cancelled');
      if (error instanceof TerminalError) throw error;
      throw new TerminalError('network');
    } finally { clearTimeout(timer); }
  }
}
