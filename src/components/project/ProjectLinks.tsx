import type { CollectionEntry } from 'astro:content';

interface ProjectLinksProps {
  project: CollectionEntry<'projects'>;
}

export default function ProjectLinks({ project }: ProjectLinksProps) {
  const p = project.data;

  const demoLabel = p.id === 'petconnect' ? 'Video Demo' : 'Demo en vivo';

  const links = [
    { label: 'GitHub', url: p.githubUrl },
    { label: demoLabel, url: p.demoUrl },
    { label: 'LinkedIn', url: p.linkedinUrl },
  ].filter((l) => l.url !== '');

  if (links.length === 0) {
    return (
      <p className="text-sm font-sans" style={{ color: 'var(--os-muted)' }}>
        No external links available for this project.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => (
        <a
          key={link.label}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-sans rounded-[var(--radius-md)] transition-all duration-100"
          style={{
            backgroundColor: 'var(--os-surface-2)',
            border: '1px solid var(--os-border)',
            color: 'var(--os-text)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${p.color}26`;
            e.currentTarget.style.borderColor = p.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--os-surface-2)';
            e.currentTarget.style.borderColor = 'var(--os-border)';
          }}
        >
          {link.label}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 2H2v8h8V7" />
            <path d="M10 2L5 7" />
            <path d="M7 2h3v3" />
          </svg>
        </a>
      ))}
    </div>
  );
}
