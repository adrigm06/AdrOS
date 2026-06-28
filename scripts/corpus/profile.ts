/**
 * Profile corpus for Adrián Gómez — RAG knowledge base
 *
 * ⚠️  No private data here: no email, no phone, no home address.
 * Source: Adrian_Gomez_FullStackAI_ES.pdf (updated 2026)
 *
 * Update this file whenever you change your CV or bio,
 * then re-run: npx tsx scripts/ingest.ts --source profile
 */

export interface ProfileChunk {
  id: string;
  content: string;
  metadata: Record<string, string>;
}

export const profileChunks: ProfileChunk[] = [
  // ── Bio & identity ──────────────────────────────────────────
  {
    id: 'profile-identity',
    content: `
Adrián Gómez (handle: adrigm / adrigm06) es un desarrollador Full-Stack e Inteligencia Artificial
con sede en Málaga, España. Se especializa en construir productos digitales completos — desde
aplicaciones Android nativas hasta APIs backend, frontends web modernos y sistemas con IA.
Su enfoque está en la ingeniería de producto orientada a impacto real: código limpio, arquitecturas
escalables y experiencias de usuario que marquen la diferencia.

Perfil público:
- GitHub: https://github.com/adrigm06
- LinkedIn: https://www.linkedin.com/in/adrigml/
- Portfolio: AdrOS (https://adros.vercel.app)
- Empresa: VantageSystems (https://vantagesystems.eu)
    `.trim(),
    metadata: { source: 'profile', section: 'identity', lang: 'es' },
  },

  // ── Professional orientation ─────────────────────────────────
  {
    id: 'profile-orientation',
    content: `
Adrián Gómez is a Full-Stack & AI Developer based in Málaga, Spain.
He builds complete digital products — from native Android apps to backend APIs,
modern web frontends, and AI-powered automation systems.
His focus is on product engineering with real impact: clean code, scalable architectures,
and user experiences that make a difference.

Public profiles:
- GitHub: https://github.com/adrigm06
- LinkedIn: https://www.linkedin.com/in/adrigml/
- Portfolio: AdrOS (https://adros.vercel.app)
- Company: VantageSystems (https://vantagesystems.eu)
    `.trim(),
    metadata: { source: 'profile', section: 'identity', lang: 'en' },
  },

  // ── Tech stack ───────────────────────────────────────────────
  {
    id: 'profile-stack-es',
    content: `
Stack técnico de Adrián Gómez:

Lenguajes: Kotlin, TypeScript, JavaScript, Java, Python
Android: Jetpack Compose, Material Design 3, Clean Architecture, MVVM, Android Jetpack,
  Coroutines, Flows, Glance (Widgets), WindowManager API, ML Kit
Backend: Spring Boot 3, Node.js, Express, REST APIs, JWT, PostgreSQL, Supabase
Frontend Web: Astro, React 19, Next.js, TypeScript, TailwindCSS, GSAP, Framer Motion
IA / Automatización: OpenAI API, n8n, LLM integration, Prompt Engineering, RAG systems,
  Generative AI (Android), xAI / Grok
DevOps / Deploy: Vercel, Render, Supabase, GitHub Actions, pgvector
Herramientas: Git, Figma, Android Studio, VS Code, Clean Architecture, TDD
    `.trim(),
    metadata: { source: 'profile', section: 'stack', lang: 'es' },
  },

  {
    id: 'profile-stack-en',
    content: `
Adrián Gómez's technical stack:

Languages: Kotlin, TypeScript, JavaScript, Java, Python
Android: Jetpack Compose, Material Design 3, Clean Architecture, MVVM, Android Jetpack,
  Coroutines, Flows, Glance (Widgets), WindowManager API, ML Kit
Backend: Spring Boot 3, Node.js, Express, REST APIs, JWT, PostgreSQL, Supabase
Web Frontend: Astro, React 19, Next.js, TypeScript, TailwindCSS, GSAP, Framer Motion
AI / Automation: OpenAI API, n8n, LLM integration, Prompt Engineering, RAG systems,
  Generative AI (Android), xAI / Grok
DevOps / Deploy: Vercel, Render, Supabase, GitHub Actions, pgvector
Tools: Git, Figma, Android Studio, VS Code, Clean Architecture, TDD
    `.trim(),
    metadata: { source: 'profile', section: 'stack', lang: 'en' },
  },

  // ── Experience & projects ────────────────────────────────────
  {
    id: 'profile-experience-es',
    content: `
Experiencia y proyectos destacados de Adrián Gómez:

- VantageSystems: Fundador y desarrollador principal. Plataforma de servicios tecnológicos
  para pymes — webs de alto rendimiento, apps, chatbots con IA y automatizaciones.
  Logro: 100/100 Lighthouse en Performance, Accessibility, Best Practices y SEO.

- AndroBox: Toolkit de diagnóstico y diseño para Android con estética Neo-Brutalista.
  Superposiciones con WindowManager API, OCR con ML Kit, HUD de telemetría en tiempo real.

- Komea: App Android nativa con IA Generativa para planificación de menús e inventario del hogar.
  En fase avanzada de desarrollo, próximo lanzamiento.

- BetterPrompt: Extensión open source para Pi Agent que enriquece automáticamente el contexto
  de los prompts antes de enviarlos al LLM. Publicada en npm: @adrigm06/android-engineering-skill.

- Smart Lead Qualification: Sistema de automatización de ventas end-to-end con n8n, OpenAI,
  Jira y Telegram. Cualificación automática de leads, seguimiento y gestión horaria inteligente.

- PetConnect: Plataforma full-stack para el sector veterinario. Spring Boot + React 19,
  mapas interactivos con Leaflet, red social y versión móvil con Capacitor.
    `.trim(),
    metadata: { source: 'profile', section: 'experience', lang: 'es' },
  },

  {
    id: 'profile-experience-en',
    content: `
Adrián Gómez's experience and key projects:

- VantageSystems: Founder and lead developer. Technology services platform for SMEs —
  high-performance websites, apps, AI chatbots and automation systems.
  Achievement: 100/100 Lighthouse scores across all categories.

- AndroBox: Android diagnostics & design toolkit with Neo-Brutalist aesthetic.
  WindowManager API overlays, ML Kit OCR, real-time telemetry HUD.

- Komea: Native Android app with Generative AI for meal planning and home inventory.
  Advanced development stage, launching soon.

- BetterPrompt: Open-source Pi Agent extension that auto-enriches prompt context before
  sending to the LLM. Published on npm: @adrigm06/android-engineering-skill.

- Smart Lead Qualification: End-to-end sales automation with n8n, OpenAI, Jira and Telegram.
  Automatic lead qualification, follow-up and intelligent time-based routing.

- PetConnect: Full-stack veterinary platform. Spring Boot + React 19, interactive maps
  with Leaflet, social network and mobile app with Capacitor.
    `.trim(),
    metadata: { source: 'profile', section: 'experience', lang: 'en' },
  },

  // ── Education & languages ─────────────────────────────────────
  {
    id: 'profile-education',
    content: `
Formación académica de Adrián Gómez / Adrián Gómez's education:

- Desarrollo de Aplicaciones Multiplataforma (DAM) — España
  Formación técnica en desarrollo de software, bases de datos, arquitecturas y sistemas.

Idiomas / Languages:
- Español: Nativo / Spanish: Native
- Inglés: Nivel profesional, lectura y escritura técnica fluida / English: Professional level, fluent technical reading and writing

Aprendizaje continuo: cursos de arquitectura software, IA aplicada, Android avanzado y rendimiento web.
Continuous learning: software architecture, applied AI, advanced Android and web performance courses.
    `.trim(),
    metadata: { source: 'profile', section: 'education', lang: 'both' },
  },

  // ── Soft skills & work style ──────────────────────────────────
  {
    id: 'profile-softskills',
    content: `
Forma de trabajar de Adrián Gómez / Adrián's work style:

- Orientado a producto: construye con visión de usuario final, no solo de código.
- Product-oriented: builds with end-user vision, not just code.

- Clean Architecture y código mantenible por encima de soluciones rápidas.
- Clean Architecture and maintainable code over quick fixes.

- Atención al detalle visual y de UX: diseña interfaces que se sienten premium.
- Attention to visual and UX detail: designs interfaces that feel premium.

- Autónomo y proactivo: capaz de llevar un proyecto de 0 a producción solo.
- Autonomous and proactive: able to take a project from 0 to production solo.

- Comunicación clara con clientes y equipos. Documentación cuidada (AGENTS.md, READMEs).
- Clear communication with clients and teams. Careful documentation.

- Apasionado por la IA aplicada: no solo como herramienta, sino como producto.
- Passionate about applied AI: not just as a tool, but as a product.
    `.trim(),
    metadata: { source: 'profile', section: 'softskills', lang: 'both' },
  },
];
