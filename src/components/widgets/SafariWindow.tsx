import { useState } from 'react';
import type { Lang } from '@/hooks/useLanguage';
import type { ProjectEntry } from '@/components/os/Desktop';
import { BROWSER_HOME, moveBrowser, navigateBrowser, parseBrowserTarget, resolveBookmarks, type BrowserHistory } from '@/lib/browser';
import BrowserToolbar from './BrowserToolbar';
import GitHubView from './GitHubView';

interface Props {
  lang: Lang;
  projects: ProjectEntry[];
  history: BrowserHistory;
  onHistoryChange: (update: (previous: BrowserHistory) => BrowserHistory) => void;
}

export default function SafariWindow({ lang, projects, history, onHistoryChange }: Props) {
  const [reload, setReload] = useState(0);
  const target = history.entries[history.index] ?? BROWSER_HOME;
  const navigate = (url: string) => {
    const next = parseBrowserTarget(url);
    if (next) onHistoryChange(previous => navigateBrowser(previous, next));
  };
  return <section className="browser-app" aria-label="Safari">
    <BrowserToolbar lang={lang} url={target.url}
      onHome={() => onHistoryChange(previous => navigateBrowser(previous, BROWSER_HOME))}
      onBack={history.index > 0 ? () => onHistoryChange(previous => moveBrowser(previous, -1)) : undefined}
      onForward={history.index < history.entries.length - 1 ? () => onHistoryChange(previous => moveBrowser(previous, 1)) : undefined}
      onReload={() => setReload(value => value + 1)} />
    <nav className="browser-bookmarks" aria-label={lang === 'es' ? 'Marcadores' : 'Bookmarks'}>
      {resolveBookmarks(projects).map(bookmark => <button key={bookmark.id} className="browser-tool whitespace-nowrap" onClick={() => navigate(bookmark.target.url)} aria-current={target.url === bookmark.target.url ? 'page' : undefined}>{bookmark.title}</button>)}
    </nav>
    {target.kind === 'website' ? <div className="flex-1 min-h-0 flex flex-col" key={`${target.url}-${reload}`}>
      <div className="browser-notice">
        <span>{lang === 'es' ? 'La web puede bloquear la vista integrada. Si no aparece, ábrela en otra pestaña.' : 'This website may block embedded previews. If it does not appear, open it in a new tab.'}</span>
        <a href={target.url} target="_blank" rel="noopener noreferrer">{lang === 'es' ? 'Abrir web' : 'Open website'} ↗</a>
      </div>
      <iframe className="flex-1 w-full min-h-0 bg-[var(--os-surface)]" src={target.url} title={target.url} sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" />
    </div> : <GitHubView key={`${target.url}-${reload}`} refresh={reload > 0} target={target} lang={lang} onNavigate={navigate} />}
  </section>;
}
