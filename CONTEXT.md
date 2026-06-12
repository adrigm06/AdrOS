# CONTEXT.md — Arquitectura, Diseño y Plan de Construcción

> Documento de referencia técnica y creativa para el desarrollo del portfolio AdrOS. Contiene todas las decisiones tomadas, el razonamiento detrás de ellas y el orden de construcción recomendado.

---

## 1. Visión del producto

### ¿Qué es AdrOS?
Un portafolio personal presentado como un **sistema operativo ficticio** que vive en el navegador. No imita a ningún OS real — tiene identidad visual propia. Oscuro, técnico, limpio. Al visitar la URL, el sistema "arranca" con una secuencia de boot, y tras ella aparece un escritorio interactivo donde cada proyecto personal es una carpeta.

### ¿Para quién es?
- **Reclutadores técnicos:** Necesitan ver proyectos, stack y contexto rápido. El toggle de vista lista se lo pone fácil.
- **Developers curiosos:** Explorarán el escritorio, arrastrarán ventanas, encontrarán Easter eggs.
- **Clientes potenciales (via VantageSystems):** Necesitan ver credibilidad técnica y capacidad de ejecución.

### ¿Qué debe transmitir en 5 segundos?
> *"Este developer sabe lo que hace, cuida los detalles y sabe comunicar su trabajo."*

---

## 2. Experiencia de usuario completa (flujo)

```
[Entrada a la URL]
       │
       ▼
[BOOT SCREEN]
  · Fondo negro
  · Texto de sistema aparece línea a línea (typewriter)
    "AdrOS v1.0 — Initializing..."
    "Loading projects... [████████░░] 80%"
    "Welcome, visitor."
  · Duración: ~2.5s (saltable con click/tecla)
       │
       ▼
[FADE IN → ESCRITORIO]
  · Aparecen las zonas con stagger animation (cada zona con 100ms de delay)
  · La barra de tareas sube desde abajo
  · Los iconos de acceso directo aparecen desde la derecha
       │
       ▼
[ESCRITORIO INTERACTIVO]
  · Usuario puede:
    - Hacer click en una carpeta → abre ventana de proyecto
    - Hacer click en avatar (barra de tareas) → abre ventana de perfil
    - Toggle EN/ES en la barra de tareas → cambia idioma al vuelo
    - Toggle iconos/lista → cambia la vista del escritorio
    - Hacer click en GitHub/LinkedIn/email → abre en nueva pestaña
    - Arrastrar ventanas, apilarlas, minimizarlas
```

---

## 3. Arquitectura de componentes

### Jerarquía principal

```
index.astro
└── BaseLayout.astro
    ├── BootScreen.tsx          [client:load]  — Se muestra primero, luego desaparece
    └── Desktop.tsx             [client:load]  — El escritorio completo
        ├── DesktopZone.tsx × 3                — Zonas temáticas
        │   └── FolderIcon.tsx × N             — Icono de carpeta por proyecto
        ├── QuickLinks.tsx                     — GitHub, LinkedIn, email, CV PDF
        ├── WindowManager.tsx                  — Orquesta todas las ventanas
        │   └── Window.tsx × N                 — Ventana genérica draggable
        │       ├── ProjectWindow.tsx           — Contenido de proyecto
        │       │   ├── ProjectReadme.tsx
        │       │   ├── ProjectGallery.tsx      — Solo si hasImages: true
        │       │   ├── ProjectStack.tsx
        │       │   └── ProjectLinks.tsx
        │       └── ProfileWindow.tsx           — Contenido del perfil de usuario
        └── Taskbar.tsx
            ├── UserAvatar.tsx                 — Foto + nombre, abre ProfileWindow
            ├── OSLabel.tsx                    — "AdrOS" centrado
            ├── Clock.tsx                      — Reloj en tiempo real
            └── LanguageToggle.tsx             — Botón EN / ES
```

---

## 4. Sistema de ventanas — diseño detallado

### `useWindowManager` hook

```typescript
// Estado global de todas las ventanas
const [windows, setWindows] = useState<WindowState[]>([]);

// Acciones disponibles
openWindow(projectId: string): void
closeWindow(id: string): void
minimizeWindow(id: string): void
maximizeWindow(id: string): void
restoreWindow(id: string): void
bringToFront(id: string): void   // actualiza zIndex
updatePosition(id: string, pos: Position): void
```

### `useDrag` hook

Maneja el drag de las ventanas. Se engancha a los eventos `mousedown`/`mousemove`/`mouseup` y `touchstart`/`touchmove`/`touchend` (para soporte táctil en tablets).

```typescript
const { dragRef, position, isDragging } = useDrag({
  initialPosition: { x, y },
  onDragEnd: (newPos) => updatePosition(windowId, newPos),
  bounds: 'viewport', // no permite arrastrar fuera de pantalla
});
```

### Anatomía visual de una ventana

```
┌─────────────────────────────────────────────────────┐
│ 🔴 🟡 🟢  │  📁 AndroBox — Developer Workbench  │ ─ │  ← Titlebar (drag handle)
├─────────────────────────────────────────────────────┤
│ [README] [Screenshots] [Stack] [Links]              │  ← Tabs de navegación interna
├─────────────────────────────────────────────────────┤
│                                                     │
│   Contenido de la tab activa                        │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- Los tres círculos (🔴🟡🟢) son botones de cerrar/minimizar/maximizar, estilo macOS pero con los colores del sistema (`--os-danger`, `--os-warn`, `--os-ok`).
- El **drag handle** es solo la titlebar. El contenido no es draggable.
- La ventana tiene `resize` en la esquina inferior derecha (solo desktop).
- En mobile (< 768px): fullscreen siempre, sin drag, con botón X en la esquina.

### Tamaño y posición inicial de ventanas

```typescript
const DEFAULT_WINDOW_SIZE = { width: 720, height: 500 };
const CENTER_OFFSET = {
  x: (window.innerWidth - 720) / 2,
  y: (window.innerHeight - 500) / 2,
};
// Offset aleatorio para que no se apilen exactamente
const RANDOM_OFFSET = () => Math.random() * 40 - 20; // -20 a +20px
```

---

## 5. Zonas del escritorio

### Configuración en `src/data/projects.ts`

```typescript
export const ZONES = [
  {
    id: 'android',
    label: { es: '📱 Android & Mobile', en: '📱 Android & Mobile' },
    position: 'top-left',
  },
  {
    id: 'fullstack',
    label: { es: '🌐 Full-Stack & Web', en: '🌐 Full-Stack & Web' },
    position: 'top-right',
  },
  {
    id: 'ai-tools',
    label: { es: '🛠️ IA & Herramientas', en: '🛠️ AI & Tools' },
    position: 'bottom-left',
  },
] as const;
```

### Layout del escritorio

El desktop usa CSS Grid con áreas nombradas:

```css
.desktop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-template-areas:
    "android    fullstack"
    "ai-tools   quicklinks";
  gap: 1rem;
  padding: 1rem;
  height: calc(100vh - 48px); /* 48px = altura de la taskbar */
}
```

### Comportamiento de las zonas

- Cada zona tiene un **label sutil** en la esquina superior izquierda con el nombre de la categoría.
- Las carpetas dentro de la zona se distribuyen en un flex-wrap con gap.
- Si una zona tiene más de 4 proyectos, muestra scroll interno en la zona (no en el escritorio).
- La zona `quicklinks` no tiene carpetas: solo iconos de acceso directo.

---

## 6. Carpetas de proyectos — diseño visual

### `FolderIcon` — estados

```
Normal:         Hover:          Abierta (ventana visible):
  📁              📂              📂
  label           label           label (subrayado)
  (muted)         (accent)        (accent, brillo)
```

- El icono es SVG custom, no emoji. Tiene el color del `color` field del MDX del proyecto.
- Al hacer hover, un tooltip muestra el stack principal (primeras 3 tecnologías).
- Si la ventana del proyecto está abierta, la carpeta tiene un indicador visual (punto de acento debajo).

### Vista lista (toggle)

Cuando el usuario activa la vista lista, el escritorio cambia a una tabla:

```
📂  AndroBox             Android & Mobile    Kotlin · SDK · Jetpack    2026  →
📂  Komea                Android & Mobile    Kotlin · Compose · AI     2025  →
📂  PetConnect           Full-Stack          Java · Spring · React     2025  →
...
```

La transición entre vista iconos y vista lista usa Framer Motion (`AnimatePresence`).

---

## 7. Contenido de cada ventana de proyecto

### Tab: README

Renderiza el contenido largo del MDX en el idioma activo. Usa un componente `<ProjectReadme>` con estilos tipográficos del OS (headings con `--os-accent`, código con fondo `--os-bg`, etc.).

### Tab: Screenshots (condicional)

Solo visible si `hasImages: true` en el frontmatter.

```
┌─────────────────────────────┐
│  ┌───────────────────────┐  │
│  │   cover.webp grande   │  │   ← Imagen principal
│  └───────────────────────┘  │
│  [01] [02] [03]             │   ← Thumbnails clickeables
└─────────────────────────────┘
```

Si `hasImages: false`, esta tab **no aparece** en la navegación de la ventana. No hay placeholder de "sin imágenes" dentro de la tab — simplemente la tab no existe.

### Tab: Stack

Grid de badges con las tecnologías del proyecto:

```
[ Kotlin ]  [ Android SDK ]  [ Jetpack Compose ]
[ MVVM   ]  [ Clean Arch  ]  [ Coroutines      ]
```

Cada badge tiene un color sutil y si es posible, el logo de la tecnología (SVG desde `devicons`).

### Tab: Links

Botones para abrir recursos externos:

```
[ 🐙 GitHub ]    [ 🌐 Demo en vivo ]    [ 💼 LinkedIn ]
```

Solo se muestran los botones con URL definida en el MDX. Botones con URL vacía no aparecen.

---

## 8. Ventana de perfil (Profile Window)

Se abre desde el avatar en la barra de tareas. Contenido:

```
┌─────────────────────────────────────────────────────┐
│ 🔴 🟡 🟢  │  Adrián García — adrigm                │
├──────────────┬──────────────────────────────────────┤
│              │  Adrián García M.                    │
│  [foto.jpg]  │  Mobile & Full-Stack Developer       │
│              │  📍 Cártama, Málaga, España          │
│              │  ──────────────────────────────      │
│              │  Apasionado por Android nativo,      │
│              │  Clean Architecture y el detalle     │
│              │  en la experiencia de usuario.       │
│              │                                      │
│              │  [ GitHub ]  [ LinkedIn ]  [ Email ] │
└──────────────┴──────────────────────────────────────┘
```

---

## 9. Barra de tareas (Taskbar)

```
┌────────────────────────────────────────────────────────────┐
│ [foto] Adrián │ [ventanas minimizadas...]│ AdrOS │ 12:34 │ EN│
└────────────────────────────────────────────────────────────┘
```

- **Izquierda:** Avatar + nombre. Click → abre ProfileWindow.
- **Centro-izquierda:** Iconos de ventanas minimizadas (aparecen dinámicamente).
- **Centro:** Label "AdrOS" como marca del sistema.
- **Derecha:** Reloj en tiempo real + toggle de idioma.
- **Altura fija:** 48px. Fondo `--os-surface` con `backdrop-filter: blur`.

---

## 10. Boot Screen — secuencia exacta

```
[t=0ms]    Fondo negro. Cursor parpadeante.
[t=200ms]  "AdrOS v1.0.0"
[t=600ms]  "Copyright © 2026 Adrián García M."
[t=1000ms] ""
[t=1100ms] "Initializing file system..."
[t=1400ms] "Loading projects... [████████░░] 82%"
[t=1600ms] "Loading projects... [██████████] 100%"
[t=1900ms] "All systems nominal."
[t=2100ms] ""
[t=2200ms] "Welcome, visitor. Enjoy the tour."
[t=2500ms] → Fade out del boot screen
[t=2700ms] → Fade in del escritorio
```

- Click o tecla Space/Enter en cualquier momento → salta directamente al escritorio.
- El progreso de la barra es falso pero convincente (no lineal, hace pequeñas pausas).
- Fuente: JetBrains Mono, color `--os-accent`, sobre fondo negro puro (#000).

---

## 11. Proyectos actuales y su configuración

| ID | Título | Zona | Imágenes | GitHub | Demo |
|---|---|---|---|---|---|
| `androbox` | AndroBox | android | ✅ (5 fotos) | ❌ | ❌ |
| `betterprompt` | BetterPrompt | ai-tools | ❌ | ✅ | ❌ |
| `android-skill-pkg` | Android Skill Package | ai-tools | ✅ (1 foto) | ❌ | ❌ |
| `komea` | Komea | android | ✅ (1 mockup) | ❌ | ❌ |
| `petconnect` | PetConnect | fullstack | ✅ (video→gif) | ❌ | ❌ |
| `lovepage` | LovePage | fullstack | ✅ (1 foto) | ✅ | ❌ |
| `vantagesystems` | VantageSystems | fullstack | ❌ | ❌ | ✅ |

> **Nota sobre PetConnect:** tiene un `.mp4`. Conviértelo a WebP animado o usa un `<video autoplay muted loop>` dentro de la galería. No incrustes MP4 como imagen.

---

## 12. Easter Eggs (opcionales, para exploración)

- Escribir `ls` en cualquier parte del escritorio (cuando no hay ventana activa) muestra en consola un listado de proyectos en formato terminal.
- El reloj a medianoche hace un pequeño glitch visual de 1 segundo.
- Hacer click en "AdrOS" de la taskbar 5 veces muestra una notificación: *"Nice try. There's nothing here... yet."*
- El modo `konami code` (↑↑↓↓←→←→BA) activa un theme alternativo de alto contraste.

---

## 13. Responsive — comportamiento por breakpoint

| Breakpoint | Comportamiento |
|---|---|
| `< 480px` | Escritorio muestra lista directamente (sin toggle), ventanas siempre fullscreen |
| `480px – 768px` | Escritorio en grid 1 columna, ventanas fullscreen |
| `768px – 1024px` | Escritorio en grid 2 columnas, ventanas draggables pero sin resize |
| `> 1024px` | Experiencia completa: grid, drag, resize, múltiples ventanas |

---

## 14. Accesibilidad

- Todas las carpetas son focusables con teclado (`tabIndex={0}`).
- Enter/Space sobre una carpeta la abre (mismo efecto que click).
- Las ventanas tienen `role="dialog"` y `aria-label` con el nombre del proyecto.
- Botones de cerrar/minimizar/maximizar tienen `aria-label` explícito.
- El toggle de idioma anuncia el cambio con `aria-live="polite"`.
- Contraste mínimo 4.5:1 en todo el texto principal.

---

## 15. Orden de construcción recomendado

### Fase 1 — Base y datos (sin UI)
1. Setup Astro + React + TypeScript + Tailwind
2. Configurar `global.css` con todas las variables `--os-*`
3. Crear los 7 archivos MDX de proyectos con el schema completo
4. Crear `src/data/projects.ts` con zonas y metadata

### Fase 2 — Shell del OS
5. `BaseLayout.astro` con fuentes y meta tags
6. `BootScreen.tsx` con la secuencia animada
7. `Desktop.tsx` con el grid de zonas (sin contenido real aún)
8. `Taskbar.tsx` con reloj funcional y estructura visual

### Fase 3 — Sistema de ventanas
9. `useWindowManager.ts` con toda la lógica de estado
10. `useDrag.ts` con drag y bounds
11. `Window.tsx` genérica con titlebar y botones
12. Integrar `WindowManager` en `Desktop`

### Fase 4 — Carpetas y contenido de proyectos
13. `FolderIcon.tsx` con estados hover/open
14. `DesktopZone.tsx` con layout de carpetas
15. `ProjectWindow.tsx` con tabs
16. `ProjectReadme.tsx`, `ProjectGallery.tsx`, `ProjectStack.tsx`, `ProjectLinks.tsx`

### Fase 5 — Perfil, quicklinks e i18n
17. `ProfileWindow.tsx` con foto y links
18. `QuickLinks.tsx` con iconos de acceso directo
19. `useLanguage.ts` y archivos de traducción
20. `LanguageToggle.tsx` en la barra de tareas
21. Conectar i18n a todos los componentes

### Fase 6 — Polish y optimización
22. `ViewToggle.tsx` para vista iconos/lista
23. Animaciones de entrada del escritorio (stagger)
24. `prefers-reduced-motion` en todas las animaciones
25. Compresión y conversión de imágenes a WebP
26. Lighthouse audit y optimización hasta > 95 en todos los scores
27. Easter eggs
28. Deploy y dominio
