import { useEffect } from 'react';
import type { RepositoryTarget } from '@/lib/browser';
import { useRepositoryPage } from '@/hooks/useRepositoryPage';
import type { GithubRepositoryService } from '@/lib/terminal/repo-filesystem';
import { repositoryTarget } from '@/lib/repository/navigation';
import { terminalError } from '@/i18n/terminal';
import { repositoryCopy } from '@/i18n/repository';
import RepositoryFile from './RepositoryFile';

interface Props { target: RepositoryTarget; lang: 'es' | 'en'; service: GithubRepositoryService; onNavigate: (url: string) => void; onCanonical: (expected: string, target: RepositoryTarget) => void }
export default function RepositoryView({ target, lang, service, onNavigate, onCanonical }: Props) {
  const { page, error, cancel } = useRepositoryPage(service, target);
  const t = repositoryCopy[lang];
  useEffect(() => {
    if (page) onCanonical(target.url, repositoryTarget({ ...target, ref: page.mount.commit }, target.path ?? '', page.directory ? 'tree' : 'blob'));
  }, [page, target, onCanonical]);
  const path = target.path ?? '', parts = path.split('/').filter(Boolean);
  const root = `https://github.com/${target.owner}/${target.repository}`;
  if (error) return <div className="p-5 space-y-3" role="status"><p>{terminalError(error, lang)}</p><a className="browser-tool" href={target.url} target="_blank" rel="noopener noreferrer">{t.original} ↗</a></div>;
  if (!page) return <div className="p-5 flex items-center gap-3" role="status"><span>{t.loading}</span><button className="browser-tool" onClick={cancel}>{t.cancel}</button></div>;
  const snapshot = { ...target, ref: page.mount.commit };
  const context = { owner: target.owner, repository: target.repository, ref: page.mount.commit, branch: page.mount.branch, path };
  const go = (value: string, directory = true) => onNavigate(repositoryTarget(snapshot, value, directory ? 'tree' : 'blob').url);
  return <div className="repo-view">
    <header className="repo-heading">
      <div className="flex items-center gap-2 flex-wrap min-w-0"><span aria-hidden="true">▣</span><span className="break-all">{target.owner} / <strong>{target.repository}</strong></span><span className="repo-public">{t.public}</span></div>
      <a className="browser-tool" href={path ? target.url : root} target="_blank" rel="noopener noreferrer">{t.original} ↗</a>
      <span className="repo-api">{t.api}</span>
    </header>
    <div className="repo-tabs"><span>⌘ {t.code}</span></div>
    <div className="repo-body">
      {page.mount.description && <p className="mb-4 text-sm text-[var(--os-text-dim)]">{page.mount.description}</p>}
      <div className="flex items-center gap-3 text-xs text-[var(--os-text-dim)] flex-wrap mb-4">
        <span className="repo-branch">⑂ {page.mount.branch}</span><span title={page.mount.commit}>{t.snapshot}: {page.mount.commit.slice(0, 10)}</span>
        {page.mount.language && <span>{page.mount.language}</span>}{page.mount.stars !== null && <span>★ {page.mount.stars}</span>}
      </div>
      <nav className="repo-breadcrumb" aria-label={t.files}>
        <button onClick={() => go('')} title={t.root}>{target.repository}</button>
        {parts.map((part, index) => <span key={index} className="contents"><span aria-hidden="true">/</span><button onClick={() => go(parts.slice(0, index + 1).join('/'), index < parts.length - 1 || page.directory)} aria-current={index === parts.length - 1 ? 'page' : undefined}>{part}</button></span>)}
      </nav>
      {page.directory ? <>
        <section className="repo-panel" aria-label={t.files}>
          <header className="repo-panel-heading"><span>{t.files}</span><span className="font-mono text-xs ml-auto">{page.mount.commit.slice(0, 7)}</span></header>
          {parts.length > 0 && <button className="repo-row" onClick={() => go(parts.slice(0, -1).join('/'))} aria-label={t.back}><span aria-hidden="true">↰</span><span>..</span></button>}
          {page.entries.map(entry => <button key={entry.name} className="repo-row" disabled={entry.blocked} onClick={() => go([path, entry.name].filter(Boolean).join('/'), entry.directory)} title={entry.blocked ? t.blocked : entry.name}>
            <span className="text-[var(--os-blue)]" aria-hidden="true">{entry.blocked ? '↗' : entry.directory ? '▰' : '◇'}</span><span className="min-w-0 break-all">{entry.name}</span>
            <span className="repo-entry-kind">{entry.blocked ? t.blocked : entry.directory ? t.directory : entry.size !== undefined ? `${entry.size.toLocaleString()} B` : t.file}</span>
          </button>)}
          {!page.entries.length && <p className="p-4 text-sm">{t.empty}</p>}
        </section>
        {page.limited && <p className="my-3 text-xs" role="status">{t.limited}</p>}
        {page.readme ? <RepositoryFile text={page.readme.text} error={page.readme.error} context={{ ...context, path: page.readme.path }} lang={lang} onNavigate={onNavigate} /> : <p className="my-5 text-sm text-[var(--os-muted)]">{t.noReadme}</p>}
      </> : <RepositoryFile text={page.text} error={page.textError} context={context} lang={lang} onNavigate={onNavigate} />}
    </div>
  </div>;
}
