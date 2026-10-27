import { useState } from 'react';
import RepositoryMarkdown from './RepositoryMarkdown.js';
import { repositoryCopy } from '../../i18n/repository.js';
import { rawRepositoryUrl, type ReadmeContext } from '../../lib/repository/navigation.js';
import { terminalError } from '../../i18n/terminal.js';

interface Props { text?: string; error?: unknown; context: ReadmeContext; lang: 'en' | 'es'; onNavigate: (url: string) => void }
export default function RepositoryFile({ text, error, context, lang, onNavigate }: Props) {
  const markdown = /(?:\.md|\.markdown|(?:^|\/)readme)$/i.test(context.path);
  const [preview, setPreview] = useState(markdown);
  const t = repositoryCopy[lang], lines = (text ?? '').split('\n');
  return <section className="repo-panel">
    <header className="repo-panel-heading flex-wrap">
      <span className="font-mono text-xs min-w-0 break-all">{context.path.split('/').at(-1)}</span>
      <div className="flex flex-wrap items-center gap-1 ml-auto">
        {text !== undefined && markdown && <>
          <button className="browser-tool" aria-pressed={preview} onClick={() => setPreview(true)}>{t.preview}</button>
          <button className="browser-tool" aria-pressed={!preview} onClick={() => setPreview(false)}>{t.source}</button>
        </>}
        <a className="browser-tool" href={rawRepositoryUrl(context, context.path)} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{t.raw} ↗</a>
      </div>
    </header>
    {error ? <p className="p-4 text-[var(--os-text-dim)]" role="status">{terminalError(error, lang)}</p> : text !== undefined && (
      preview && markdown ? <RepositoryMarkdown text={text} context={context} lang={lang} onNavigate={onNavigate} /> : <div className="repo-source" tabIndex={0} aria-label={`${context.path}, ${lines.length} ${t.lines}`}>
        <div className="flex min-w-max"><pre className="repo-line-numbers" aria-hidden="true">{lines.map((_, index) => index + 1).join('\n')}</pre><pre className="repo-file-text"><code>{text}</code></pre></div>
      </div>
    )}
  </section>;
}
