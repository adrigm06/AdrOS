import type { Lang } from '@/hooks/useLanguage';

interface QuickLinksProps {
  lang: Lang;
  onOpenContact: () => void;
}

/** Authentic macOS Alias Badge (curved arrow in a white circular badge) */
function MacAliasBadge() {
  return (
    <div
      className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-white flex items-center justify-center pointer-events-none"
      style={{
        boxShadow: '0 1.5px 4px rgba(0,0,0,0.5)',
        border: '0.5px solid rgba(0,0,0,0.15)',
      }}
      title="Alias"
    >
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
        <path
          d="M9 3H4.5M9 3V7.5M9 3L2.5 9.5"
          stroke="#111"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ── Squircle Icons for Desktop Shortcuts ── */

function GitHubIcon() {
  return (
    <div className="w-12 h-12 rounded-[12px] bg-gradient-to-b from-[#2d333b] to-[#1c2128] border border-white/10 flex items-center justify-center shadow-md">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    </div>
  );
}

function LinkedInIcon() {
  return (
    <div className="w-12 h-12 rounded-[12px] bg-gradient-to-b from-[#0a66c2] to-[#004182] border border-white/15 flex items-center justify-center shadow-md">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    </div>
  );
}

function MailIcon() {
  return (
    <div className="w-12 h-12 flex items-center justify-center">
      <img src="/icons/mail.webp" alt="Mail" className="w-12 h-12 object-contain" />
    </div>
  );
}

export default function QuickLinks({ lang, onOpenContact }: QuickLinksProps) {
  const links = [
    {
      label: 'GitHub',
      href: 'https://github.com/adrigm06',
      renderIcon: () => <GitHubIcon />,
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/adrigml/',
      renderIcon: () => <LinkedInIcon />,
    },
    {
      label: lang === 'es' ? 'Contacto' : 'Contact',
      onClick: onOpenContact,
      renderIcon: () => <MailIcon />,
    },
  ];

  return (
    <div className="flex items-center justify-center gap-3.5 sm:gap-5 select-none">
      {links.map((link) => {
        const content = (
          <div className="group flex flex-col items-center gap-1 p-0.5 sm:p-1 rounded-[6px] transition-transform duration-150 hover:scale-105 active:scale-95 cursor-pointer">
            <div className="relative">
              {link.renderIcon()}
              <MacAliasBadge />
            </div>
            <span
              className="font-sans text-[10px] sm:text-[11px] font-medium text-white text-center leading-tight max-w-[68px] sm:max-w-[80px] truncate px-1 py-0.5 rounded-[4px] group-hover:bg-[var(--os-blue)] transition-colors"
              style={{
                textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 0 6px rgba(0,0,0,0.6)',
              }}
            >
              {link.label}
            </span>
          </div>
        );

        if (link.onClick) {
          return (
            <button
              key={link.label}
              type="button"
              onClick={link.onClick}
              className="outline-none bg-transparent border-none p-0 cursor-pointer"
            >
              {content}
            </button>
          );
        }

        return (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="outline-none no-underline"
          >
            {content}
          </a>
        );
      })}
    </div>
  );
}
