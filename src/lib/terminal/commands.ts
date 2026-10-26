import { PROFILE } from '../../data/profile.js';
import { terminalCopy } from '../../i18n/terminal.js';
import { parseBrowserTarget } from '../browser.js';
import { createVirtualFiles, localChildren, repositoryPath } from './filesystem.js';
import { normalizePath, parseCommand } from './parser.js';
import { COMMANDS, filterProjects, findProject, recruiterSummary, tourCommand, USAGE } from './project-commands.js';
import { TerminalError, type CommandResult, type CommandState, type TerminalContext } from './types.js';

export async function listPath(path: string, context: TerminalContext, signal: AbortSignal) {
  const remote = repositoryPath(context.projects, path);
  if (remote) return context.github.list(remote.project, remote.path, signal);
  const files = createVirtualFiles(context.projects, context.lang);
  const node = files.get(path);
  if (!node) throw new TerminalError('missing', path);
  if (node.kind === 'file') throw new TerminalError('directory', path);
  return { entries: localChildren(files, path), limited: false };
}

function help(command: string | undefined, context: TerminalContext): CommandResult {
  if (!command) return { output: terminalCopy[context.lang].help };
  if (!USAGE[command]) throw new TerminalError('command', command);
  const examples: Record<string, string> = {
    ls: 'ls /projects', cd: 'cd /projects\ncd ..\ncd /', cat: 'cat /about/profile.txt\ncat "file with spaces.txt"',
    open: 'open <id>\nopen <id> --demo\nopen <id> --github\nopen /documents/CV.pdf',
    repo: 'repo <id>\nls\ncd src\ncat README.md', projects: 'projects --stack Kotlin\nprojects AI --zone ai-tools',
    tour: 'tour\ntour next\ntour back\ntour exit', hire: 'hire\ncv\ncontact',
  };
  return { output: `${USAGE[command]}\n${examples[command] ?? ''}${command === 'repo' ? `\n\n${terminalCopy[context.lang].help.split('\n').at(-1)}` : ''}` };
}

export async function runCommand(input: string, context: TerminalContext, state: CommandState, signal: AbortSignal): Promise<CommandResult> {
  const words = parseCommand(input);
  if (!words.length) return { output: '' };
  const command = words[0].toLowerCase(), args = words.slice(1), t = terminalCopy[context.lang];
  if (!COMMANDS.includes(command)) throw new TerminalError('command', `${command}. help`);
  if (args.includes('--help')) return help(command, context);
  if (command === 'help') {
    if (args.length > 1) throw new TerminalError('usage', USAGE.help);
    return help(args[0], context);
  }
  if (command === 'projects') return filterProjects(args, context);
  if (command === 'tour') return tourCommand(args, state, context);
  if (['pwd', 'clear', 'history', 'whoami', 'cv', 'contact', 'hire'].includes(command)) {
    if (args.length) throw new TerminalError('usage', USAGE[command]);
    if (command === 'pwd') return { output: state.cwd };
    if (command === 'clear') return { output: '', clear: true };
    if (command === 'history') return { output: state.history.map((line, index) => `${index + 1}  ${line}`).join('\n') };
    if (command === 'whoami') return { output: `${PROFILE[context.lang].name}\n${PROFILE[context.lang].role}\n${PROFILE[context.lang].bio}` };
    if (command === 'hire') return recruiterSummary(context);
    return { output: t.opened, action: { kind: command as 'cv' | 'contact' } };
  }
  if (command === 'repo') {
    if (args.length > 1) throw new TerminalError('usage', USAGE.repo);
    const project = findProject(context, args[0], state.cwd);
    const mount = await context.github.mount(project, signal);
    return { cwd: `/projects/${project.id}/repo`, output: `${t.snapshot}: ${mount.branch} @ ${mount.commit.slice(0, 12)}\nls · cd <folder> · cat <file>` };
  }
  if (command === 'open') {
    if (args.length < 1 || args.length > 2 || !args[0] || (args[1] && !['--demo', '--github'].includes(args[1]))) throw new TerminalError('usage', USAGE.open);
    const path = normalizePath(state.cwd, args[0]);
    if (path === '/documents/CV.pdf' && !args[1]) return { output: t.opened, action: { kind: 'cv' } };
    const direct = context.projects.find(project => project.id.toLowerCase() === args[0].toLowerCase() || project.title.toLowerCase() === args[0].toLowerCase());
    if (!direct && !createVirtualFiles(context.projects, context.lang).has(path)) throw new TerminalError('missing', args[0]);
    const projectValue = direct?.id ?? (path.startsWith('/projects/') ? path.split('/')[2] : args[0]);
    const project = findProject(context, projectValue, state.cwd);
    if (!args[1]) return { output: t.opened, action: { kind: 'project', id: project.id } };
    const url = args[1] === '--demo' ? project.demoUrl : project.githubUrl;
    if (!parseBrowserTarget(url)) throw new TerminalError('missing', args[1]);
    return { output: t.opened, action: { kind: 'browser', url } };
  }
  if (args.length > 1 || (args.length === 1 && !args[0]) || (args[0]?.startsWith('-')) || (command === 'cat' && (!args[0]))) throw new TerminalError('usage', USAGE[command]);
  const path = normalizePath(state.cwd, args[0] ?? (command === 'cd' ? '/' : state.cwd));
  const remote = repositoryPath(context.projects, path);
  if (command === 'ls') {
    const listing = await listPath(path, context, signal);
    return { output: listing.entries.map(entry => `${entry.name}${entry.directory ? '/' : ''}${entry.blocked ? ' [blocked]' : ''}`).join('\n') + (listing.limited ? `\n${t.cap}` : '') };
  }
  const files = createVirtualFiles(context.projects, context.lang), node = files.get(path);
  if (command === 'cd') {
    if (remote) {
      const found = await context.github.locate(remote.project, remote.path, signal);
      if (!found.node.directory) throw new TerminalError('directory', path);
    } else {
      if (!node) throw new TerminalError('missing', path);
      if (node.kind === 'file') throw new TerminalError('directory', path);
    }
    return { cwd: path, output: '' };
  }
  if (remote) return { output: await context.github.cat(remote.project, remote.path, signal) };
  if (!node) throw new TerminalError('missing', path);
  if (node.kind !== 'file') throw new TerminalError('file', path);
  if (node.text === undefined) throw new TerminalError('binary');
  return { output: node.text };
}
