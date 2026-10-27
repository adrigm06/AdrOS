import { useEffect, useState } from 'react';
import type { Lang } from '@/hooks/useLanguage';
import type { BrowserTarget } from '@/lib/browser';
import { parseProfile, parseRepository, type PublicProfile, type PublicRepository } from '@/lib/github-public';
import { PERSONAL } from '@/data/personal';
import RepositoryView from './RepositoryView';
import type { GithubRepositoryService } from '@/lib/terminal/repo-filesystem';
import type { RepositoryTarget } from '@/lib/browser';

interface Props { target: Exclude<BrowserTarget, { kind: 'website' }>; lang: Lang; onNavigate: (url: string) => void; refresh?: boolean }
interface Data { profile: PublicProfile | null; repos: PublicRepository[] }
const cache = new Map<string, Data>();

function GitHubProfileView({ target, lang, onNavigate, refresh = false }: Omit<Props, 'target'> & { target: Extract<BrowserTarget, { kind: 'profile' }> }) {
  const [data, setData] = useState<Data | null>(() => refresh ? null : cache.get(target.url) ?? null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const es = lang === 'es';
  useEffect(() => {
    if (refresh) cache.delete(target.url);
    const cached = cache.get(target.url);
    setData(cached ?? null);
    setError(false);
    if (cached) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    async function load() {
      const urls = ['https://api.github.com/users/adrigm06', 'https://api.github.com/users/adrigm06/repos?sort=updated&per_page=30'];
      try {
        const values: unknown[] = await Promise.all(urls.map(async url => {
          const response = await fetch(url, { signal: controller.signal, credentials: 'omit', headers: { Accept: 'application/vnd.github+json' } });
          if (!response.ok) throw new Error('GitHub unavailable');
          return response.json();
        }));
        const repos = Array.isArray(values[1]) ? values[1] : [];
        const next = { profile: parseProfile(values[0]), repos: repos.map(parseRepository).filter((r): r is PublicRepository => r !== null) };
        if (!cancelled) { cache.set(target.url, next); setData(next); }
      } catch { if (!controller.signal.aborted || !cancelled) setError(true); }
      finally { clearTimeout(timeout); }
    }
    let cancelled = false;
    void load();
    return () => { cancelled = true; clearTimeout(timeout); controller.abort(); };
  }, [target, refresh]);

  if (error) return <div className="p-6 space-y-3" role="status">
    <p>{es ? 'GitHub no está disponible, el repositorio no es público o se ha alcanzado el límite de consultas.' : 'GitHub is unavailable, the repository is not public, or the request limit has been reached.'}</p>
    <a href={target.url} target="_blank" rel="noopener noreferrer" className="text-[var(--os-blue)]">{es ? 'Ver directamente en GitHub' : 'View directly on GitHub'} ↗</a>
  </div>;
  if (!data) return <p className="p-6" role="status">{es ? 'Cargando GitHub…' : 'Loading GitHub…'}</p>;
  const repos = data.repos.filter(repo => `${repo.name} ${repo.description ?? ''} ${repo.language ?? ''}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="flex-1 overflow-y-auto p-5 sm:p-7 select-text">
    {data.profile && <header className="flex gap-4 items-start mb-6">
      <img src={data.profile.avatar_url} alt="Adrián Gómez" width={80} height={80} className="rounded-full shrink-0" />
      <div className="space-y-2"><h2 className="text-xl font-semibold">{data.profile.name}</h2><a className="text-[var(--os-blue)]" href={PERSONAL.github} target="_blank" rel="noopener noreferrer">@adrigm06 ↗</a><p className="text-sm text-[var(--os-text-dim)]">{data.profile.bio}</p></div>
    </header>}
    <div className="flex items-center justify-between gap-3 mb-3"><h3 className="font-semibold">{es ? 'Repositorios recientes' : 'Recent repositories'}</h3>
      <input className="browser-input max-w-[55%]" value={query} onChange={e => setQuery(e.target.value)} aria-label={es ? 'Buscar repositorios' : 'Search repositories'} placeholder={es ? 'Buscar…' : 'Search…'} />
    </div>
    <div className="divide-y divide-[var(--os-border)]">{repos.map(repo => <article key={repo.html_url} className="py-4 space-y-2">
      <button className="text-[var(--os-blue)] text-base font-semibold hover:underline text-left" onClick={() => onNavigate(repo.html_url)}>{repo.name}</button>
      <p className="text-sm text-[var(--os-text-dim)]">{repo.description ?? (es ? 'Sin descripción.' : 'No description.')}</p>
      <p className="text-xs text-[var(--os-muted)]">{repo.language} · ★ {repo.stargazers_count}</p>
    </article>)}</div>
    {repos.length === 0 && <p role="status">{es ? 'No hay resultados.' : 'No results.'}</p>}
  </div>;
}

export default function GitHubView(props: Props & { service: GithubRepositoryService; onCanonical: (expected: string, target: RepositoryTarget) => void }) {
  return props.target.kind === 'repository'
    ? <RepositoryView target={props.target} service={props.service} lang={props.lang} onNavigate={props.onNavigate} onCanonical={props.onCanonical} />
    : <GitHubProfileView target={props.target} lang={props.lang} onNavigate={props.onNavigate} refresh={props.refresh} />;
}
