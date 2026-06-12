# AGENTS.md — Guía para Agentes de IA

> Este archivo define cómo debe comportarse cualquier agente de IA (Claude, Copilot, Cursor, etc.) que trabaje en este proyecto. Léelo completo antes de hacer cualquier modificación.

---

## 🎯 Qué es este proyecto

Un portafolio personal con estética de sistema operativo ficticio llamado **AdrOS**. La experiencia simula un escritorio interactivo en el navegador con ventanas arrastrables, carpetas de proyectos y una barra de tareas funcional. **No es un clon de ningún OS real.**

El objetivo final es un sitio web estático, rápido, accesible y visualmente memorable. Cada decisión técnica debe servir a ese objetivo.

---

## 📐 Principios de arquitectura

### 1. Islas de React, no SPA
Este proyecto usa **Astro**. El HTML se genera estáticamente. React solo se hidrata donde hay interactividad real (ventanas, drag, toggles). No conviertas páginas `.astro` en componentes React sin justificación.

```astro
<!-- ✅ Correcto: isla de React solo donde hace falta -->
<Desktop client:load />

<!-- ❌ Incorrecto: hidratar todo innecesariamente -->
<StaticHeader client:load />
```

### 2. Estado de ventanas: un solo lugar
Toda la lógica de qué ventanas están abiertas, su posición, z-index y estado (minimizada/maximizada) vive en `useWindowManager.ts`. **Nunca dupliques este estado en componentes individuales.**

### 3. Contenido en Content Collections, no hardcodeado
Los datos de cada proyecto viven en `src/content/projects/*.mdx`. Si necesitas añadir o modificar un proyecto, hazlo ahí. Los componentes leen estos datos dinámicamente — nunca escribas datos de proyectos directamente en JSX.

### 4. Estilos: Tailwind + CSS Variables del OS
- Usa clases de Tailwind para layout y espaciado.
- Usa las variables CSS `--os-*` para colores y tipografía del sistema (ver `global.css`).
- **No uses colores hardcodeados** como `bg-gray-900` para elementos del OS. Usa `bg-[var(--os-surface)]` o crea una clase utilitaria.

### 5. TypeScript estricto
El `tsconfig.json` tiene `strict: true`. No uses `any`. Si no conoces el tipo, investígalo o usa `unknown` con narrowing.

---

## 🗂️ Dónde vive cada cosa

| ¿Qué quieres hacer? | ¿Dónde tocas? |
|---|---|
| Añadir un proyecto nuevo | `src/content/projects/nuevo.mdx` + `src/data/projects.ts` |
| Cambiar colores del OS | `src/styles/global.css` (variables `--os-*`) |
| Modificar la lógica de ventanas | `src/hooks/useWindowManager.ts` |
| Tocar la barra de tareas | `src/components/os/Taskbar.tsx` |
| Cambiar una traducción | `src/i18n/es.ts` o `src/i18n/en.ts` |
| Añadir una animación de boot | `src/components/os/BootScreen.tsx` |
| Cambiar cómo se ve un proyecto por dentro | `src/components/project/ProjectWindow.tsx` |

---

## 📁 Anatomía de un proyecto (MDX)

Cada proyecto en `src/content/projects/` sigue este esquema. **Respétalo siempre.**

```mdx
---
# CAMPOS OBLIGATORIOS
id: "androbox"
title: "AndroBox"
subtitle: "Developer Workbench"
zone: "android"           # "android" | "fullstack" | "ai-tools"
status: "active"          # "active" | "completed" | "archived"
date: "2026-05"
color: "#00d4aa"          # Color acento de esta carpeta/ventana

# CAMPOS OPCIONALES
hasImages: true           # false si no hay screenshots
githubUrl: "https://github.com/adrigm06/androbox"
demoUrl: ""               # Vacío si no hay demo
linkedinUrl: ""           # URL del proyecto en LinkedIn

# STACK (array de strings)
stack:
  - "Kotlin"
  - "Android SDK"
  - "Jetpack Compose"
  - "Clean Architecture"

# i18n: descripción en ambos idiomas
description:
  es: "Descripción corta en español (2-3 líneas max para la card)"
  en: "Short description in English (2-3 lines max for the card)"
---

<!-- Contenido largo en español -->
<Content lang="es">
Descripción detallada del proyecto en español...
</Content>

<!-- Contenido largo en inglés -->
<Content lang="en">
Detailed project description in English...
</Content>
```

### Reglas del schema:

- `zone` debe ser uno de los tres valores definidos. Si añades una zona nueva, actualiza también `src/data/projects.ts` y `src/components/os/Desktop.tsx`.
- `hasImages: true` activa el renderizado de `ProjectGallery`. Si es `true` pero no hay imágenes en `public/projects/{id}/screenshots/`, la galería muestra un placeholder de terminal, no un error.
- `color` es el acento visual de esa carpeta. Elige colores que contrasten bien sobre `--os-surface` (#161a23). Usa la misma paleta de acento para no saturar el escritorio.

---

## 🖼️ Gestión de imágenes de proyectos

```
public/projects/
├── {project-id}/
│   └── screenshots/
│       ├── 01.webp     # Formato preferido: WebP
│       ├── 02.webp
│       └── cover.webp  # Imagen principal (usada en vista de lista)
```

### Reglas de imágenes:
- **Formato:** WebP siempre. Si recibes JPG/PNG, conviértelos.
- **Tamaño:** Máximo 1200px de ancho. Comprime a <150KB por imagen.
- **Nombre:** Siempre numérico (`01`, `02`...) más `cover` para la principal.
- **Si no hay imágenes:** El componente `ProjectGallery` renderiza un bloque de terminal con el stack del proyecto en lugar de una galería vacía. No es un estado de error, es un estado válido y diseñado.

---

## 🪟 Sistema de ventanas — reglas de comportamiento

El `WindowManager` gestiona estas propiedades por ventana:

```typescript
interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  type: 'project' | 'profile' | 'quicklink';
}
```

### Reglas de UX para ventanas:
- **Click en carpeta** → abre ventana centrada con offset aleatorio pequeño (+/- 20px) para que no se apilen perfectamente.
- **Doble click en barra de título** → maximizar/restaurar.
- **Click en cualquier parte de la ventana** → la trae al frente (sube z-index).
- **Máximo de ventanas simultáneas:** 5. Si se supera, la más antigua se minimiza automáticamente.
- **Ventanas minimizadas:** aparecen en la barra de tareas como iconos clickeables para restaurar.
- **Mobile:** en pantallas < 768px, las ventanas se abren siempre fullscreen, sin drag. El escritorio muestra solo iconos en una cuadrícula.

---

## 🌍 i18n — cómo funciona

El sistema de idioma es un hook React ligero (`useLanguage.ts`) que:
1. Lee el idioma inicial de `localStorage` o del `navigator.language` del navegador.
2. Expone `{ lang, toggleLang }`.
3. Se pasa como contexto a los componentes que lo necesiten.

**No uses ninguna librería de i18n externa.** El volumen de texto no lo justifica.

Las traducciones de UI (labels de la barra de tareas, tooltips, etc.) están en `src/i18n/es.ts` y `src/i18n/en.ts`. Las descripciones de proyectos están en el propio MDX con el esquema `<Content lang="es/en">`.

---

## ⚡ Rendimiento — reglas no negociables

- **Core Web Vitals objetivo:** LCP < 1.5s, CLS = 0, INP < 100ms.
- **Imágenes:** siempre con `width` y `height` para evitar CLS. Usa `loading="lazy"` excepto en la imagen de perfil del usuario (above the fold).
- **Fuentes:** auto-hospedadas, con `font-display: swap`. Nunca Google Fonts en producción.
- **Animaciones:** respeta `prefers-reduced-motion`. Todas las animaciones de Framer Motion deben tener un fallback estático.
- **JavaScript:** solo se carga para las islas de React. El boot screen y el escritorio se hidratan con `client:load`. El resto, `client:visible` o `client:idle`.

```tsx
// ✅ Correcto
const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ❌ Incorrecto: animar sin comprobar la preferencia
animate={{ opacity: 1, y: 0 }}
```

---

## 🚫 Qué NO hacer

- **No añadir dependencias sin justificación.** Cada dependencia nueva debe justificarse en el PR/commit con por qué no se puede hacer sin ella.
- **No romper el schema de MDX.** Si necesitas un campo nuevo, añádelo como opcional y gestiona el caso `undefined` en el componente.
- **No inline styles** para cosas que deberían ser variables CSS o clases Tailwind.
- **No `console.log` en producción.** Usa solo en desarrollo y elimínalos antes de hacer commit.
- **No modificar `public/projects/` con imágenes sin comprimir.** Siempre WebP < 150KB.
- **No crear componentes de más de 200 líneas.** Si crece, divídelo.

---

## ✅ Checklist antes de cada commit

- [ ] TypeScript sin errores (`npm run type-check`)
- [ ] Ningún `any` nuevo introducido
- [ ] Imágenes nuevas en WebP y < 150KB
- [ ] Traducciones añadidas en ambos idiomas (`es.ts` y `en.ts`)
- [ ] `prefers-reduced-motion` respetado en animaciones nuevas
- [ ] Schema MDX válido si se tocó contenido de proyectos
- [ ] Probado en mobile (< 768px)
