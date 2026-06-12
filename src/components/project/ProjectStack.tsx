import type { CollectionEntry } from 'astro:content';

interface ProjectStackProps {
  project: CollectionEntry<'projects'>;
}

function getDeviconSlug(tech: string): string {
  const slugMap: Record<string, string> = {
    'Kotlin': 'kotlin',
    'Android SDK': 'android',
    'Android Jetpack': 'android',
    'Jetpack Compose': 'jetpackcompose',
    'Clean Architecture': '', // no icon
    'Mobile Development': '',
    'TypeScript': 'typescript',
    'Node.js': 'nodejs',
    'LLM Integration': '',
    'TUI': '',
    'Heuristic Analysis': '',
    'Android': 'android',
    'Artificial Intelligence': '',
    'NPM': 'npm',
    'Open Source': '',
    'Generative AI': '',
    'MVVM': '',
    'Material Design 3': '',
    'Java 21': 'java',
    'Spring Boot 3.4': 'spring',
    'Spring Security': 'spring',
    'JWT': '',
    'PostgreSQL': 'postgresql',
    'Supabase': 'supabase',
    'React.js': 'react',
    'Leaflet': '',
    'JPA': '',
    'HTML5': 'html5',
    'CSS3': 'css3',
    'JavaScript': 'javascript',
    'Express.js': 'express',
    'REST API': '',
    'GitHub Pages': 'github',
    'Render': '',
    'Astro 4': 'astro',
    'React 19': 'react',
    'TailwindCSS': 'tailwindcss',
    'GSAP': '',
    'Lenis': '',
    'Zod': '',
    'React Hook Form': '',
    'SEO Técnico': '',
    'i18n': '',
  };
  return slugMap[tech] || tech.toLowerCase().replace(/[\s.]+/g, '');
}

export default function ProjectStack({ project }: ProjectStackProps) {
  const p = project.data;

  return (
    <div className="grid grid-cols-3 max-sm:grid-cols-2 gap-2">
      {p.stack.map((tech) => {
        const slug = getDeviconSlug(tech);
        const iconUrl = slug
          ? `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`
          : null;

        return (
          <div
            key={tech}
            className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] transition-colors duration-100"
            style={{
              backgroundColor: 'var(--os-surface-2)',
              border: '1px solid var(--os-border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = p.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--os-border)';
            }}
          >
            {iconUrl && (
              <img
                src={iconUrl}
                alt=""
                className="w-4 h-4 flex-shrink-0"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}
            <span className="font-mono text-xs truncate" style={{ color: 'var(--os-text)' }}>
              {tech}
            </span>
          </div>
        );
      })}
    </div>
  );
}
