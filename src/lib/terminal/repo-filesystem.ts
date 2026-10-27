import { isRecord } from '../github-public.js';
import { parseBrowserTarget, validRepositoryRef } from '../browser.js';
import { PublicGithubClient } from './github-client.js';
import { TerminalError, type TerminalProject } from './types.js';
import { containsControl } from './parser.js';

export const MAX_TEXT_BYTES = 128 * 1024;
export interface Mount { base: string; branch: string; commit: string; tree: string; description: string; language: string | null; stars: number | null }
export interface Entry { name: string; sha: string; directory: boolean; blocked: boolean; size?: number }
export interface Listing { entries: Entry[]; limited: boolean }
const validSha = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{40,64}$/i.test(value);

export function decodeGithubText(value: unknown): string {
  if (!isRecord(value) || value.encoding !== 'base64' || typeof value.content !== 'string' || typeof value.size !== 'number') throw new TerminalError('malformed');
  if (value.size > MAX_TEXT_BYTES || value.content.length > MAX_TEXT_BYTES * 1.5) throw new TerminalError('large');
  let bytes: Uint8Array;
  try { bytes = Uint8Array.from(atob(value.content.replace(/\s/g, '')), character => character.charCodeAt(0)); }
  catch { throw new TerminalError('malformed'); }
  if (bytes.length > MAX_TEXT_BYTES) throw new TerminalError('large');
  if (bytes.length !== value.size) throw new TerminalError('malformed');
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    if ([...text].some(character => containsControl(character) && !['\t', '\n', '\r'].includes(character))) throw new TerminalError('binary');
    return text;
  } catch (error) { if (error instanceof TerminalError) throw error; throw new TerminalError('binary'); }
}

export class GithubRepositoryService {
  private mounts = new Map<string, Mount>();
  constructor(private client = new PublicGithubClient()) {}

  async mount(project: TerminalProject, signal: AbortSignal, ref?: string): Promise<Mount> {
    if (signal.aborted) throw new TerminalError('cancelled');
    if (ref !== undefined && !validRepositoryRef(ref)) throw new TerminalError('path');
    const key = `${project.id}@${ref ?? 'default'}`;
    const current = this.mounts.get(key);
    if (current) return current;
    const target = parseBrowserTarget(project.githubUrl);
    if (!target || target.kind !== 'repository') throw new TerminalError('repo');
    const base = `/repos/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repository)}`;
    const metadata = await this.client.request(base, signal);
    if (!isRecord(metadata) || metadata.private !== false || typeof metadata.default_branch !== 'string') throw new TerminalError('malformed');
    const branch = metadata.default_branch;
    const commit = await this.client.request(`${base}/commits/${encodeURIComponent(ref ?? branch)}`, signal);
    if (!isRecord(commit) || !validSha(commit.sha) || !isRecord(commit.commit) || !isRecord(commit.commit.tree) || !validSha(commit.commit.tree.sha)) throw new TerminalError('malformed');
    if (ref && commit.sha.toLowerCase() !== ref.toLowerCase()) throw new TerminalError('malformed');
    const mount = { base, branch, commit: commit.sha, tree: commit.commit.tree.sha,
      description: typeof metadata.description === 'string' ? metadata.description : '',
      language: typeof metadata.language === 'string' ? metadata.language : null,
      stars: typeof metadata.stargazers_count === 'number' ? metadata.stargazers_count : null };
    if (signal.aborted) throw new TerminalError('cancelled');
    this.mounts.set(key, mount);
    this.mounts.set(`${project.id}@${mount.commit}`, mount);
    while (this.mounts.size > 32) this.mounts.delete(this.mounts.keys().next().value!);
    return mount;
  }

  private async tree(mount: Mount, sha: string, signal: AbortSignal): Promise<Listing> {
    const data = await this.client.request(`${mount.base}/git/trees/${sha}`, signal);
    if (!isRecord(data) || !Array.isArray(data.tree)) throw new TerminalError('malformed');
    const entries = data.tree.slice(0, 1000).map((value): Entry => {
      if (!isRecord(value) || typeof value.path !== 'string' || !value.path || value.path === '.' || value.path === '..' || value.path.includes('/') || containsControl(value.path) || !validSha(value.sha)) throw new TerminalError('malformed');
      return { name: value.path, sha: value.sha, directory: value.mode === '040000', blocked: !['040000', '100644', '100755'].includes(String(value.mode)), size: typeof value.size === 'number' ? value.size : undefined };
    });
    return { entries, limited: data.truncated === true || data.tree.length >= 1000 };
  }

  async locate(project: TerminalProject, path: string, signal: AbortSignal, ref?: string) {
    const mount = await this.mount(project, signal, ref);
    let node: Entry = { name: '', sha: mount.tree, directory: true, blocked: false };
    for (const part of path.split('/').filter(Boolean)) {
      if (part === '.' || part === '..') throw new TerminalError('path');
      if (!node.directory) throw new TerminalError('directory', part);
      const listing = await this.tree(mount, node.sha, signal);
      const entry = listing.entries.find(item => item.name === part);
      if (!entry) throw new TerminalError('missing', `${part}${listing.limited ? ' (directory limit)' : ''}`);
      if (entry.blocked) throw new TerminalError('blocked', part);
      node = entry;
    }
    return { mount, node };
  }

  async list(project: TerminalProject, path: string, signal: AbortSignal, ref?: string): Promise<Listing> {
    const { mount, node } = await this.locate(project, path, signal, ref);
    if (!node.directory) throw new TerminalError('directory', path);
    return this.tree(mount, node.sha, signal);
  }

  async cat(project: TerminalProject, path: string, signal: AbortSignal, ref?: string): Promise<string> {
    const { mount, node } = await this.locate(project, path, signal, ref);
    if (node.directory) throw new TerminalError('file', path);
    if ((node.size ?? 0) > MAX_TEXT_BYTES) throw new TerminalError('large');
    if (/\.(?:png|jpe?g|gif|webp|pdf|zip|gz|exe|dll|woff2?|ttf|ico|mp[34]|bin)$/i.test(node.name)) throw new TerminalError('binary');
    return decodeGithubText(await this.client.request(`${mount.base}/git/blobs/${node.sha}`, signal));
  }
  clear() { this.mounts.clear(); this.client.clear(); }
}
