import { TerminalError } from './types.js';

export function parseCommand(input: string, partial = false): string[] {
  if (input.length > 1024) throw new TerminalError('input_limit');
  const words: string[] = [];
  let word = '', quote = '', escaped = false, started = false;
  for (const character of input) {
    if (escaped) { word += character; escaped = false; started = true; continue; }
    if (character === '\\' && quote !== "'") { escaped = true; started = true; continue; }
    if (quote) { if (character === quote) quote = ''; else word += character; started = true; continue; }
    if (character === '"' || character === "'") { quote = character; started = true; continue; }
    if (/[;|&<>`\n\r]/.test(character)) throw new TerminalError('operators');
    if (/\s/.test(character)) { if (started) words.push(word); word = ''; started = false; }
    else { word += character; started = true; }
  }
  if (!partial && (quote || escaped)) throw new TerminalError('quote');
  if (started) words.push(word);
  return words;
}

export function normalizePath(cwd: string, input: string): string {
  if (containsControl(input)) throw new TerminalError('path');
  const parts: string[] = [];
  for (const part of `${input.startsWith('/') ? '' : cwd}/${input}`.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop(); else parts.push(part);
  }
  return `/${parts.join('/')}`;
}
export const containsControl = (value: string) => [...value].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127);

export function completionToken(input: string) {
  let start = 0, quote = '', escaped = false;
  for (let index = 0; index < input.length; index++) {
    const character = input[index];
    if (escaped) { escaped = false; continue; }
    if (character === '\\' && quote !== "'") { escaped = true; continue; }
    if (quote) { if (character === quote) quote = ''; }
    else if (character === '"' || character === "'") quote = character;
    else if (/\s/.test(character)) start = index + 1;
  }
  const token = parseCommand(input.slice(start), true)[0] ?? '';
  return { start, token, before: input.slice(0, start) };
}
export const quoteArgument = (value: string) => /[\s"'\\;|&<>`]/.test(value) ? JSON.stringify(value) : value;
