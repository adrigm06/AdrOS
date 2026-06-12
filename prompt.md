# MASTER PROMPT — AdrOS Portfolio

> Pega este prompt completo al inicio de tu sesión con Claude Code, Cursor o cualquier agente que vayas a usar para construir el proyecto. Es autocontenido: no necesita contexto adicional.

---

## INSTRUCCIÓN PRINCIPAL

Eres el agente encargado de construir desde cero el portfolio personal **AdrOS** — un sitio web que simula un sistema operativo ficticio en el navegador. Debes construirlo completo, fase por fase, sin saltarte pasos ni improvisar decisiones de diseño o arquitectura. Todo está especificado. Tu trabajo es ejecutar con precisión y calidad.

**Antes de escribir una sola línea de código, lee este prompt entero.**

---

## CONTEXTO DEL PROYECTO

### Qué es
Un portafolio personal con estética de sistema operativo ficticio llamado **AdrOS**. No imita Windows ni macOS — tiene identidad visual propia. Al entrar, el sistema arranca con una secuencia de boot animada. Tras ella aparece un escritorio interactivo donde cada proyecto personal es una carpeta que se puede abrir en una ventana draggable.

### Para quién
- Reclutadores técnicos: necesitan ver proyectos y stack rápido → toggle de vista lista.
- Developers curiosos: explorarán, arrastrarán ventanas, encontrarán Easter eggs.
- Clientes potenciales: necesitan ver credibilidad técnica y capacidad de ejecución.

### Qué debe transmitir en 5 segundos
> "Este developer sabe lo que hace, cuida los detalles y sabe comunicar su trabajo."

---

## STACK TECNOLÓGICO — INAMOVIBLE

No sustituyas ninguna de estas tecnologías por alternativas sin aprobación explícita.

| Capa | Tecnología | Versión mínima |
|---|---|---|
| Framework | Astro | 4.x |
| UI interactiva | React | 19.x |
| Tipado | TypeScript | 5.x — strict: true |
| Animaciones | Framer Motion | última estable |
| Scroll / reveal | GSAP + Lenis | últimas estables |
| Estilos | TailwindCSS | 3.x |
| Contenido | Astro Content Collections (MDX) | incluido en Astro 4 |
| i18n | Hook custom ligero | sin librerías externas |
| Deploy target | Vercel | — |

**Dependencias prohibidas sin justificación escrita en el commit:**
- Ninguna librería de i18n externa (i18next, react-intl, etc.)
- Ningún framework CSS adicional (Bootstrap, Chakra, etc.)
- Ningún gestor de estado global (Redux, Zustand) — el estado de ventanas vive en un hook custom

---

## DESIGN SYSTEM — AdrOS

### Paleta de colores (variables CSS — nunca hardcoded en JSX)

```css
:root {
  --os-bg:          #0d0f14;
  --os-surface:     #161a23;
  --os-surface-2:   #1e2433;
  --os-border:      #2a2f3d;
  --os-accent:      #00d4aa;
  --os-accent-dim:  #00d4aa22;
  --os-accent-glow: #00d4aa44;
  --os-text:        #e2e8f0;
  --os-muted:       #64748b;
  --os-danger:      #ff4757;
  --os-warn:        #ffa502;
  --os-ok:          #2ed573;
  --font-mono:      'JetBrains Mono', monospace;
  --font-sans:      'Inter', sans-serif;
  --radius-sm:      4px;
  --radius-md:      8px;
  --radius-lg:      12px;
  --shadow-window:  0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4);
  --shadow-hover:   0 0 0 1px var(--os-accent-dim);
  --taskbar-h:      48px;
  --titlebar-h:     36px;
}
```

### Fuentes
- **JetBrains Mono** — auto-hospedada en `/public/fonts/`. Usada para: boot screen, nombres de carpeta, badges de stack, código dentro de README, reloj de la taskbar.
- **Inter** — auto-hospedada en `/public/fonts/`. Usada para: contenido de ventanas, descripciones, labels de zona, UI general.
- `font-display: swap` obligatorio en ambas. **Nunca Google Fonts CDN en producción.**

### Reglas de uso de color
- Todos los elementos del OS usan variables `--os-*`. Prohibido `bg-gray-900`, `text-white`, etc. para el shell del OS.
- Los colores de acento de cada proyecto (definidos en su MDX) se aplican solo a: icono SVG de la carpeta, barra superior de su ventana y badges de stack.
- Nunca más de 4 colores de acento visibles simultáneamente en el escritorio.

### Iconografía
- Los iconos de carpeta son **SVG custom**, no emojis ni librerías de iconos.
- Los iconos de la taskbar (GitHub, LinkedIn, email) son SVG inline.
- Los logos de tecnologías en los badges se obtienen de `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/{name}/{name}-original.svg` cuando existan.

---

## ESTRUCTURA DE ARCHIVOS — EXACTA

Crea el proyecto con esta estructura. No añadas carpetas ni archivos no especificados sin justificación.

```
adrigm-portfolio/
├── public/
│   ├── fonts/
│   │   ├── JetBrainsMono-Regular.woff2
│   │   ├── JetBrainsMono-Bold.woff2
│   │   ├── Inter-Regular.woff2
│   │   └── Inter-Bold.woff2
│   ├── avatar.webp                     ← Foto de perfil del usuario
│   ├── favicon.ico
│   └── projects/
│       ├── androbox/screenshots/        ← cover.webp, 01-05.webp
│       ├── android-skill-pkg/screenshots/ ← cover.webp, 01.webp
│       ├── komea/screenshots/           ← cover.webp, 01.webp
│       ├── petconnect/screenshots/      ← cover.webp, 01.webp
│       └── lovepage/screenshots/        ← cover.webp, 01.webp
├── src/
│   ├── components/
│   │   ├── os/
│   │   │   ├── BootScreen.tsx
│   │   │   ├── Desktop.tsx
│   │   │   ├── DesktopZone.tsx
│   │   │   ├── FolderIcon.tsx
│   │   │   ├── Taskbar.tsx
│   │   │   ├── Window.tsx
│   │   │   └── WindowManager.tsx
│   │   ├── widgets/
│   │   │   ├── ClockWidget.tsx
│   │   │   ├── ProfileWindow.tsx
│   │   │   └── QuickLinks.tsx
│   │   ├── project/
│   │   │   ├── ProjectWindow.tsx
│   │   │   ├── ProjectReadme.tsx
│   │   │   ├── ProjectGallery.tsx
│   │   │   ├── ProjectStack.tsx
│   │   │   └── ProjectLinks.tsx
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── ViewToggle.tsx
│   │       └── LanguageToggle.tsx
│   ├── content/
│   │   └── projects/
│   │       ├── androbox.mdx
│   │       ├── betterprompt.mdx
│   │       ├── android-skill-pkg.mdx
│   │       ├── komea.mdx
│   │       ├── petconnect.mdx
│   │       ├── lovepage.mdx
│   │       └── vantagesystems.mdx
│   ├── data/
│   │   └── projects.ts
│   ├── hooks/
│   │   ├── useWindowManager.ts
│   │   ├── useDrag.ts
│   │   └── useLanguage.ts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   └── index.astro
│   ├── styles/
│   │   ├── global.css
│   │   └── animations.css
│   └── i18n/
│       ├── es.ts
│       └── en.ts
├── astro.config.mjs
├── tailwind.config.mjs
└── tsconfig.json
```

---

## SCHEMA MDX DE PROYECTOS — OBLIGATORIO

Cada archivo en `src/content/projects/` debe seguir exactamente este frontmatter. Los campos opcionales vacíos se dejan como string vacío `""`, nunca como `null` ni ausentes.

```typescript
// src/content/config.ts — inferido por Astro
const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  zone: z.enum(['android', 'fullstack', 'ai-tools']),
  status: z.enum(['active', 'completed', 'archived']),
  date: z.string(), // formato "YYYY-MM"
  color: z.string(), // hex color
  hasImages: z.boolean(),
  githubUrl: z.string(),
  demoUrl: z.string(),
  linkedinUrl: z.string(),
  stack: z.array(z.string()),
  description: z.object({
    es: z.string(),
    en: z.string(),
  }),
});
```

Los 7 proyectos con sus datos completos:

```
ID                  | Título                          | Zona      | hasImages | GitHub                              | Demo                    | Color
androbox            | AndroBox — Developer Workbench  | android   | true      | ""                                  | ""                      | #00d4aa
betterprompt        | BetterPrompt                    | ai-tools  | false     | https://github.com/adrigm06/BetterPrompt | ""               | #a78bfa
android-skill-pkg   | Android Engineering Skill Pkg   | ai-tools  | true      | ""                                  | ""                      | #f59e0b
komea               | Komea                           | android   | true      | ""                                  | ""                      | #34d399
petconnect          | PetConnect                      | fullstack | true      | ""                                  | ""                      | #60a5fa
lovepage            | LovePage                        | fullstack | true      | https://github.com/adrigm06/LovePage | ""                     | #f472b6
vantagesystems      | VantageSystems                  | fullstack | false     | ""                                  | https://vantagesystems.eu | #818cf8
```

Stack por proyecto:
- **androbox:** Kotlin, Android SDK, Android Jetpack, Jetpack Compose, Clean Architecture, Mobile Development
- **betterprompt:** TypeScript, Node.js, LLM Integration, TUI, Heuristic Analysis
- **android-skill-pkg:** Kotlin, Android, Artificial Intelligence, Clean Architecture, NPM, Open Source
- **komea:** Kotlin, Jetpack Compose, Android Jetpack, Generative AI, MVVM, Clean Architecture, Material Design 3
- **petconnect:** Java 21, Spring Boot 3.4, Spring Security, JWT, PostgreSQL, Supabase, React.js, TypeScript, Leaflet, JPA
- **lovepage:** HTML5, CSS3, JavaScript, Node.js, Express.js, PostgreSQL, REST API, GitHub Pages, Render
- **vantagesystems:** Astro 4, React 19, TypeScript, TailwindCSS, GSAP, Lenis, Zod, React Hook Form, SEO Técnico, i18n

---

## FLUJO DE USUARIO — IMPLEMENTAR EXACTAMENTE

```
1. Usuario entra a la URL
   └── BootScreen se muestra (fondo #000, texto JetBrains Mono, color --os-accent)

2. Secuencia de boot (timings exactos):
   t=0ms    → Cursor parpadeante solo
   t=200ms  → "AdrOS v1.0.0"
   t=600ms  → "Copyright © 2026 Adrián García M."
   t=1000ms → línea vacía
   t=1100ms → "Initializing file system..."
   t=1400ms → "Loading projects... [████████░░] 82%"
   t=1600ms → "Loading projects... [██████████] 100%"
   t=1900ms → "All systems nominal."
   t=2100ms → línea vacía
   t=2200ms → "Welcome, visitor. Enjoy the tour."
   t=2500ms → fade out BootScreen (300ms)
   t=2700ms → fade in Desktop (400ms)

   ATAJO: Click o Space/Enter en cualquier momento salta al escritorio.
   La barra de progreso NO es lineal — tiene micro-pausas para parecer real.

3. Desktop aparece con stagger animation:
   - Zona android (top-left): delay 0ms
   - Zona fullstack (top-right): delay 100ms
   - Zona ai-tools (bottom-left): delay 200ms
   - QuickLinks (bottom-right): delay 300ms
   - Taskbar sube desde abajo: delay 150ms

4. Usuario interactúa:
   - Click en carpeta → abre ProjectWindow (ventana draggable)
   - Click en avatar (taskbar izq) → abre ProfileWindow
   - Toggle EN/ES (taskbar der) → cambia idioma al vuelo sin reload
   - Toggle iconos/lista (taskbar der) → cambia vista del escritorio
   - Click en GitHub/LinkedIn/email (quicklinks) → nueva pestaña
   - Drag de ventanas por su titlebar
   - Doble click en titlebar → maximizar/restaurar
   - Click en cualquier parte de ventana → la trae al frente (z-index)
   - Minimizar ventana → aparece como icono en taskbar centro-izq
   - Click en icono minimizado → restaura ventana
```

---

## SISTEMA DE VENTANAS — IMPLEMENTACIÓN COMPLETA

### Interface WindowState

```typescript
interface WindowState {
  id: string;                              // project id o 'profile'
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  type: 'project' | 'profile';
  projectId?: string;                      // solo para type 'project'
}
```

### Hook useWindowManager

```typescript
// Lógica completa que debe implementar:
openWindow(id: string, type: 'project' | 'profile', projectId?: string): void
// - Calcula posición inicial centrada + offset aleatorio (-20 a +20px en X e Y)
// - Asigna zIndex = Math.max(...windows.map(w => w.zIndex)) + 1
// - Si ya hay 5 ventanas abiertas, minimiza la de zIndex más bajo antes de abrir
// - Si la ventana ya existe (isOpen: true o isMinimized: true), solo la trae al frente

closeWindow(id: string): void
minimizeWindow(id: string): void
maximizeWindow(id: string): void
// - Guarda la posición y tamaño previos para restaurar
restoreWindow(id: string): void
bringToFront(id: string): void
// - zIndex = Math.max(...) + 1
updatePosition(id: string, pos: { x: number; y: number }): void
```

### Hook useDrag

```typescript
// Debe manejar:
// - mousedown/mousemove/mouseup (desktop)
// - touchstart/touchmove/touchend (mobile/tablet)
// - bounds: nunca dejar la ventana fuera del viewport
//   - mínimo: titlebar siempre visible (al menos 60px de titlebar dentro del viewport)
//   - máximo: no pasar de los bordes del viewport
// - isDragging: true mientras se arrastra (aplica cursor: grabbing al body)
// - onDragEnd: callback con posición final

const { dragRef, isDragging } = useDrag({
  initialPosition: { x: number; y: number },
  onDragEnd: (pos: { x: number; y: number }) => void,
  disabled: boolean, // true en mobile < 768px o cuando isMaximized
});
```

### Tamaños de ventana

```typescript
const WINDOW_DEFAULTS = {
  project: { width: 720, height: 520 },
  profile: { width: 560, height: 380 },
};
// En mobile < 768px: width: '100vw', height: 'calc(100vh - 48px)', position: {x:0, y:0}
```

### Anatomía visual de Window.tsx

```
┌─────────────────────────────────────────────────────────┐ ← border: 1px solid --os-border
│ ●  ●  ●  │  📁  {title}                          [─]  │ ← titlebar h:36px bg:--os-surface-2
├─────────────────────────────────────────────────────────┤ ← border-bottom: 1px solid --os-border
│                                                         │
│   {children — contenido de ProjectWindow o Profile}     │ ← overflow-y: auto
│                                                         │
└─────────────────────────────────────────────────────────┘ ← resize handle esquina inf-der (solo >768px)
```

- Los tres círculos: 12px de diámetro, gap 8px. Colores: --os-danger, --os-warn, --os-ok.
- Hover en los círculos: aparece el símbolo (×, −, ⤢) dentro.
- El [─] de la derecha es el botón de minimizar alternativo (mismo que el círculo amarillo).
- box-shadow: --shadow-window
- border-radius: --radius-lg en las esquinas superiores; --radius-sm en las inferiores si no está maximizada.
- Animación de apertura (Framer Motion):
  ```typescript
  initial: { opacity: 0, scale: 0.92, y: 8 }
  animate: { opacity: 1, scale: 1, y: 0 }
  exit: { opacity: 0, scale: 0.88, y: 12 }
  transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] }
  ```
- Animación de minimizar: la ventana "vuela" hacia el icono en la taskbar (transform + opacity).
- Ventana maximizada: ocupa `calc(100vw)` × `calc(100vh - 48px)`, posición {x:0, y:0}, sin border-radius, con transición suave de 200ms.

---

## LAYOUT DEL ESCRITORIO

### CSS Grid (Desktop.tsx)

```css
.desktop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
    "android    fullstack"
    "ai-tools   quicklinks";
  gap: 12px;
  padding: 12px;
  height: calc(100vh - var(--taskbar-h));
  position: relative; /* para que las ventanas absolutas se posicionen respecto al viewport */
}
```

### DesktopZone.tsx

Cada zona es un panel con:
- Fondo: `rgba(22, 26, 35, 0.6)` (--os-surface con transparencia)
- Border: `1px solid var(--os-border)`
- Border-radius: `--radius-lg`
- `backdrop-filter: blur(4px)`
- Label en esquina superior izquierda: texto muted, font-mono, font-size 10px, uppercase, letter-spacing 0.1em
- Carpetas en flex-wrap con gap 16px, padding 12px, alineadas al inicio
- Si la zona tiene más de 4 carpetas: overflow-y auto con scroll suave interno (no del escritorio)
- La zona `quicklinks` tiene los iconos de acceso directo + el widget de perfil al fondo-derecha

### Responsive breakpoints

```
< 480px:
  - grid: 1 columna, 4 filas (zonas apiladas)
  - ViewToggle no aparece → siempre vista lista
  - Ventanas siempre fullscreen

480px–768px:
  - grid: 1 columna, 4 filas
  - ViewToggle visible
  - Ventanas fullscreen

768px–1024px:
  - grid: 2 columnas, 2 filas
  - Ventanas draggables, sin resize
  - Experiencia casi completa

> 1024px:
  - Experiencia completa
```

---

## CARPETAS — FolderIcon.tsx

### Estados visuales

```
NORMAL:
  SVG carpeta cerrada, color = project.color con opacity 0.85
  Label: font-mono 11px, --os-muted
  Indicador activo: oculto

HOVER:
  SVG carpeta ligeramente abierta, color = project.color opacity 1.0
  Label: --os-text
  Scale: 1.05 (transform, 150ms ease)
  Tooltip: aparece arriba con las 3 primeras tecnologías del stack
  box-shadow: --shadow-hover

FOCUSED (ventana abierta):
  SVG carpeta abierta, color = project.color opacity 1.0 + drop-shadow del color
  Label: --os-text, text-decoration: underline
  Indicador activo: punto de 6px del color del proyecto, centrado debajo del icono

DRAGGING (mientras el usuario arrastra la ventana):
  La carpeta no cambia — el estado se lee de WindowManager
```

### SVG de carpeta
- Dibuja un SVG custom de carpeta (no uses emojis ni iconos de librerías).
- El cuerpo de la carpeta usa el `color` del proyecto.
- La solapa superior de la carpeta tiene el mismo color con un 20% más de luminosidad.
- Tamaño del icono: 48x48px. Área clickeable total incluyendo label: mínimo 80x80px.

### Tooltip
- Aparece 300ms después de inicio del hover (no inmediato).
- Posición: encima del icono, centrado.
- Contenido: `{tech1} · {tech2} · {tech3}` (máximo 3, el resto se omite).
- Fondo: --os-surface-2, border: --os-border, font-mono 10px.
- Desaparece al salir del hover o al abrir la ventana.

---

## CONTENIDO DE VENTANAS DE PROYECTO

### ProjectWindow.tsx

Estructura de tabs dentro de la ventana:

```
[README]  [Screenshots?]  [Stack]  [Links]
```

- La tab `Screenshots` solo aparece si `project.hasImages === true`.
- La tab activa tiene: border-bottom 2px del color del proyecto, texto --os-text.
- Las tabs inactivas: --os-muted, hover --os-text.
- Cambio de tab: fade suave de 150ms (AnimatePresence de Framer Motion).

### Tab README — ProjectReadme.tsx

Renderiza el contenido MDX en el idioma activo. Estilos tipográficos:

```css
h2: font-sans, 18px, color: --os-accent, margin-bottom: 12px
h3: font-sans, 15px, color: --os-text, margin-bottom: 8px
p: font-sans, 14px, color: --os-text, line-height: 1.7, margin-bottom: 12px
ul/li: mismos estilos que p, list-style: disc, padding-left: 20px
code: font-mono, 13px, bg: --os-bg, color: --os-accent, padding: 2px 6px, border-radius: --radius-sm
a: color: --os-accent, text-decoration: underline, hover: opacity 0.8
```

### Tab Screenshots — ProjectGallery.tsx

**Si hasImages: true:**
```
Layout:
  ┌─────────────────────────────────┐
  │         cover.webp              │  ← imagen principal, object-fit: contain, max-h: 280px
  └─────────────────────────────────┘
  [01] [02] [03] ...                   ← thumbnails 80x60px, click → swap imagen principal
                                        ← animación: fade 150ms al cambiar imagen
```

- Imagen con `width` y `height` siempre definidos para CLS = 0.
- `loading="lazy"` en todos excepto cover.webp.
- Si hay un `.mp4` convertido a `<video>`: `autoPlay muted loop playsInline`, sin controles.

**Si hasImages: false:** Esta tab no existe. No renderizar placeholder dentro de ella.

### Tab Stack — ProjectStack.tsx

Grid de badges, 3 columnas en desktop, 2 en mobile:

```
Cada badge:
  - Logo de la tecnología (devicons CDN) si existe, si no: inicial del nombre
  - Nombre de la tecnología
  - Fondo: --os-surface-2
  - Border: 1px solid --os-border
  - Hover: border-color = color del proyecto
  - font-mono, 12px
  - Si el logo CDN falla → ocultar img, mostrar solo texto (no imagen rota)
```

### Tab Links — ProjectLinks.tsx

Botones alineados horizontalmente (wrap en mobile):

```typescript
// Solo renderizar botones con URL no vacía
const links = [
  { label: 'GitHub', url: project.githubUrl, icon: GithubIcon },
  { label: 'Demo en vivo', url: project.demoUrl, icon: ExternalIcon },
  { label: 'LinkedIn', url: project.linkedinUrl, icon: LinkedinIcon },
].filter(l => l.url !== '');
```

Estilo de botón:
- Fondo: --os-surface-2
- Border: 1px solid --os-border
- Hover: fondo = color del proyecto con 15% opacity, border-color = color del proyecto
- font-sans, 13px
- Abrir en `target="_blank" rel="noopener noreferrer"`

---

## BARRA DE TAREAS — Taskbar.tsx

```
Layout: height 48px, bg --os-surface, border-top 1px --os-border, backdrop-filter blur(8px)
Posición: fixed bottom 0, left 0, right 0, z-index 9999

Secciones (flex row, items-center):
  ┌──────────────────────────────────────────────────────────────────┐
  │ LEFT (flex-shrink 0):                                            │
  │   [avatar 28px] [Adrián] │ [iconos ventanas minimizadas]        │
  │                                                                  │
  │ CENTER (flex-grow 1, text-center):                               │
  │   AdrOS  (font-mono, 13px, --os-muted, letter-spacing 0.15em)  │
  │                                                                  │
  │ RIGHT (flex-shrink 0):                                           │
  │   [ViewToggle] [12:34:56] [EN|ES]                               │
  └──────────────────────────────────────────────────────────────────┘
```

### Avatar + nombre (izquierda)
- Avatar: `<img src="/avatar.webp">`, 28px x 28px, border-radius 50%, border 2px --os-accent.
- Nombre: "Adrián", font-sans 13px, --os-text.
- Click en todo el bloque → abre ProfileWindow.
- Hover: fondo --os-surface-2 suave.

### Ventanas minimizadas (centro-izquierda)
- Aparecen como pequeños iconos (20px) del color del proyecto, con el nombre truncado.
- Click → restaura la ventana.
- Animación de entrada: slide desde abajo + fade.
- Separados del bloque de avatar por un separador vertical `|` de 1px --os-border.

### Reloj (derecha)
- Formato: `HH:MM:SS` en España (24h).
- Actualiza cada segundo con `setInterval`.
- font-mono, 12px, --os-muted.
- Easter egg: a medianoche exacta (00:00:00), hace un glitch visual de 1 segundo (flicker de color + pequeño shake).

### ViewToggle
- Dos estados: iconos (grid icon) / lista (list icon).
- SVG inline de 16px.
- Hover: --os-accent.

### LanguageToggle
- Muestra el idioma actual: `ES` o `EN`.
- Click → cambia idioma al vuelo.
- font-mono, 12px.
- Transición: fade 200ms.
- Anuncia cambio con `aria-live="polite"`.

---

## VENTANA DE PERFIL — ProfileWindow.tsx

Se abre como una ventana normal del sistema (draggable, con los tres botones).

```
Tamaño: 560 x 380px (desktop), fullscreen (mobile)
Posición inicial: centrada, igual que el resto de ventanas

Layout interno:
┌──────────────┬────────────────────────────────────┐
│              │  Adrián García M.                  │
│  avatar.webp │  Mobile & Full-Stack Developer     │
│  (120x120px) │  📍 Cártama, Málaga, España       │
│  border-r.50%│  ────────────────────────────────  │
│              │  Texto "sobre mí" (2-3 líneas)    │
│              │                                    │
│              │  [ GitHub ]  [ LinkedIn ]  [ Email]│
└──────────────┴────────────────────────────────────┘
```

- La imagen tiene `loading="eager"` (es above the fold cuando se abre).
- Los botones de links usan el mismo estilo que ProjectLinks.
- Texto "sobre mí": font-sans 14px, --os-text, line-height 1.7.

Texto fijo del perfil (en ambos idiomas):

```
ES:
Nombre: Adrián García M.
Título: Mobile & Full-Stack Developer
Ubicación: Cártama, Málaga, España
Bio: Apasionado por Android nativo, Clean Architecture y el detalle en la experiencia de usuario. Construyo herramientas que resuelven problemas reales.

EN:
Name: Adrián García M.
Title: Mobile & Full-Stack Developer
Location: Cártama, Málaga, Spain
Bio: Passionate about native Android, Clean Architecture and the detail in user experience. I build tools that solve real problems.
```

Links del perfil:
- GitHub: `https://github.com/adrigm06`
- LinkedIn: (añadir URL real)
- Email: (añadir email real)

---

## QUICKLINKS — QuickLinks.tsx

Zona inferior-derecha del escritorio. Contenido:

```
Iconos grandes (40px) en grid 2x2 o flex-wrap:
  [GitHub]    [LinkedIn]
  [Email]     [CV PDF]

Debajo, separado:
  [ 👤 Sobre mí ]  ← botón que abre ProfileWindow, más prominente
```

- Cada icono: SVG 40px, label debajo, hover = scale(1.1) + glow del --os-accent.
- El CV PDF: enlaza a `/cv-adrian-garcia.pdf` en public. (Placeholder si no existe aún.)
- "Sobre mí": botón más grande, border 1px --os-accent, fondo --os-accent-dim.

---

## SISTEMA i18n

### useLanguage.ts

```typescript
type Lang = 'es' | 'en';

export function useLanguage() {
  const [lang, setLang] = useState<Lang>(() => {
    // 1. Leer de localStorage
    const saved = localStorage.getItem('adros-lang') as Lang | null;
    if (saved === 'es' || saved === 'en') return saved;
    // 2. Leer del navegador
    const browser = navigator.language.startsWith('es') ? 'es' : 'en';
    return browser;
  });

  const toggleLang = () => {
    const next = lang === 'es' ? 'en' : 'es';
    setLang(next);
    localStorage.setItem('adros-lang', next);
  };

  return { lang, toggleLang };
}
```

Pasar el contexto con React Context para no hacer prop drilling:

```typescript
const LanguageContext = createContext<{ lang: Lang; toggleLang: () => void } | null>(null);
```

### Archivos de traducción

`src/i18n/es.ts` y `src/i18n/en.ts` deben contener al menos:

```typescript
export const translations = {
  // Taskbar
  taskbar_os_name: 'AdrOS',
  taskbar_lang_toggle: 'EN',  // el idioma AL QUE se cambia, no el actual

  // Zonas del escritorio
  zone_android: '📱 Android & Mobile',
  zone_fullstack: '🌐 Full-Stack & Web',
  zone_ai_tools: '🛠️ IA & Herramientas',   // EN: '🛠️ AI & Tools'
  zone_quicklinks: '📌 Accesos directos',    // EN: '📌 Quick Access'

  // Ventana de proyecto — tabs
  tab_readme: 'README',
  tab_screenshots: 'Screenshots',
  tab_stack: 'Stack',
  tab_links: 'Links',

  // Vista lista
  list_col_name: 'Proyecto',     // EN: 'Project'
  list_col_zone: 'Categoría',    // EN: 'Category'
  list_col_stack: 'Stack',
  list_col_date: 'Fecha',        // EN: 'Date'

  // Perfil
  profile_title: 'Adrián García — adrigm',
  profile_role: 'Mobile & Full-Stack Developer',
  profile_location: '📍 Cártama, Málaga, España',  // EN: '📍 Cártama, Málaga, Spain'
  profile_bio: 'Apasionado por Android nativo...', // EN: 'Passionate about native Android...'

  // QuickLinks
  quicklinks_github: 'GitHub',
  quicklinks_linkedin: 'LinkedIn',
  quicklinks_email: 'Email',
  quicklinks_cv: 'Descargar CV',   // EN: 'Download CV'
  quicklinks_about: 'Sobre mí',    // EN: 'About me'

  // Tooltips
  tooltip_open_folder: 'Abrir proyecto',   // EN: 'Open project'
  tooltip_minimize: 'Minimizar',           // EN: 'Minimize'
  tooltip_maximize: 'Maximizar',           // EN: 'Maximize'
  tooltip_close: 'Cerrar',                 // EN: 'Close'
};
```

---

## VISTA LISTA — ViewToggle

Cuando `viewMode === 'list'`, el escritorio muestra todas las carpetas como una tabla:

```
Columnas: [icono] [Nombre] [Categoría] [Stack (3 primeras)] [Año] [→ abrir]

Estilo:
- Fondo: transparente
- Filas alternas: --os-surface con 30% opacity
- Hover fila: --os-surface-2
- Separador entre filas: 1px --os-border
- Font-mono para nombre y stack
- Font-sans para categoría y año
- El → al final es un botón que abre la ventana del proyecto
- Ordenadas por fecha descendente (más reciente primero)
```

Transición entre vistas (Framer Motion AnimatePresence):
```typescript
// Vista iconos → lista: las carpetas se "reordenan" en tabla
// Usar layoutId en FolderIcon para animación de posición continua
```

---

## ANIMACIONES — ESPECIFICACIÓN COMPLETA

### Principios
- Todas las animaciones respetan `prefers-reduced-motion: reduce`.
- Con reduced motion: sin transiciones de posición ni scale, solo fade (opacity) si hace falta.
- Duración máxima de cualquier animación de UI: 300ms. Boot screen puede ser más larga.
- Easing estándar del sistema: `[0.16, 1, 0.3, 1]` (ease out expo) para apertura, `[0.4, 0, 1, 1]` para cierre.

### Checklist de animaciones a implementar

**Boot Screen:**
- [x] Cursor parpadeante (CSS keyframes, 0.7s blink)
- [x] Aparición de cada línea de texto (opacity 0→1, translateY 4px→0, 80ms cada una)
- [x] Barra de progreso con micro-pausas no lineales
- [x] Fade out del boot screen (opacity 1→0, 300ms)

**Desktop:**
- [x] Fade in del escritorio tras boot (opacity 0→1, 400ms, delay 2700ms)
- [x] Stagger de zonas (cada zona: opacity 0→1 + translateY 12px→0, delays: 0, 100, 200, 300ms)
- [x] Taskbar sube desde abajo (translateY 48px→0, 300ms, delay 150ms)

**FolderIcon:**
- [x] Hover: scale 1→1.05, 150ms
- [x] Tooltip: opacity 0→1 + translateY 4px→0, 200ms, delay 300ms desde hover
- [x] Click (apertura): scale 1→0.95→1, 100ms (pequeño "press")

**Window:**
- [x] Apertura: opacity 0→1, scale 0.92→1, translateY 8px→0, 180ms
- [x] Cierre: opacity 1→0, scale 1→0.88, translateY 0→12px, 140ms
- [x] Maximizar: transición suave de posición y tamaño, 200ms
- [x] Minimizar: ventana "vuela" hacia el icono en taskbar (transform al punto del icono), 250ms
- [x] Restaurar desde minimizado: animación inversa al minimizar, 220ms
- [x] Cambio de tab interno: fade 150ms (AnimatePresence)
- [x] Resize: sin animación (inmediato)
- [x] Drag: cursor: grab durante drag, cursor: grabbing mientras se arrastra

**ViewToggle:**
- [x] Transición iconos→lista: AnimatePresence, cada item fade+slide 100ms con stagger

**LanguageToggle:**
- [x] Flip horizontal del texto: 200ms

**Taskbar:**
- [x] Aparición de icono de ventana minimizada: slide desde abajo + fade, 200ms
- [x] Desaparición: fade + slide hacia abajo, 150ms

**Easter Eggs:**
- [x] Glitch del reloj a medianoche: flicker de color (--os-accent ↔ --os-danger) 5 veces + translateX(±2px) shake, 1 segundo total
- [x] Notificación del AdrOS: slide desde abajo-derecha, 300ms

---

## ACCESIBILIDAD — OBLIGATORIO

- Todas las carpetas: `tabIndex={0}`, `role="button"`, `aria-label="Abrir proyecto {nombre}"`.
- Enter/Space sobre carpeta → abre ventana (misma acción que click).
- Ventanas: `role="dialog"`, `aria-label="{título del proyecto}"`, `aria-modal="true"`.
- Foco se mueve a la ventana al abrirse, vuelve a la carpeta al cerrarla.
- Botones de ventana (cerrar/min/max): `aria-label` explícito.
- Toggle de idioma: `aria-live="polite"` para anunciar el cambio.
- ViewToggle: `aria-label` describe la vista actual y la acción de cambiar.
- Contraste mínimo: 4.5:1 en todo el texto principal. Verificar especialmente --os-muted sobre --os-surface.
- Imágenes de proyectos: `alt` descriptivo con nombre del proyecto y número de screenshot.
- Avatar: `alt="Foto de perfil de Adrián García"`.

---

## RENDIMIENTO — REGLAS NO NEGOCIABLES

**Objetivo Core Web Vitals: LCP < 1.5s, CLS = 0, INP < 100ms**

- Todas las imágenes tienen `width` y `height` definidos (CLS = 0).
- Solo `loading="eager"` en: avatar en profileWindow cuando está abierta. Todo lo demás: `loading="lazy"`.
- Fuentes auto-hospedadas con `font-display: swap`.
- `<link rel="preload">` para JetBrains Mono Regular (usada en el boot screen, above the fold).
- React solo se hidrata donde hay interactividad:
  - `BootScreen`: `client:load`
  - `Desktop` (contiene todo el OS): `client:load`
  - El resto de la página (si hubiera): `client:visible` o `client:idle`
- No `console.log` fuera de bloques `if (import.meta.env.DEV)`.
- Animaciones de Framer Motion siempre con check de `prefers-reduced-motion`.
- Logos de devicons: lazy load con `loading="lazy"`, fallback al texto si la imagen falla (`onError`).

---

## EASTER EGGS — IMPLEMENTAR

1. **Typing "ls":** Si el usuario escribe `l` seguido de `s` en el teclado cuando ningún input está enfocado, aparece una notificación tipo terminal: "$ ls projects/" seguida de la lista de IDs de proyectos. Desaparece en 4 segundos.

2. **Reloj a medianoche:** El ClockWidget detecta cuando el tiempo es exactamente `00:00:00` y ejecuta el glitch de 1 segundo.

3. **Click × 5 en "AdrOS":** El label central de la taskbar. Al quinto click consecutivo en menos de 3 segundos, aparece una notificación: `"Nice try. There's nothing here... yet."`. Resetea el contador tras mostrarla.

4. **Konami code:** ↑ ↑ ↓ ↓ ← → ← → B A. Activa un theme de alto contraste (class `theme-high-contrast` en el body) que invierte el esquema de colores. Otro Konami code lo desactiva.

---

## QUÉ NO HACER — LISTA ROJA

El agente NO debe hacer ninguna de estas cosas bajo ninguna circunstancia:

- ❌ Usar `any` en TypeScript. Usar `unknown` + narrowing o el tipo correcto.
- ❌ Hardcodear colores que no sean los `color` de cada proyecto. Todo pasa por variables CSS `--os-*`.
- ❌ Escribir datos de proyectos en JSX. Todo viene de las Content Collections.
- ❌ Añadir librerías de i18n externas.
- ❌ Convertir archivos `.astro` en componentes React sin necesidad.
- ❌ Cargar JavaScript innecesario (componentes estáticos con `client:load`).
- ❌ Crear componentes de más de 200 líneas. Dividir si crece.
- ❌ Usar `console.log` fuera de bloques de desarrollo.
- ❌ Colocar imágenes sin `width` y `height` definidos.
- ❌ Animar sin comprobar `prefers-reduced-motion`.
- ❌ Añadir dependencias nuevas sin comentario justificando por qué no se puede hacer sin ellas.
- ❌ Dejar la tab `Screenshots` en la UI si `hasImages === false`. La tab no existe, no está vacía.
- ❌ Mostrar botones de links con URLs vacías. Si la URL es `""`, el botón no se renderiza.
- ❌ Hacer que el escritorio entero haga scroll. El scroll es interno a cada zona o ventana.
- ❌ Usar posicionamiento absoluto para las carpetas en el escritorio. Usan flexbox dentro de cada zona.
- ❌ Olvidarse de `rel="noopener noreferrer"` en todos los `target="_blank"`.
- ❌ Dejar el resize habilitado en mobile (< 768px).

---

## ORDEN DE CONSTRUCCIÓN — SEGUIR ESTA SECUENCIA

El agente debe construir fase por fase. No avances a la siguiente sin tener la actual funcionando.

### FASE 1 — Fundación (sin UI visible)
1. `npm create astro@latest` con template minimal, TypeScript strict
2. Instalar dependencias: `react`, `@astrojs/react`, `tailwindcss`, `framer-motion`, `gsap`, `lenis`, `@astrojs/mdx`
3. Configurar `astro.config.mjs` con integrations: react, tailwind, mdx
4. Configurar `tsconfig.json` con `strict: true` y path aliases (`@/` → `src/`)
5. Crear `src/styles/global.css` con TODAS las variables `--os-*` y reset CSS del OS
6. Crear `tailwind.config.mjs` con los colores del OS como tokens de Tailwind
7. Crear `src/content/config.ts` con el schema de proyectos (zod)
8. Crear los 7 archivos `.mdx` de proyectos con el contenido completo
9. Crear `src/data/projects.ts` con ZONES y metadata
10. Crear `src/i18n/es.ts` y `src/i18n/en.ts`
11. Descargar fuentes JetBrains Mono e Inter a `/public/fonts/` y configurar @font-face en global.css

**Checkpoint:** `npm run type-check` sin errores. `npm run dev` levanta sin crashes.

### FASE 2 — Shell del OS
12. `src/layouts/BaseLayout.astro` — HTML base, meta tags, preload de fuentes, global.css
13. `src/components/os/BootScreen.tsx` — secuencia completa con timings exactos, skip con click/space
14. `src/pages/index.astro` — monta BootScreen y Desktop
15. `src/components/os/Desktop.tsx` — grid layout, sin contenido real aún (zonas vacías)
16. `src/components/os/Taskbar.tsx` — estructura visual completa, reloj funcional, sin lógica de ventanas aún

**Checkpoint:** Boot screen funciona, se puede saltar, transición al escritorio visible (aunque vacío).

### FASE 3 — Sistema de ventanas
17. `src/hooks/useDrag.ts` — mouse + touch, bounds del viewport
18. `src/hooks/useWindowManager.ts` — toda la lógica de estado
19. `src/components/os/Window.tsx` — shell visual completo (titlebar, botones, resize, animaciones de Framer Motion)
20. `src/components/os/WindowManager.tsx` — renderiza las ventanas abiertas con AnimatePresence
21. Conectar WindowManager al Desktop y al Taskbar (ventanas minimizadas)

**Checkpoint:** Se puede abrir una ventana vacía, arrastrarla, minimizarla, maximizarla, cerrarla.

### FASE 4 — Carpetas y proyectos
22. `src/components/os/FolderIcon.tsx` — SVG custom, estados, tooltip, indicador activo
23. `src/components/os/DesktopZone.tsx` — panel con label, flex-wrap de carpetas
24. Conectar zonas con datos de proyectos (leer desde Content Collections)
25. `src/components/project/ProjectWindow.tsx` — tabs, cambio de tab animado
26. `src/components/project/ProjectReadme.tsx` — renderizar MDX con estilos del OS
27. `src/components/project/ProjectGallery.tsx` — galería con thumbnails (condicional)
28. `src/components/project/ProjectStack.tsx` — badges con logos de devicons
29. `src/components/project/ProjectLinks.tsx` — botones filtrados

**Checkpoint:** Click en una carpeta abre la ventana con contenido real del proyecto. Las tabs funcionan. Las imágenes se muestran cuando hasImages: true.

### FASE 5 — Perfil, QuickLinks, i18n
30. `src/components/widgets/ProfileWindow.tsx` — layout foto + info + links
31. `src/components/widgets/QuickLinks.tsx` — iconos y botón "sobre mí"
32. `src/hooks/useLanguage.ts` — hook con localStorage y navigator.language
33. Crear LanguageContext y envolver el Desktop
34. `src/components/ui/LanguageToggle.tsx`
35. Conectar i18n a todos los componentes (taskbar, zonas, ventanas, perfil)

**Checkpoint:** Toggle de idioma funciona. Todo el texto cambia sin reload. El perfil se abre desde el avatar.

### FASE 6 — Polish, toggle de vista y Easter eggs
36. `src/components/ui/ViewToggle.tsx` — toggle iconos/lista con AnimatePresence
37. Vista lista: tabla completa con animación de transición
38. Animaciones de entrada del escritorio (stagger de zonas)
39. Easter eggs: ls, glitch reloj, AdrOS clicks, Konami code
40. Revisión completa de `prefers-reduced-motion` en todos los componentes
41. Lighthouse audit — objetivo > 95 en Performance, 100 en Accessibility
42. Optimización de imágenes si hace falta
43. Meta tags completos en BaseLayout (OG, Twitter Card, description)
44. favicon.ico

**Checkpoint final:** Lighthouse > 95/100/100/100. TypeScript sin errores. Funciona en mobile. Easter eggs activos.

---

## ARCHIVOS DE CONFIGURACIÓN MÍNIMOS

### astro.config.mjs
```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [react(), tailwind(), mdx()],
  output: 'static',
});
```

### tailwind.config.mjs
```javascript
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'os-bg': 'var(--os-bg)',
        'os-surface': 'var(--os-surface)',
        'os-surface-2': 'var(--os-surface-2)',
        'os-border': 'var(--os-border)',
        'os-accent': 'var(--os-accent)',
        'os-text': 'var(--os-text)',
        'os-muted': 'var(--os-muted)',
      },
      fontFamily: {
        mono: ['var(--font-mono)'],
        sans: ['var(--font-sans)'],
      },
    },
  },
};
```

### tsconfig.json (fragmento relevante)
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## INSTRUCCIÓN FINAL PARA EL AGENTE

Cuando termines cada fase, dime:
1. Qué archivos creaste/modificaste
2. Qué funciona y puedo verificar en el navegador
3. Si hay algo que requiere assets que el usuario debe aportar (imágenes, foto de perfil, URLs reales de LinkedIn/email)

No avances a la siguiente fase hasta que yo confirme que el checkpoint está superado.

Si en algún momento encuentras una ambigüedad no cubierta por este documento, pregunta antes de improvisar. La coherencia con la especificación es más importante que la velocidad de desarrollo.

**Empieza por la FASE 1.**
