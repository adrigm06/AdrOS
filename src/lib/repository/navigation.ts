import { parseBrowserTarget, validRepositoryRef, type RepositoryTarget } from '../browser.js';
import { normalizePath, containsControl } from '../terminal/parser.js';
import { TerminalError } from '../terminal/types.js';

export interface ReadmeContext { owner: string; repository: string; ref: string; branch: string; path: string }
export type ReadmeLink = { kind: 'repository'; target: RepositoryTarget } | { kind: 'external'; url: string } | { kind: 'anchor'; anchor: string };

export function repositoryTarget(target: Pick<RepositoryTarget, 'owner' | 'repository' | 'ref'>, path: string, view: 'tree' | 'blob' = 'tree'): RepositoryTarget {
  if (!validRepositoryRef(target.ref) || !/^[\w.-]+$/.test(target.owner) || !/^[\w.-]+$/.test(target.repository)) throw new TerminalError('path');
  const normalized = normalizePath('/', path).slice(1);
  return { kind: 'repository', owner: target.owner, repository: target.repository, ref: target.ref, path: normalized, view,
    url: `https://github.com/${target.owner}/${target.repository}/${view}/${target.ref}${normalized ? `/${normalized.split('/').map(encodeURIComponent).join('/')}` : ''}` };
}

export function resolveReadmeLink(value: string, context: ReadmeContext): ReadmeLink | null {
  const href = value.trim().replace(/&amp;/g, '&');
  if (!href || containsControl(href) || href.startsWith('//')) return null;
  try {
    if (href.startsWith('#')) return { kind: 'anchor', anchor: decodeURIComponent(href.slice(1)) };
    if (/^[a-z][\w+.-]*:/i.test(href)) {
      const url = new URL(href);
      if (url.protocol !== 'https:' || url.username || url.password) return null;
      const root = `/${context.owner}/${context.repository}/`;
      if (url.hostname === 'github.com' && url.pathname.toLowerCase().startsWith(root.toLowerCase())) {
        const suffix = decodeURIComponent(url.pathname.slice(root.length));
        const match = /^(tree|blob)\/(.*)$/.exec(suffix);
        if (match) {
          const ref = [context.ref, context.branch].find(candidate => match[2] === candidate || match[2].startsWith(`${candidate}/`));
          if (ref) return { kind: 'repository', target: repositoryTarget(context, match[2].slice(ref.length).replace(/^\//, ''), match[1] as 'tree' | 'blob') };
        }
        const target = parseBrowserTarget(url.href);
        if (target?.kind === 'repository') return { kind: 'repository', target };
      }
      return { kind: 'external', url: url.href };
    }
    const url = new URL(href, 'https://relative.invalid/');
    const directory = context.path.split('/').slice(0, -1).join('/');
    const decoded = decodeURIComponent(url.pathname.slice(1));
    const path = normalizePath(`/${directory}`, href.startsWith('/') ? `/${decoded}` : decodeURIComponent(href.split(/[?#]/)[0]));
    const target = repositoryTarget(context, path, href.endsWith('/') ? 'tree' : 'blob');
    return { kind: 'repository', target };
  } catch { return null; }
}

export function rawRepositoryUrl(context: Pick<ReadmeContext, 'owner' | 'repository' | 'ref'>, path: string): string {
  const target = repositoryTarget(context, path, 'blob');
  return `https://raw.githubusercontent.com/${target.owner}/${target.repository}/${target.ref}/${target.path!.split('/').map(encodeURIComponent).join('/')}`;
}
