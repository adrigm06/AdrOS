import { useEffect, useRef, useState } from 'react';
import { terminalCopy, terminalError } from '@/i18n/terminal';
import { runCommand } from '@/lib/terminal/commands';
import { completeCommand } from '@/lib/terminal/completion';
import { addHistory, appendTranscript, type TranscriptEntry } from '@/lib/terminal/journal';
import { GithubRepositoryService } from '@/lib/terminal/repo-filesystem';
import type { CommandState, TerminalAction, TerminalLanguage, TerminalProject } from '@/lib/terminal/types';

interface SessionState extends CommandState { input: string; entries: TranscriptEntry[]; pending: boolean; historyIndex: number; savedInput: string }
const initial = (lang: TerminalLanguage): SessionState => ({ cwd: '/', input: '', entries: [{ id: 0, text: terminalCopy[lang].welcome, kind: 'output' }], history: [], tour: null, pending: false, historyIndex: -1, savedInput: '' });

export function useTerminalSession(projects: TerminalProject[], lang: TerminalLanguage, onAction: (action: TerminalAction) => void) {
  const [state, setState] = useState(() => initial(lang));
  const github = useRef(new GithubRepositoryService());
  const active = useRef<AbortController | null>(null);
  const version = useRef(0);
  const nextId = useRef(1);
  const context = { projects, lang, github: github.current };
  useEffect(() => () => { version.current++; active.current?.abort(); active.current = null; }, []);
  const append = (text: string, kind: TranscriptEntry['kind'] = 'output') => {
    if (text) setState(previous => ({ ...previous, entries: appendTranscript(previous.entries, { id: nextId.current++, text, kind }) }));
  };
  const cancel = () => {
    version.current++; active.current?.abort(); active.current = null;
    setState(previous => ({ ...previous, input: '', pending: false, historyIndex: -1, entries: appendTranscript(previous.entries, { id: nextId.current++, text: '^C', kind: 'output' }) }));
  };
  const reset = () => {
    version.current++; active.current?.abort(); active.current = null;
    github.current = new GithubRepositoryService(); setState(initial(lang));
  };
  const run = async (raw = state.input) => {
    if (active.current || !raw.trim()) return;
    const controller = new AbortController(), id = ++version.current;
    active.current = controller;
    const history = addHistory(state.history, raw);
    setState(previous => ({ ...previous, pending: true, input: '', history, historyIndex: -1, entries: appendTranscript(previous.entries, { id: nextId.current++, text: `visitor@adros:${state.cwd} $ ${raw}`, kind: 'command' }) }));
    try {
      const result = await runCommand(raw, context, { ...state, history }, controller.signal);
      if (id !== version.current || controller.signal.aborted) return;
      setState(previous => ({ ...previous, cwd: result.cwd ?? previous.cwd, tour: result.tour === undefined ? previous.tour : result.tour, entries: result.clear ? [] : previous.entries }));
      append(result.output);
      if (result.action) onAction(result.action);
    } catch (error) { if (id === version.current) append(terminalError(error, lang), 'error'); }
    finally { if (id === version.current) { active.current = null; setState(previous => ({ ...previous, pending: false })); } }
  };
  const complete = async () => {
    if (active.current) return;
    const controller = new AbortController(), id = ++version.current, input = state.input;
    active.current = controller; setState(previous => ({ ...previous, pending: true }));
    try {
      const result = await completeCommand(input, state.cwd, context, controller.signal);
      if (id !== version.current) return;
      setState(previous => ({ ...previous, input: previous.input === input ? result.input : previous.input }));
      if (result.candidates.length > 1) append(result.candidates.join('  '));
    } catch (error) { if (id === version.current) append(terminalError(error, lang), 'error'); }
    finally { if (id === version.current) { active.current = null; setState(previous => ({ ...previous, pending: false })); } }
  };
  const historyMove = (direction: number) => setState(previous => {
    if (!previous.history.length) return previous;
    const current = previous.historyIndex < 0 ? previous.history.length : previous.historyIndex;
    const index = Math.max(0, Math.min(previous.history.length, current + direction));
    const savedInput = previous.historyIndex < 0 ? previous.input : previous.savedInput;
    return { ...previous, savedInput, historyIndex: index, input: previous.history[index] ?? savedInput };
  });
  return { ...state, run, complete, cancel, reset, historyMove,
    setInput: (input: string) => setState(previous => ({ ...previous, input, historyIndex: -1 })),
    clear: () => setState(previous => ({ ...previous, entries: [] })),
  };
}
export type TerminalSession = ReturnType<typeof useTerminalSession>;
