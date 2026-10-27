import { parseInline, type Inline, type References } from './inline.js';
export type MarkdownBlock =
  | { kind: 'heading'; level: number; text: string; children: Inline[] }
  | { kind: 'paragraph' | 'quote'; children: Inline[] }
  | { kind: 'list'; ordered: boolean; items: Inline[][] }
  | { kind: 'code'; language: string; text: string }
  | { kind: 'table'; headings: Inline[][]; rows: Inline[][][] }
  | { kind: 'rule' };

function cleanHtml(value: string, anchors: string[]): string {
  return value.replace(/<!--[^]*?(?:-->|$)/g, '').replace(/<(script|style|iframe)\b[^<>]*>[^]*?(?:<\/\1\s*>|$)/gi, '')
    .replace(/<(https:\/\/[^<>\s]+)>/g, '[$1]($1)')
    .replace(/<a\b[^<>]*>|<\/a\s*>/gi, tag => {
      if (/^<\/a/i.test(tag)) { const href = anchors.pop(); return href ? `](${href})` : ''; }
      const href = /\bhref\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1] ?? '';
      anchors.push(href); return href ? '[' : '';
    })
    .replace(/<img\b[^<>]*>/gi, tag => {
      const attribute = (name: string) => new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i').exec(tag)?.[1] ?? '';
      return `![${attribute('alt').replaceAll('[', '').replaceAll(']', '')}](${attribute('src')})`;
    }).replace(/<br\s*\/?>/gi, '\n').replace(/<\/?(?:div|p|h[1-6]|summary|details|tr|table)\b[^<>]*>/gi, '\n');
}

function cleanOutsideCode(value: string): string {
  const result: string[] = [], anchors: string[] = [];
  let index = 0;
  while (index < value.length) {
    const start = value.indexOf('`', index);
    if (start < 0) { result.push(cleanHtml(value.slice(index), anchors)); break; }
    const marker = /^`+/.exec(value.slice(start))![0], end = value.indexOf(marker, start + marker.length);
    if (end < 0) { result.push(cleanHtml(value.slice(index), anchors)); break; }
    result.push(cleanHtml(value.slice(index, start), anchors), value.slice(start, end + marker.length));
    index = end + marker.length;
  }
  return result.join('');
}

function prepare(source: string): string[] {
  const output: string[] = [], lines = source.replace(/\r\n?/g, '\n').split('\n');
  let outside: string[] = [], fence = '';
  const flush = () => { output.push(...cleanOutsideCode(outside.join('\n')).split('\n')); outside = []; };
  for (const line of lines) {
    const marker = /^\s{0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (!fence && marker) { flush(); fence = marker; output.push(line); }
    else if (fence) { output.push(line); if (marker?.[0] === fence[0] && marker.length >= fence.length) fence = ''; }
    else outside.push(line);
  }
  flush(); return output;
}
const tableCells = (line: string) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map(cell => cell.trim());
const tableDivider = (line: string) => /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
const blockStart = (line: string) => /^\s*(?:#{1,6}\s|`{3,}|~{3,}|[-*+]\s|\d+\.\s|>\s?|(?:[-*_]\s*){3,}$)/.test(line);

export function parseMarkdown(source: string): MarkdownBlock[] {
  const lines = prepare(source.slice(0, 131072)), references: References = Object.create(null) as References;
  let fenced = false;
  for (let index = 0; index < lines.length; index++) {
    if (/^\s*(`{3,}|~{3,})/.test(lines[index])) fenced = !fenced;
    const reference = !fenced && /^\s*\[([^\]]+)\]:\s*(?:<([^>]+)>|(\S+))/.exec(lines[index]);
    if (reference) { references[reference[1].toLowerCase()] = reference[2] ?? reference[3]; lines[index] = ''; }
  }
  const blocks: MarkdownBlock[] = [], inline = (value: string) => parseInline(value, references);
  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    if (!line.trim()) { index++; continue; }
    const fence = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      const code: string[] = []; index++;
      while (index < lines.length && !lines[index].trim().startsWith(fence[1])) code.push(lines[index++]);
      if (index < lines.length) index++;
      blocks.push({ kind: 'code', language: fence[2].trim(), text: code.join('\n') }); continue;
    }
    const heading = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (heading) { blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2], children: inline(heading[2]) }); index++; continue; }
    if (index + 1 < lines.length && /^\s*(?:={3,}|-{3,})\s*$/.test(lines[index + 1])) {
      blocks.push({ kind: 'heading', level: lines[index + 1].includes('=') ? 1 : 2, text: line, children: inline(line) }); index += 2; continue;
    }
    if (index + 1 < lines.length && line.includes('|') && tableDivider(lines[index + 1])) {
      const headings = tableCells(line).map(inline), rows: Inline[][][] = []; index += 2;
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) rows.push(tableCells(lines[index++]).map(inline));
      blocks.push({ kind: 'table', headings, rows }); continue;
    }
    if (/^\s*(?:[-*_]\s*){3,}$/.test(line)) { blocks.push({ kind: 'rule' }); index++; continue; }
    if (/^\s*>/.test(line)) {
      const text: string[] = [];
      while (index < lines.length && /^\s*>/.test(lines[index])) text.push(lines[index++].replace(/^\s*>\s?/, ''));
      blocks.push({ kind: 'quote', children: inline(text.join('\n')) }); continue;
    }
    const list = /^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/.exec(line);
    if (list) {
      const items: Inline[][] = [];
      while (index < lines.length) {
        const item = /^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/.exec(lines[index]);
        if (!item) break;
        items.push(inline(item[3])); index++;
      }
      blocks.push({ kind: 'list', ordered: !!list[2], items }); continue;
    }
    const paragraph = [line]; index++;
    while (index < lines.length && lines[index].trim() && !blockStart(lines[index]) && !(index + 1 < lines.length && tableDivider(lines[index + 1]))) paragraph.push(lines[index++]);
    blocks.push({ kind: 'paragraph', children: inline(paragraph.join('\n')) });
  }
  return blocks;
}
