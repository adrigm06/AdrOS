import type { RepositoryTarget } from '../browser.js';
import { GithubRepositoryService, type Entry, type Mount } from '../terminal/repo-filesystem.js';
import { TerminalError, type TerminalProject } from '../terminal/types.js';

export interface RepositoryPage { mount: Mount; directory: boolean; entries: Entry[]; limited: boolean; text?: string; textError?: unknown; readme?: { path: string; text?: string; error?: unknown } }
export function projectForRepository(target: RepositoryTarget): TerminalProject {
  return { id: `${target.owner}/${target.repository}`, title: target.repository, githubUrl: `https://github.com/${target.owner}/${target.repository}`, demoUrl: '', zone: '', status: '', stack: [], description: { en: '', es: '' } };
}

export async function loadRepositoryPage(service: GithubRepositoryService, target: RepositoryTarget, signal: AbortSignal): Promise<RepositoryPage> {
  const project = projectForRepository(target), path = target.path ?? '';
  const { mount, node } = await service.locate(project, path, signal, target.ref);
  if (signal.aborted) throw new TerminalError('cancelled');
  if (!node.directory) {
    try { return { mount, directory: false, entries: [], limited: false, text: await service.cat(project, path, signal, mount.commit) }; }
    catch (error) { if (signal.aborted) throw error; return { mount, directory: false, entries: [], limited: false, textError: error }; }
  }
  const listing = await service.list(project, path, signal, mount.commit);
  const entries = [...listing.entries].sort((a, b) => Number(b.directory) - Number(a.directory) || a.name.localeCompare(b.name));
  const readme = entries.filter(entry => !entry.directory && !entry.blocked && /^readme(?:\.(?:md|markdown|txt|rst))?$/i.test(entry.name))
    .sort((a, b) => Number(!/\.md$/i.test(a.name)) - Number(!/\.md$/i.test(b.name)))[0];
  const result: RepositoryPage = { mount, directory: true, entries, limited: listing.limited };
  if (readme) {
    const readmePath = [path, readme.name].filter(Boolean).join('/');
    try { result.readme = { path: readmePath, text: await service.cat(project, readmePath, signal, mount.commit) }; }
    catch (error) { if (signal.aborted) throw error; result.readme = { path: readmePath, error }; }
  }
  if (signal.aborted) throw new TerminalError('cancelled');
  return result;
}
