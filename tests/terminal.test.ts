import { describe, expect, it } from 'vitest';
import { parseCommand, normalizePath } from '../src/lib/terminal/parser.js';
import { createVirtualFiles } from '../src/lib/terminal/filesystem.js';
import { runCommand } from '../src/lib/terminal/commands.js';
import { GithubRepositoryService } from '../src/lib/terminal/repo-filesystem.js';
import type { TerminalContext, CommandState } from '../src/lib/terminal/types.js';
import { completeCommand } from '../src/lib/terminal/completion.js';
import { addHistory, appendTranscript } from '../src/lib/terminal/journal.js';

const projects = [{ id: 'sample', title: 'Sample Project', description: { en: 'A useful app', es: 'Una app útil' }, zone: 'android', stack: ['Kotlin'], githubUrl: 'https://github.com/example/sample', demoUrl: 'https://example.com', status: 'active' }];
const context: TerminalContext = { projects, lang: 'en', github: new GithubRepositoryService() };
const state: CommandState = { cwd: '/', history: ['ls'], tour: null };
const execute = (line: string, override = state) => runCommand(line, context, override, new AbortController().signal);

describe('terminal parser and virtual files', () => {
  it('parses quotes, escapes and empty arguments without evaluation', () => {
    expect(parseCommand('open "Sample Project"')).toEqual(['open', 'Sample Project']);
    expect(parseCommand("cat 'file with spaces' \"\"")).toEqual(['cat', 'file with spaces', '']);
    expect(parseCommand('cd folder\\ name')).toEqual(['cd', 'folder name']);
    expect(() => parseCommand('ls; rm -rf /')).toThrow();
    expect(() => parseCommand('cat "unterminated')).toThrow();
  });
  it('clamps traversal at root and derives project metadata', () => {
    expect(normalizePath('/projects/sample', '../../../documents')).toBe('/documents');
    const files = createVirtualFiles(projects, 'en');
    expect(files.get('/projects/sample/README.md')?.text).toContain('A useful app');
    expect(files.has('/projects/sample/repo')).toBe(true);
  });
});
describe('terminal commands', () => {
  it('lists projects and validates directories before mutation', async () => {
    expect((await execute('ls /projects')).output).toContain('sample/');
    await expect(execute('cd missing')).rejects.toThrow();
    await expect(execute('cd ""')).rejects.toThrow();
    expect((await execute('cd /projects/sample')).cwd).toBe('/projects/sample');
    expect((await execute('pwd')).output).toBe('/');
  });
  it('completes commands, project names and virtual paths without remote work', async () => {
    expect((await completeCommand('hel', '/', context, new AbortController().signal)).input).toBe('help ');
    expect((await completeCommand('cd /proj', '/', context, new AbortController().signal)).input).toBe('cd /projects/');
    expect((await completeCommand('open "Sample', '/', context, new AbortController().signal)).input).toBe('open sample ');
  });
  it('bounds transcript and history in session memory', () => {
    let rows = appendTranscript([], { id: 0, text: 'x'.repeat(300000), kind: 'output' });
    expect(rows[0].text.length).toBeLessThan(200000);
    for (let id = 1; id < 250; id++) rows = appendTranscript(rows, { id, text: 'line', kind: 'output' });
    expect(rows).toHaveLength(200);
    const history = Array.from({ length: 100 }, (_, i) => String(i));
    expect(addHistory(history, 'last')).toHaveLength(100);
    expect(addHistory(history, '99')).toBe(history);
  });
  it('filters by query, stack and zone with clear unsupported-flag errors', async () => {
    expect((await execute('projects useful --stack kotlin --zone ANDROID')).output).toContain('sample');
    expect((await execute('projects --stack rust')).output).toContain('No projects');
    await expect(execute('projects --unknown x')).rejects.toThrow();
  });
  it('opens exact project titles and browser/document/contact events', async () => {
    expect((await execute('open "Sample Project"')).action).toEqual({ kind: 'project', id: 'sample' });
    expect((await execute('open sample --demo')).action).toEqual({ kind: 'browser', url: 'https://example.com' });
    expect((await execute('cv')).action).toEqual({ kind: 'cv' });
    expect((await execute('contact')).action).toEqual({ kind: 'contact' });
    expect((await execute('open "Sample Project"', { ...state, cwd: '/projects/sample' })).action).toEqual({ kind: 'project', id: 'sample' });
    await expect(execute('open /projects/sample/missing')).rejects.toThrow();
  });
  it('keeps tour progress explicit and recruiter content factual', async () => {
    expect((await execute('tour')).tour).toBe(0);
    expect((await execute('tour next', { ...state, tour: 0 })).tour).toBe(1);
    expect((await execute('tour exit')).tour).toBeNull();
    expect((await execute('hire')).output).toContain('cv');
    expect((await execute('help cd')).output).toContain('cd');
    await expect(execute('sudo ls')).rejects.toThrow();
  });
});
