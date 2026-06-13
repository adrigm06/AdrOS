interface QuickLinksProps {
  // no props needed currently
}

/* ── Icon SVGs ── */

function GithubIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-label="GitHub">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-label="LinkedIn">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Email"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4L12 13L2 4" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Download CV"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/** Shortcut arrow badge (Windows/macOS style) */
function ShortcutBadge() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      className="absolute -bottom-0.5 -left-0.5"
      style={{
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
      }}
    >
      {/* Badge background */}
      <rect x="0.5" y="0.5" width="13" height="13" rx="2.5" fill="var(--os-surface-2)" stroke="var(--os-border)" strokeWidth="0.5" />
      {/* Curved arrow */}
      <path
        d="M9.5 7.5V4.5H6.5M9.5 4.5L5.5 8.5"
        stroke="var(--os-muted)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ── Link definitions ── */

const LINKS: { label: string; href: string; labelKey: string; Icon: React.FC }[] = [
  { label: "GitHub", href: "https://github.com/adrigm06", labelKey: "GitHub", Icon: GithubIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/adrigml/", labelKey: "LinkedIn", Icon: LinkedinIcon },
  { label: "Email", href: "mailto:adrigml06@gmail.com", labelKey: "Email", Icon: EmailIcon },
  { label: "CV", href: "/Adrian_Gomez_FullStack_English.pdf", labelKey: "CV", Icon: DownloadIcon },
];

export default function QuickLinks(_props: QuickLinksProps) {
  return (
    <div className="flex items-center gap-5">
      {LINKS.map((link) => {
        const { Icon } = link;
        return (
          <a
            key={link.labelKey}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center gap-1.5 transition-all duration-200 hover:scale-110 hover:drop-shadow-[0_0_8px_var(--os-accent-glow)]"
            style={{ color: 'var(--os-muted)' }}
          >
            {/* Icon container with shortcut badge */}
            <div className="relative">
              <Icon />
              <ShortcutBadge />
            </div>
            {/* Label */}
            <span
              className="font-mono text-[10px] transition-colors duration-200 group-hover:text-[var(--os-accent)]"
            >
              {link.label}
            </span>
          </a>
        );
      })}
    </div>
  );
}
