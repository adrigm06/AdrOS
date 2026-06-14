import type { Lang } from '@/hooks/useLanguage';

interface ProfileWindowProps {
  lang: Lang;
}

interface ProfileData {
  name: string;
  role: string;
  location: string;
  bio: string;
  github: string;
  linkedin: string;
  email: string;
}

const PROFILE: Record<Lang, ProfileData> = {
  es: {
    name: 'Adrián Gómez',
    role: 'Mobile & Full-Stack Developer',
    location: '📍 Málaga, España',
    bio: 'Especializado en desarrollo Android nativo con Kotlin y aplicaciones web con Java/Spring Boot. Apasionado por la arquitectura limpia, el código bien estructurado y las herramientas que resuelven problemas reales.',
    github: 'https://github.com/adrigm06',
    linkedin: 'https://www.linkedin.com/in/adrigml/',
    email: 'mailto:adriglc6@gmail.com',
  },
  en: {
    name: 'Adrián Gómez',
    role: 'Mobile & Full-Stack Developer',
    location: '📍 Málaga, Spain',
    bio: 'Specialized in native Android development with Kotlin and web applications with Java/Spring Boot. Passionate about clean architecture, well-structured code, and building tools that solve real problems.',
    github: 'https://github.com/adrigm06',
    linkedin: 'https://www.linkedin.com/in/adrigml/',
    email: 'mailto:adriglc6@gmail.com',
  },
};

export default function ProfileWindow({ lang }: ProfileWindowProps) {
  const p = PROFILE[lang];

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "20px",
        height: "100%",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          overflow: "hidden",
          backgroundColor: "var(--os-surface-2)",
          border: "2px solid var(--os-accent)",
          flexShrink: 0,
        }}
      >
        <img
          src="/avatar.webp"
          alt="Foto de perfil de Adrián Gómez"
          width={120}
          height={120}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="eager"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = "none";
          }}
        />
      </div>

      {/* Info */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "20px",
            color: "var(--os-text)",
            fontWeight: 700,
            margin: 0,
          }}
        >
          {p.name}
        </h2>

        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: "var(--os-accent)",
            margin: 0,
          }}
        >
          {p.role}
        </p>

        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--os-muted)",
            margin: 0,
          }}
        >
          {p.location}
        </p>

        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "var(--os-border)",
            margin: "8px 0",
          }}
        />

        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            color: "var(--os-text)",
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {p.bio}
        </p>

        {/* Links */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "auto",
            paddingTop: "12px",
          }}
        >
          <ProfileLink href={p.github} label="GitHub" />
          <ProfileLink href={p.linkedin} label="LinkedIn" />
          <ProfileLink href={p.email} label="Email" />
        </div>
      </div>
    </div>
  );
}

function ProfileLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        backgroundColor: "var(--os-surface-2)",
        border: "1px solid var(--os-border)",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-sans)",
        fontSize: "13px",
        color: "var(--os-text)",
        textDecoration: "none",
        transition: "background-color 150ms ease, border-color 150ms ease",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.backgroundColor = "var(--os-accent-dim)";
        el.style.borderColor = "var(--os-accent)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.backgroundColor = "var(--os-surface-2)";
        el.style.borderColor = "var(--os-border)";
      }}
    >
      {label}
    </a>
  );
}
