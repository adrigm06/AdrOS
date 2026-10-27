export type Inline = { kind: 'text' | 'code'; text: string }
  | { kind: 'strong' | 'em' | 'strike'; children: Inline[] }
  | { kind: 'link'; href: string; children: Inline[] }
  | { kind: 'image'; href: string; alt: string };
export type References = Record<string, string>;
interface Budget { remaining: number }
function search(source: string, needle: string, start: number, budget: Budget): number {
  if (budget.remaining <= 0) return -1;
  const end = source.indexOf(needle, start);
  budget.remaining -= (end >= 0 ? end : source.length) - start + 1;
  return end;
}

function closing(source: string, start: number, open: string, close: string, budget: Budget): number {
  let depth = 0;
  for (let index = start; index < source.length; index++) {
    if (--budget.remaining <= 0) return -1;
    if (source[index] === '\\') { index++; continue; }
    if (source[index] === open) depth++;
    if (source[index] === close && --depth === 0) return index;
  }
  return -1;
}

export function parseInline(source: string, references: References = {}, depth = 0, budget: Budget = { remaining: 500000 }): Inline[] {
  if (depth > 6) return [{ kind: 'text', text: source }];
  const output: Inline[] = [];
  const text = (value: string) => {
    const previous = output.at(-1);
    if (previous?.kind === 'text') previous.text += value; else output.push({ kind: 'text', text: value });
  };
  for (let index = 0; index < source.length;) {
    if (--budget.remaining <= 0) { text(source.slice(index)); break; }
    if (source[index] === '\\' && index + 1 < source.length) { text(source[index + 1]); index += 2; continue; }
    if (source[index] === '`') {
      const marker = /^`+/.exec(source.slice(index))![0], end = search(source, marker, index + marker.length, budget);
      if (end >= 0) { output.push({ kind: 'code', text: source.slice(index + marker.length, end) }); index = end + marker.length; continue; }
    }
    const image = source.startsWith('![', index), bracket = image ? index + 1 : index;
    if (source[bracket] === '[') {
      const end = closing(source, bracket, '[', ']', budget);
      if (end >= 0) {
        const label = source.slice(bracket + 1, end);
        let href: string | undefined, consumed = end + 1;
        if (source[end + 1] === '(') {
          const hrefEnd = closing(source, end + 1, '(', ')', budget);
          if (hrefEnd >= 0) {
            const destination = source.slice(end + 2, hrefEnd).trim();
            href = destination.startsWith('<') ? destination.slice(1, destination.indexOf('>')) : destination.replace(/\s+["'][\s\S]*$/, '');
            consumed = hrefEnd + 1;
          }
        } else {
          const referenceEnd = source[end + 1] === '[' ? search(source, ']', end + 2, budget) : -1;
          const key = referenceEnd >= 0 ? source.slice(end + 2, referenceEnd) || label : label;
          href = Object.hasOwn(references, key.toLowerCase()) ? references[key.toLowerCase()] : undefined;
          if (referenceEnd >= 0) consumed = referenceEnd + 1;
        }
        if (href !== undefined) {
          output.push(image ? { kind: 'image', href, alt: label } : { kind: 'link', href, children: parseInline(label, references, depth + 1, budget) });
          index = consumed; continue;
        }
      }
    }
    const delimiter = ['**', '__', '~~', '*', '_'].find(value => source.startsWith(value, index));
    if (delimiter) {
      const end = search(source, delimiter, index + delimiter.length, budget);
      if (end > index + delimiter.length) {
        output.push({ kind: delimiter === '~~' ? 'strike' : delimiter.length === 2 ? 'strong' : 'em', children: parseInline(source.slice(index + delimiter.length, end), references, depth + 1, budget) });
        index = end + delimiter.length; continue;
      }
    }
    if (source[index] === '<') {
      const end = search(source, '>', index + 1, budget);
      if (end >= 0 && /^<\/?[a-z][^<>]*>$/i.test(source.slice(index, end + 1))) { index = end + 1; continue; }
    }
    text(source[index]); index++;
  }
  return output.map(node => node.kind === 'text' ? { ...node, text: node.text.replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, entity: string) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[entity] ?? '') } : node);
}

export function headingSlug(value: string): string {
  return value.toLowerCase().replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/<[^<>]*>/g, '').replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s/g, '-');
}
