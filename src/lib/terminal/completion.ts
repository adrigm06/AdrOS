import { listPath } from './commands.js';
import { completionToken, normalizePath, quoteArgument } from './parser.js';
import { COMMANDS } from './project-commands.js';
import type { TerminalContext } from './types.js';

export async function completeCommand(input: string, cwd: string, context: TerminalContext, signal: AbortSignal) {
  const { token, before } = completionToken(input);
  const command = before.trim().split(/\s/)[0];
  let candidates: string[] = [];
  if (!before) candidates = COMMANDS.filter(value => value.startsWith(token));
  else if (['open', 'repo'].includes(command) && !token.includes('/')) {
    candidates = context.projects.filter(project => project.id.startsWith(token) || project.title.toLowerCase().startsWith(token.toLowerCase())).map(project => project.id);
  } else if (['ls', 'cd', 'cat', 'open'].includes(command)) {
    const slash = token.lastIndexOf('/'), prefix = slash < 0 ? '' : token.slice(0, slash + 1), fragment = token.slice(slash + 1);
    const directory = normalizePath(cwd, prefix || '.');
    const listing = await listPath(directory, context, signal);
    candidates = listing.entries.filter(entry => !entry.blocked && entry.name.startsWith(fragment) && (command !== 'cd' || entry.directory))
      .map(entry => `${prefix}${entry.name}${entry.directory ? '/' : ''}`);
  }
  if (!candidates.length) return { input, candidates };
  const common = candidates.reduce((prefix, value) => {
    let count = 0; while (count < prefix.length && prefix[count] === value[count]) count++; return prefix.slice(0, count);
  });
  const replacement = candidates.length === 1 ? candidates[0] : common;
  return { input: replacement ? `${before}${quoteArgument(replacement)}${candidates.length === 1 && !replacement.endsWith('/') ? ' ' : ''}` : input, candidates };
}
