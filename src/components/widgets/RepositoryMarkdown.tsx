import { Fragment, createElement, useMemo, type ReactNode } from 'react';
import { parseMarkdown } from '../../lib/repository/markdown.js';
import { headingSlug, type Inline } from '../../lib/repository/inline.js';
import { rawRepositoryUrl, resolveReadmeLink, type ReadmeContext } from '../../lib/repository/navigation.js';
import { repositoryCopy } from '../../i18n/repository.js';

interface Props { text: string; context: ReadmeContext; lang: 'en' | 'es'; onNavigate: (url: string) => void }

function InlineContent({ nodes, context, lang, onNavigate, inLink = false }: { nodes: Inline[]; context: ReadmeContext; lang: 'en' | 'es'; onNavigate: Props['onNavigate']; inLink?: boolean }): ReactNode {
  return nodes.map((node, index) => {
    if (node.kind === 'text') return <Fragment key={index}>{node.text}</Fragment>;
    if (node.kind === 'code') return <code key={index}>{node.text}</code>;
    if (node.kind === 'strong' || node.kind === 'em' || node.kind === 'strike') return createElement(node.kind === 'strike' ? 'del' : node.kind, { key: index }, <InlineContent nodes={node.children} context={context} lang={lang} onNavigate={onNavigate} inLink={inLink} />);
    if (!('href' in node)) return null;
    const link = resolveReadmeLink(node.href, context);
    const children = node.kind === 'image' ? `▧ ${node.alt || repositoryCopy[lang].image}` : <InlineContent nodes={node.children} context={context} lang={lang} onNavigate={onNavigate} inLink />;
    if (!link || inLink) return <span key={index}>{children}</span>;
    if (link.kind === 'anchor') return <a key={index} href={`#readme-${headingSlug(link.anchor)}`} onClick={event => {
      event.preventDefault(); document.getElementById(`readme-${headingSlug(link.anchor)}`)?.scrollIntoView({ block: 'start' });
    }}>{children}</a>;
    let href = link.kind === 'repository' ? link.target.url : link.url;
    if (node.kind === 'image' && link.kind === 'repository') href = rawRepositoryUrl(context, link.target.path ?? '');
    if (link.kind === 'repository' && node.kind !== 'image') return <a key={index} href={href} onClick={event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); onNavigate(link.target.url);
    }}>{children}</a>;
    return <a key={index} href={href} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{children} ↗</a>;
  });
}

export default function RepositoryMarkdown({ text, context, lang, onNavigate }: Props) {
  const blocks = useMemo(() => parseMarkdown(text), [text]);
  const slugs = new Map<string, number>();
  const inline = (nodes: Inline[]) => <InlineContent nodes={nodes} context={context} lang={lang} onNavigate={onNavigate} />;
  return <article className="repo-markdown">
    <p className="repo-image-note">{repositoryCopy[lang].images}</p>
    {blocks.map((block, index) => {
      if (block.kind === 'heading') {
        const slug = headingSlug(block.text), count = slugs.get(slug) ?? 0;
        slugs.set(slug, count + 1);
        return createElement(`h${block.level}`, { key: index, id: `readme-${slug}${count ? `-${count}` : ''}` }, inline(block.children));
      }
      if (block.kind === 'code') return <pre key={index}><code>{block.text}</code></pre>;
      if (block.kind === 'list') return createElement(block.ordered ? 'ol' : 'ul', { key: index }, block.items.map((item, number) => <li key={number}>{inline(item)}</li>));
      if (block.kind === 'rule') return <hr key={index} />;
      if (block.kind === 'table') return <div key={index} className="overflow-x-auto"><table><thead><tr>{block.headings.map((cell, number) => <th key={number}>{inline(cell)}</th>)}</tr></thead>
        <tbody>{block.rows.map((row, number) => <tr key={number}>{row.map((cell, column) => <td key={column}>{inline(cell)}</td>)}</tr>)}</tbody></table></div>;
      return createElement(block.kind === 'quote' ? 'blockquote' : 'p', { key: index }, inline(block.children));
    })}
  </article>;
}
