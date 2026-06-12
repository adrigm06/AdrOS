import type { CollectionEntry } from 'astro:content';
import type { Lang } from '@/hooks/useLanguage';

interface ProjectReadmeProps {
  project: CollectionEntry<'projects'>;
  lang: Lang;
}

// Note: MDX body content rendering from React requires the CompiledContent
// from Astro's render(). For now, display description + key highlights.
export default function ProjectReadme({ project, lang }: ProjectReadmeProps) {
  const p = project.data;
  const desc = lang === 'es' ? p.description.es : p.description.en;

  return (
    <div className="prose-container">
      <h2 className="text-lg font-sans mb-3" style={{ color: 'var(--os-accent)' }}>
        {p.title}
      </h2>
      <p
        className="font-mono text-xs mb-4"
        style={{ color: 'var(--os-muted)' }}
      >
        {p.subtitle} &mdash; {p.date}
      </p>
      <p
        className="font-sans text-sm leading-relaxed mb-4"
        style={{ color: 'var(--os-text)', lineHeight: 1.7 }}
      >
        {desc}
      </p>
      <div className="mt-4 p-3 rounded-[var(--radius-md)]" style={{ backgroundColor: 'var(--os-surface-2)' }}>
        <p className="font-mono text-[11px]" style={{ color: 'var(--os-accent)' }}>
          $ cat README.md
        </p>
        <p className="font-mono text-[11px] mt-2" style={{ color: 'var(--os-muted)' }}>
          Project content rendered from MDX. Full README with rich formatting available in the source.
        </p>
      </div>
    </div>
  );
}
