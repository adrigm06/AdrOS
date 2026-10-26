import { useEffect, useRef } from 'react';
import type { Lang } from '@/hooks/useLanguage';
import type { TerminalSession } from '@/hooks/useTerminalSession';
import { terminalCopy } from '@/i18n/terminal';

export default function TerminalWindow({ lang, session }: { lang: Lang; session: TerminalSession }) {
  const t = terminalCopy[lang];
  const output = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { if (output.current) output.current.scrollTop = output.current.scrollHeight; }, [session.entries, session.pending]);
  return <section className="terminal-app" aria-label="AdrOS Terminal" onKeyDown={event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'l') { event.preventDefault(); session.clear(); }
    if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      const selected = window.getSelection()?.toString() || (input.current && document.activeElement === input.current && input.current.selectionStart !== input.current.selectionEnd);
      if (!selected) { event.preventDefault(); session.cancel(); input.current?.focus(); }
    }
  }}>
    <div className="terminal-output" ref={output} role="log" aria-label={lang === 'es' ? 'Salida de terminal' : 'Terminal output'} aria-live="off" tabIndex={0}>
      {session.entries.map(entry => <pre key={entry.id} className={entry.kind === 'command' ? 'terminal-command' : entry.kind === 'error' ? 'terminal-error' : ''}>{entry.text}</pre>)}
    </div>
    <div className="terminal-suggestions" aria-label={t.suggestions}>
      {['help', 'ls', 'projects', 'tour', 'hire'].map(command => <button className="browser-tool" disabled={session.pending} key={command} onClick={() => { void session.run(command); input.current?.focus(); }}>{command}</button>)}
      {session.tour !== null && <button className="browser-tool" disabled={session.pending} onClick={() => void session.run('tour next')}>tour next →</button>}
    </div>
    <form className="terminal-prompt" onSubmit={event => { event.preventDefault(); void session.run(); }}>
      <label htmlFor="terminal-command" className="terminal-command shrink-0" title={session.cwd}>$ <span className="sr-only">{t.input}</span></label>
      <input autoFocus ref={input} id="terminal-command" value={session.input} maxLength={1024} placeholder={t.placeholder} onChange={event => session.setInput(event.target.value)}
        autoCapitalize="none" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="go" onKeyDown={event => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); session.historyMove(event.key === 'ArrowUp' ? -1 : 1); }
          if (event.key === 'Tab' && !event.shiftKey) { event.preventDefault(); void session.complete(); }
        }} />
      <button className="browser-tool" type="submit" disabled={session.pending} aria-label={lang === 'es' ? 'Ejecutar comando' : 'Run command'}>↵</button>
    </form>
    <div className="terminal-status" role="status">
      <span className="truncate">{session.pending ? t.running : session.cwd}</span>
      {session.pending && <button className="browser-tool" onClick={session.cancel}>{t.cancel}</button>}
    </div>
  </section>;
}
