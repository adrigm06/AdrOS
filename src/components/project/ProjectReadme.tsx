import { useMemo } from 'react';
import type { CollectionEntry } from 'astro:content';
import type { Lang } from '@/hooks/useLanguage';

interface ProjectReadmeProps {
  project: CollectionEntry<'projects'>;
  lang: Lang;
}

/**
 * Extract the Content block for the given language from the raw MDX body.
 */
function extractContent(body: string | undefined, lang: Lang): string {
  if (!body) return '';
  const regex = new RegExp(`<Content lang="${lang}">([\\s\\S]*?)</Content>`);
  const match = body.match(regex);
  if (match) return match[1].trim();

  // Fallback: try "es" if requested lang not found
  if (lang !== 'es') {
    const fallback = body.match(/<Content lang="es">([\s\S]*?)<\/Content>/);
    if (fallback) return fallback[1].trim();
  }
  return '';
}

/**
 * Render a line of text that might be a heading (###), table row (|...|), etc.
 */
function renderLine(line: string, i: number) {
  const trimmed = line.trim();

  // h4 (###)
  if (trimmed.startsWith('#### ')) {
    return (
      <h4 key={i} className="font-mono text-sm font-bold mt-5 mb-2" style={{ color: 'var(--os-accent)' }}>
        {trimmed.replace('#### ', '')}
      </h4>
    );
  }

  // h3 (###)
  if (trimmed.startsWith('### ')) {
    return (
      <h3 key={i} className="font-mono text-base font-bold mt-6 mb-2" style={{ color: 'var(--os-accent)' }}>
        {trimmed.replace('### ', '')}
      </h3>
    );
  }

  // h2 (##)
  if (trimmed.startsWith('## ')) {
    return (
      <h2 key={i} className="font-sans text-lg font-bold mt-6 mb-2" style={{ color: 'var(--os-text)' }}>
        {trimmed.replace('## ', '')}
      </h2>
    );
  }

  // Blockquote (>)
  if (trimmed.startsWith('> ')) {
    const inner = trimmed.replace('> ', '');
    return (
      <blockquote key={i} className="pl-3 py-1 my-3 font-mono text-xs italic border-l-2" style={{ borderColor: 'var(--os-accent)', color: 'var(--os-muted)' }}>
        {inner}
      </blockquote>
    );
  }

  // Thematic break (---)
  if (/^-{3,}$/.test(trimmed)) {
    return <hr key={i} className="my-4 border-0" style={{ height: 1, backgroundColor: 'var(--os-border)' }} />;
  }

  // Table row (|...|...|)
  if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
    const cells = trimmed.split('|').filter(Boolean).map((c) => c.trim());
    // Detect header separator row (|---|---|)
    if (cells.every((c) => /^-{3,}$/.test(c))) {
      return null; // skip separator
    }
    return (
      <div key={i} className="flex gap-4 py-1 font-mono text-xs" style={{ color: 'var(--os-text-dim)' }}>
        {cells.map((c, ci) => (
          <span key={`${i}-${c}-${ci}`} className="flex-1">{c}</span>
        ))}
      </div>
    );
  }

  // Empty line
  if (!trimmed) {
    return <div key={i} className="h-2" />;
  }

  // Regular paragraph — detect inline links [text](url)
  const withLinks = trimmed.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--os-accent);text-decoration:underline">$1</a>',
  );

  return (
    <p key={i} className="font-sans text-sm leading-relaxed mb-2" style={{ color: 'var(--os-text)', lineHeight: 1.7 }}>
      <span dangerouslySetInnerHTML={{ __html: withLinks }} />
    </p>
  );
}

export default function ProjectReadme({ project, lang }: ProjectReadmeProps) {
  const p = project.data;

  const content = useMemo(() => extractContent(project.body, lang), [project.body, lang]);

  if (!content) {
    // Fallback: show description
    const desc = lang === 'es' ? p.description.es : p.description.en;
    return (
      <div className="prose-container">
        <div className="p-4 rounded-[var(--radius-md)] font-mono text-xs" style={{ backgroundColor: 'var(--os-bg)', color: 'var(--os-muted)' }}>
          <p className="mb-2" style={{ color: 'var(--os-accent)' }}>$ cat README.md</p>
          <p>{desc}</p>
        </div>
      </div>
    );
  }

  const lines = content.split('\n');

  return (
    <div className="prose-container">
      {/* ── Header ── */}
      <div className="mb-4">
        <h2 className="text-lg font-sans font-bold" style={{ color: 'var(--os-text)' }}>
          {p.title}
        </h2>
        <p className="font-mono text-xs mt-0.5" style={{ color: 'var(--os-muted)' }}>
          {p.subtitle} <span style={{ color: 'var(--os-accent)' }}>·</span> {p.date}
        </p>
      </div>

      {/* ── Terminal-style README content ── */}
      <div
        className="p-4 rounded-[var(--radius-md)] overflow-hidden"
        style={{
          backgroundColor: 'var(--os-bg)',
          border: '1px solid var(--os-border)',
        }}
      >
        {/* Terminal header bar */}
        <div className="flex items-center gap-1.5 mb-3 pb-3" style={{ borderBottom: '1px solid var(--os-border)' }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--os-danger)' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--os-warn)' }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--os-ok)' }} />
          <span className="ml-2 font-mono text-[10px]" style={{ color: 'var(--os-muted)' }}>
            README.md — {p.title}
          </span>
        </div>

        {/* Content lines */}
        <div className="space-y-0">
          {lines.map((line, i) => renderLine(line, i))}
        </div>
      </div>

      {/* ── Stack tags footer ── */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {p.stack.map((tech) => (
          <span
            key={tech}
            className="px-2 py-0.5 text-[10px] font-mono rounded-[var(--radius-sm)]"
            style={{
              backgroundColor: 'var(--os-surface-2)',
              border: '1px solid var(--os-border)',
              color: p.color,
            }}
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
