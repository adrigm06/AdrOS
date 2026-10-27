import { PERSONAL } from '../data/personal.js';

export interface RepositoryTarget { kind: 'repository'; url: string; owner: string; repository: string; path?: string; ref?: string; view?: 'tree' | 'blob' }
export const validRepositoryRef = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{40,64}$/i.test(value);
export type BrowserTarget =
  | { kind: 'profile'; url: string }
  | RepositoryTarget
  | { kind: 'website'; url: string };

export interface BrowserHistory { entries: BrowserTarget[]; index: number }
export const BROWSER_HOME: BrowserTarget = { kind: 'profile', url: PERSONAL.github };
export const initialBrowserHistory = (): BrowserHistory => ({ entries: [BROWSER_HOME], index: 0 });

export function parseBrowserTarget(value: string): BrowserTarget | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    if (url.hostname === 'github.com') {
      const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent);
      if (parts.length === 1 && parts[0].toLowerCase() === 'adrigm06') return BROWSER_HOME;
      if (parts.length < 2 || !parts.slice(0, 2).every(part => /^[\w.-]+$/.test(part))) return null;
      const base = `https://github.com/${parts[0]}/${parts[1]}`;
      if (parts.length === 2) return { kind: 'repository', url: base, owner: parts[0], repository: parts[1] };
      if (!['tree', 'blob'].includes(parts[2]) || !validRepositoryRef(parts[3])) return null;
      const path = parts.slice(4);
      if (path.some(part => part === '.' || part === '..' || part.includes('/') || [...part].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127))) return null;
      return { kind: 'repository', owner: parts[0], repository: parts[1], ref: parts[3], path: path.join('/'), view: parts[2] as 'tree' | 'blob', url: `${base}/${parts[2]}/${parts[3]}${path.length ? `/${path.map(encodeURIComponent).join('/')}` : ''}` };
    }
    return { kind: 'website', url: url.href };
  } catch { return null; }
}

export function replaceBrowserTarget(history: BrowserHistory, expectedUrl: string, target: RepositoryTarget): BrowserHistory {
  if (history.entries[history.index]?.url !== expectedUrl || expectedUrl === target.url) return history;
  return { ...history, entries: history.entries.map((entry, index) => index === history.index ? target : entry) };
}

export function navigateBrowser(history: BrowserHistory, target: BrowserTarget): BrowserHistory {
  if (history.entries[history.index]?.url === target.url) return history;
  const entries = [...history.entries.slice(0, history.index + 1), target].slice(-50);
  return { entries, index: entries.length - 1 };
}

export function moveBrowser(history: BrowserHistory, direction: number): BrowserHistory {
  return { ...history, index: Math.max(0, Math.min(history.entries.length - 1, history.index + direction)) };
}

interface BookmarkProject { data: { id: string; title: string; demoUrl: string; githubUrl: string } }
const BOOKMARKS = [
  ['avisia', 'demoUrl'], ['keyout', 'demoUrl'], ['android-skill-pkg', 'githubUrl'],
  ['betterprompt', 'githubUrl'], ['androbox', 'githubUrl'],
] as const;

export function resolveBookmarks(projects: BookmarkProject[]) {
  return BOOKMARKS.flatMap(([id, destination]) => {
    const project = projects.find(entry => entry.data.id === id);
    const target = project && parseBrowserTarget(project.data[destination]);
    return target ? [{ id, title: project!.data.title, target }] : [];
  });
}
