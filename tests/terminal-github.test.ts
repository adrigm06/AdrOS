import { afterEach, describe, expect, it, vi } from 'vitest';
import { PublicGithubClient } from '../src/lib/terminal/github-client.js';
import { decodeGithubText, GithubRepositoryService, MAX_TEXT_BYTES } from '../src/lib/terminal/repo-filesystem.js';
import type { TerminalProject } from '../src/lib/terminal/types.js';

const signal = () => new AbortController().signal;
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
const sha = (letter: string) => letter.repeat(40);
const project: TerminalProject = { id: 'sample', title: 'Sample', description: { en: '', es: '' }, zone: 'android', stack: [], githubUrl: 'https://github.com/owner/sample', demoUrl: '', status: 'active' };
const textBlob = (text: string) => ({ size: Buffer.byteLength(text), encoding: 'base64', content: Buffer.from(text).toString('base64') });

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('public GitHub transport', () => {
  it('preserves the browser global receiver for the default native fetch', async () => {
    const browserFetch = vi.fn(function (this: unknown) {
      if (this !== globalThis) throw new TypeError('Illegal invocation');
      return Promise.resolve(json({ ok: true }));
    });
    vi.stubGlobal('fetch', browserFetch);
    await expect(new PublicGithubClient().request('/repos/o/r', signal())).resolves.toEqual({ ok: true });
    expect(browserFetch).toHaveBeenCalledTimes(1);
  });
  it('deduplicates, caches and expires requests without credentials', async () => {
    let now = 0;
    const fetcher = vi.fn<typeof fetch>(async () => json({ result: 1 }));
    const client = new PublicGithubClient(fetcher, () => now);
    await Promise.all([client.request('/repos/o/r', signal()), client.request('/repos/o/r', signal())]);
    await client.request('/repos/o/r', signal());
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][1]).toMatchObject({ credentials: 'omit', redirect: 'error' });
    expect(fetcher.mock.calls[0][1]?.headers).not.toHaveProperty('Authorization');
    now = 300001;
    await client.request('/repos/o/r', signal());
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it.each([[404, 'not_found'], [403, 'rate_limit'], [429, 'rate_limit'], [500, 'network']] as const)('classifies HTTP %i without retries', async (status, code) => {
    const fetcher = vi.fn<typeof fetch>(async () => json({}, status));
    await expect(new PublicGithubClient(fetcher).request('/repos/o/r', signal())).rejects.toMatchObject({ code });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('limits downloads and rejects malformed JSON', async () => {
    const large = vi.fn<typeof fetch>(async () => new Response('{}', { headers: { 'content-length': '3000000' } }));
    await expect(new PublicGithubClient(large).request('/repos/o/r', signal())).rejects.toMatchObject({ code: 'response_limit' });
    const malformed = vi.fn<typeof fetch>(async () => new Response('not json'));
    await expect(new PublicGithubClient(malformed).request('/repos/o/r', signal())).rejects.toMatchObject({ code: 'malformed' });
  });
  it('cancels a subscriber while allowing the other deduplicated subscriber to finish', async () => {
    let finish: ((value: Response) => void) | undefined;
    const fetcher = vi.fn<typeof fetch>(() => new Promise(resolve => { finish = resolve; }));
    const client = new PublicGithubClient(fetcher);
    const abort = new AbortController();
    const first = client.request('/repos/o/r', abort.signal);
    const firstCheck = expect(first).rejects.toMatchObject({ code: 'cancelled' });
    const second = client.request('/repos/o/r', signal());
    abort.abort(); finish!(json({ ok: true }));
    await firstCheck; await expect(second).resolves.toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('times out once and aborts the actual request', async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
    }));
    const promise = new PublicGithubClient(fetcher, Date.now, 25).request('/repos/o/r', signal());
    const check = expect(promise).rejects.toMatchObject({ code: 'timeout' });
    await vi.advanceTimersByTimeAsync(30); await check;
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('does not fetch already-cancelled work or retry offline errors', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => { throw new TypeError('offline'); });
    const abort = new AbortController(); abort.abort();
    const client = new PublicGithubClient(fetcher);
    await expect(client.request('/repos/o/r', abort.signal)).rejects.toMatchObject({ code: 'cancelled' });
    expect(fetcher).not.toHaveBeenCalled();
    await expect(client.request('/repos/o/r', signal())).rejects.toMatchObject({ code: 'network' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('bounds the cache and aborts upstream when its last subscriber cancels', async () => {
    const fetcher = vi.fn<typeof fetch>(async () => json({ ok: true }));
    const client = new PublicGithubClient(fetcher);
    for (let index = 0; index < 33; index++) await client.request(`/repos/owner/repo${index}`, signal());
    await client.request('/repos/owner/repo0', signal());
    expect(fetcher).toHaveBeenCalledTimes(34);
    let aborted = false;
    const slow = vi.fn<typeof fetch>((_url, options) => new Promise((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => { aborted = true; reject(new DOMException('aborted', 'AbortError')); });
    }));
    const controller = new AbortController();
    const request = new PublicGithubClient(slow).request('/repos/o/r', controller.signal);
    const check = expect(request).rejects.toMatchObject({ code: 'cancelled' });
    controller.abort(); await check;
    expect(aborted).toBe(true);
  });
});

describe('pinned GitHub filesystem', () => {
  function repository(entries: unknown[]) {
    const fetcher = vi.fn<typeof fetch>(async input => {
      const url = String(input);
      if (url.endsWith('/repos/owner/sample')) return json({ private: false, default_branch: 'main' });
      if (url.endsWith('/commits/main')) return json({ sha: sha('a'), commit: { tree: { sha: sha('b') } } });
      if (url.endsWith(`/git/trees/${sha('b')}`)) return json({ tree: entries });
      if (url.endsWith(`/git/blobs/${sha('c')}`)) return json(textBlob('Hello, Málaga 👋\n<script>literal text</script>'));
      throw new Error('unexpected route');
    });
    return { service: new GithubRepositoryService(new PublicGithubClient(fetcher)), fetcher };
  }
  it('pins the default branch to immutable commit/tree and reads Unicode text as data', async () => {
    const { service, fetcher } = repository([{ path: 'file with spaces.txt', sha: sha('c'), mode: '100644', size: 60 }]);
    expect((await service.mount(project, signal())).commit).toBe(sha('a'));
    expect(await service.cat(project, 'file with spaces.txt', signal())).toContain('Málaga 👋');
    expect(fetcher.mock.calls.every(([url]) => String(url).startsWith('https://api.github.com/repos/owner/sample'))).toBe(true);
    expect(fetcher.mock.calls.some(([url]) => String(url).includes('download_url'))).toBe(false);
  });
  it.each(['120000', '160000'])('blocks link mode %s before fetching its target', async mode => {
    const { service, fetcher } = repository([{ path: 'link', sha: sha('c'), mode }]);
    await expect(service.cat(project, 'link', signal())).rejects.toMatchObject({ code: 'blocked' });
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
  it('blocks large files before download and caps directory entries', async () => {
    const { service, fetcher } = repository([{ path: 'big.txt', sha: sha('c'), mode: '100644', size: MAX_TEXT_BYTES + 1 }]);
    await expect(service.cat(project, 'big.txt', signal())).rejects.toMatchObject({ code: 'large' });
    expect(fetcher).toHaveBeenCalledTimes(3);
    const many = repository(Array.from({ length: 1001 }, (_, i) => ({ path: `file${i}`, sha: sha('c'), mode: '100644' })));
    const list = await many.service.list(project, '', signal());
    expect(list.entries).toHaveLength(1000); expect(list.limited).toBe(true);
  });
  it('rejects missing paths and malformed tree entries without arbitrary downloads', async () => {
    const first = repository([]);
    await expect(first.service.cat(project, 'missing', signal())).rejects.toMatchObject({ code: 'missing' });
    const second = repository([{ path: '../outside', sha: sha('c'), mode: '100644' }]);
    await expect(second.service.list(project, '', signal())).rejects.toMatchObject({ code: 'malformed' });
  });
  it('rejects invalid repository URLs without network calls', async () => {
    const { service, fetcher } = repository([]);
    await expect(service.mount({ ...project, githubUrl: 'https://evil.test/a/b' }, signal())).rejects.toMatchObject({ code: 'repo' });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('rejects oversized, malformed, binary and invalid UTF-8 blobs', () => {
    expect(() => decodeGithubText({ ...textBlob('x'), size: MAX_TEXT_BYTES + 1 })).toThrow();
    expect(() => decodeGithubText({ size: 3, encoding: 'base64', content: '!!!' })).toThrow();
    expect(() => decodeGithubText(textBlob('a\u0000b'))).toThrow();
    expect(() => decodeGithubText({ size: 1, encoding: 'base64', content: '/w==' })).toThrow();
  });
});
