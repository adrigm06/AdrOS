import { PERSONAL } from '../data/personal.js';

export type BrowserTarget =
  | { kind: 'profile'; url: string }
  | { kind: 'repository'; url: string; owner: string; repository: string }
  | { kind: 'website'; url: string };

export interface BrowserHistory { entries: BrowserTarget[]; index: number }
export const BROWSER_HOME: BrowserTarget = { kind: 'profile', url: PERSONAL.github };
export const initialBrowserHistory = (): BrowserHistory => ({ entries: [BROWSER_HOME], index: 0 });

export function parseBrowserTarget(value: string): BrowserTarget | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    if (url.hostname === 'github.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length === 1 && parts[0].toLowerCase() === 'adrigm06') return BROWSER_HOME;
      if (parts.length !== 2 || !parts.every(part => /^[\w.-]+$/.test(part))) return null;
      return { kind: 'repository', url: `https://github.com/${parts.join('/')}`, owner: parts[0], repository: parts[1] };
    }
    return { kind: 'website', url: url.href };
  } catch { return null; }
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
