import { PROFILE } from '@/data/profile';
import type { Lang } from '@/hooks/useLanguage';

interface ProfileWindowProps {
  lang: Lang;
  onOpenContact?: () => void;
}

export default function ProfileWindow({ lang, onOpenContact }: ProfileWindowProps) {
  const p = PROFILE[lang];

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-6 h-full font-sans select-none overflow-y-auto">
      {/* Avatar Container */}
      <div className="flex flex-col items-center sm:items-start flex-shrink-0">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white/5 ring-2 ring-[var(--os-blue)]/50 shadow-lg">
          <img
            src="/avatar.webp"
            alt="Adrián Gómez"
            width={112}
            height={112}
            className="w-full h-full object-cover"
            loading="eager"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      </div>

      {/* Info Container */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {p.name}
            </h2>
            <p className="text-xs font-semibold text-[var(--os-blue)]">
              {p.role}
            </p>
            <p className="text-[11px] text-white/50">
              {p.location}
            </p>
          </div>

          <div className="w-full h-[1px] bg-white/10 my-3" />

          <p className="text-xs leading-relaxed text-white/80 whitespace-pre-line">
            {p.bio}
          </p>
        </div>

        {/* Buttons / Actions bar */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-3 border-t border-white/10">
          <ProfileActionButton href={p.github} label="GitHub" icon="github" />
          <ProfileActionButton href={p.linkedin} label="LinkedIn" icon="linkedin" />
          {onOpenContact ? (
            <button
              type="button"
              onClick={onOpenContact}
              className="px-3 py-1.5 rounded-[6px] bg-[var(--os-blue)] hover:brightness-110 text-white text-xs font-medium shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>{lang === 'es' ? 'Contáctame' : 'Contact me'}</span>
            </button>
          ) : (
            <ProfileActionButton href={p.email} label="Email" icon="email" />
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileActionButton({
  href,
  label,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="px-3 py-1.5 rounded-[6px] bg-white/10 hover:bg-white/15 border border-white/10 text-white/90 text-xs font-medium transition-all"
    >
      {label}
    </a>
  );
}
