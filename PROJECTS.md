# PROJECTS.md — Contenido de todos los proyectos

> Copia cada bloque en su archivo `.mdx` correspondiente dentro de `src/content/projects/`.
> Las imágenes las colocas tú en `public/projects/{id}/screenshots/` siguiendo la nomenclatura indicada.

---

## Índice

| Archivo | Proyecto | Zona | ¿Tiene imágenes? |
|---|---|---|---|
| `androbox.mdx` | AndroBox — Developer Workbench | android | ✅ Sí (coloca 5 fotos) |
| `betterprompt.mdx` | BetterPrompt | ai-tools | ❌ No |
| `android-skill-pkg.mdx` | Android Engineering Skill Package | ai-tools | ✅ Sí (coloca 1 foto) |
| `komea.mdx` | Komea — App Android Nativa | android | ✅ Sí (coloca 1 mockup) |
| `petconnect.mdx` | PetConnect — Plataforma Veterinaria | fullstack | ✅ Sí (coloca vídeo/gif) |
| `lovepage.mdx` | LovePage | fullstack | ✅ Sí (coloca 1 foto) |
| `vantagesystems.mdx` | VantageSystems | fullstack | ❌ No (tiene demo live) |

---
---

## 📄 `androbox.mdx`

```mdx
---
id: "androbox"
title: "AndroBox"
subtitle: "Developer Workbench"
zone: "android"
status: "active"
date: "2026-05"
color: "#00d4aa"
hasImages: true
githubUrl: ""
demoUrl: ""
linkedinUrl: ""
stack:
  - "Kotlin"
  - "Android SDK"
  - "Android Jetpack"
  - "Jetpack Compose"
  - "Clean Architecture"
  - "Mobile Development"
description:
  es: "Herramienta avanzada de diagnóstico, telemetría y diseño en pantalla para Android. Reglas de pantalla, lector de contraste WCAG, monitor de FPS/CPU/RAM y Wireless Debug en un único entorno."
  en: "Advanced on-screen diagnostics, telemetry and design tool for Android. Screen rulers, WCAG contrast reader, FPS/CPU/RAM monitor and Wireless Debug in one unified environment."
---

<Content lang="es">
## ¿Qué es AndroBox?

AndroBox es una herramienta avanzada de diagnóstico, telemetría y diseño en pantalla desarrollada exclusivamente para Android. Combina utilidades de análisis visual directo con indicadores de rendimiento del hardware en tiempo real, todo en un único entorno unificado.

## Funcionalidades principales

- **Reglas de pantalla** — Superposición de guías y reglas para verificar alineación y espaciado directamente sobre cualquier app.
- **Lector de contraste WCAG** — Comprobación de accesibilidad de colores en tiempo real contra los estándares WCAG 2.1.
- **Monitor de rendimiento** — Indicadores de FPS, uso de CPU y RAM actualizados en tiempo real sobre una capa flotante.
- **Wireless Debug** — Acceso directo y simplificado a la depuración inalámbrica de Android sin necesidad de comandos manuales.

## Enfoque técnico

El proyecto está construido íntegramente en Kotlin siguiendo los principios de Clean Architecture, con una separación clara entre capas de dominio, datos y presentación. La UI utiliza Jetpack Compose para una experiencia moderna y reactiva, y el sistema de overlays aprovecha los `WindowManager` de Android para renderizar sobre cualquier aplicación sin interferir con ella.
</Content>

<Content lang="en">
## What is AndroBox?

AndroBox is an advanced on-screen diagnostics, telemetry and design tool built exclusively for Android. It combines direct visual analysis utilities with real-time hardware performance indicators, all within a single unified environment.

## Main features

- **Screen rulers** — Overlay guides and rulers to verify alignment and spacing directly on top of any app.
- **WCAG contrast reader** — Real-time color accessibility check against WCAG 2.1 standards.
- **Performance monitor** — FPS, CPU and RAM indicators updated in real time via a floating overlay layer.
- **Wireless Debug** — Simplified direct access to Android wireless debugging without manual commands.

## Technical approach

Built entirely in Kotlin following Clean Architecture principles, with a clear separation between domain, data and presentation layers. The UI uses Jetpack Compose for a modern, reactive experience, and the overlay system leverages Android's `WindowManager` to render on top of any application without interfering with it.
</Content>
```

### 🖼️ Imágenes para AndroBox
Coloca en `public/projects/androbox/screenshots/`:
```
cover.webp   ← La que mejor represente la app (elige una de las 5)
01.webp      ← AndroBoxWirelessDebug
02.webp      ← AndroBoxToolsMap
03.webp      ← AndroBoxStats
04.webp      ← (4ª foto que tengas)
05.webp      ← (5ª foto que tengas)
```

---
---

## 📄 `betterprompt.mdx`

```mdx
---
id: "betterprompt"
title: "BetterPrompt"
subtitle: "Context-Aware Prompt Enrichment"
zone: "ai-tools"
status: "active"
date: "2026-05"
color: "#a78bfa"
hasImages: false
githubUrl: "https://github.com/adrigm06/BetterPrompt"
demoUrl: ""
linkedinUrl: ""
stack:
  - "TypeScript"
  - "Node.js"
  - "LLM Integration"
  - "TUI"
  - "Heuristic Analysis"
description:
  es: "Extensión open source para Pi Agent que enriquece automáticamente el contexto de los prompts analizando la estructura real del proyecto antes de enviar cada solicitud al LLM."
  en: "Open source extension for Pi Agent that automatically enriches prompt context by analyzing the real project structure before sending each request to the LLM."
---

<Content lang="es">
## ¿Qué es BetterPrompt?

BetterPrompt es una extensión open source para Pi Agent diseñada para mejorar la calidad de las interacciones con modelos de lenguaje mediante el enriquecimiento automático del contexto de los prompts.

## El problema que resuelve

Cuando trabajas con un agente de IA en un proyecto de código, normalmente tienes que explicar manualmente el contexto en cada sesión: qué stack usas, cómo está estructurado el proyecto, qué convenciones sigues. BetterPrompt elimina ese trabajo repetitivo.

## Cómo funciona

La herramienta intercepta las solicitudes del usuario antes de enviarlas al LLM y analiza localmente el contexto real del proyecto:

- Estructura de directorios del repositorio
- Archivos de configuración (`package.json`, `build.gradle`, etc.)
- Documentación existente
- Stack tecnológico detectado automáticamente

A partir de esta información, genera un prompt optimizado que permite obtener respuestas más precisas desde la primera interacción.

## Características destacadas

- **Clasificación heurística de complejidad** — Categoriza cada tarea como SIMPLE, MEDIUM, COMPLEX o UNKNOWN de forma local, sin llamadas adicionales al LLM.
- **Modo ligero `/better-lite`** — Versión reducida orientada al ahorro de tokens para tareas simples.
- **Interfaz TUI** — Permite revisar, editar o descartar el prompt generado antes de enviarlo.
- **Palabras clave configurables** — Soporte en español e inglés para adaptar la detección al idioma del proyecto.
- **Reducción de costes** — Minimiza las llamadas innecesarias al LLM optimizando tiempos de respuesta.
</Content>

<Content lang="en">
## What is BetterPrompt?

BetterPrompt is an open source extension for Pi Agent designed to improve the quality of interactions with language models through automatic prompt context enrichment.

## The problem it solves

When working with an AI agent on a code project, you typically have to manually explain the context in each session: which stack you use, how the project is structured, which conventions you follow. BetterPrompt eliminates that repetitive work.

## How it works

The tool intercepts user requests before sending them to the LLM and locally analyzes the real project context:

- Repository directory structure
- Configuration files (`package.json`, `build.gradle`, etc.)
- Existing documentation
- Automatically detected tech stack

From this information, it generates an optimized prompt that delivers more accurate responses from the very first interaction.

## Key features

- **Heuristic complexity classification** — Categorizes each task as SIMPLE, MEDIUM, COMPLEX or UNKNOWN locally, without additional LLM calls.
- **Lightweight mode `/better-lite`** — Reduced version aimed at token savings for simple tasks.
- **TUI interface** — Allows reviewing, editing or discarding the generated prompt before sending it.
- **Configurable keywords** — Spanish and English support to adapt detection to the project's language.
- **Cost reduction** — Minimizes unnecessary LLM calls by optimizing response times.
</Content>
```

### 🖼️ Imágenes para BetterPrompt
`hasImages: false` — No se necesita ninguna carpeta de imágenes. La tab de Screenshots no aparecerá en la ventana del proyecto.

---
---

## 📄 `android-skill-pkg.mdx`

```mdx
---
id: "android-skill-pkg"
title: "Android Engineering Skill Package"
subtitle: "AI Decision Engine for Android Workflows"
zone: "ai-tools"
status: "active"
date: "2026-03"
color: "#f59e0b"
hasImages: true
githubUrl: ""
demoUrl: ""
linkedinUrl: ""
stack:
  - "Kotlin"
  - "Android"
  - "Artificial Intelligence"
  - "Clean Architecture"
  - "NPM"
  - "Open Source"
description:
  es: "Motor de decisiones modular open source para flujos de trabajo con agentes de IA orientados a ingeniería Android. Arquitectura multicapa con especialización por dominios técnicos."
  en: "Modular open source decision engine for AI agent workflows focused on Android engineering. Multi-layer architecture with specialization by technical domains."
---

<Content lang="es">
## ¿Qué es el Android Engineering Skill Package?

Paquete modular de código abierto desarrollado como motor de decisiones para flujos de trabajo con agentes de IA orientados a la ingeniería Android. Nace de la experiencia práctica trabajando con Kotlin y del conocimiento sobre coordinación y toma de decisiones en sistemas basados en IA.

## Arquitectura multicapa

El paquete se divide en cuatro niveles claramente diferenciados:

1. **Enrutamiento maestro** — Punto de entrada que dirige cada solicitud al dominio correcto.
2. **Protocolo de resolución de conflictos** — Lógica determinista para cuando dos dominios tienen criterios contradictorios.
3. **Lógica de dominio** — Reglas específicas de cada área técnica.
4. **Artefactos reutilizables** — Plantillas y contratos de respuesta estándar.

## Dominios especializados

El paquete incluye módulos específicos para:
- Kotlin Concurrency y Coroutines
- Jetpack Compose y UI
- Arquitectura de software (MVVM, Clean, MVI)
- Testing y calidad
- CI/CD y configuración de Gradle
- Rendimiento y optimización
- Seguridad (prioridad máxima en el sistema de autoridad)
- Release engineering

## Sistema de autoridad jerárquica

Las áreas críticas como seguridad tienen prioridad absoluta sobre decisiones arquitectónicas u operativas. Este modelo determinista evita ambigüedades y garantiza coherencia en los resultados generados por el agente.

## Distribución

Empaquetado y distribuido mediante NPM para ejecución local, bajo licencia MIT.
</Content>

<Content lang="en">
## What is the Android Engineering Skill Package?

A modular open source package developed as a decision engine for AI agent workflows focused on Android engineering. It stems from practical experience working with Kotlin and from knowledge about coordination and decision-making in AI-based systems.

## Multi-layer architecture

The package is divided into four clearly differentiated levels:

1. **Master routing** — Entry point that directs each request to the correct domain.
2. **Conflict resolution protocol** — Deterministic logic for when two domains have contradictory criteria.
3. **Domain logic** — Rules specific to each technical area.
4. **Reusable artifacts** — Standard response templates and contracts.

## Specialized domains

The package includes specific modules for:
- Kotlin Concurrency and Coroutines
- Jetpack Compose and UI
- Software architecture (MVVM, Clean, MVI)
- Testing and quality
- CI/CD and Gradle configuration
- Performance and optimization
- Security (highest priority in the authority system)
- Release engineering

## Hierarchical authority system

Critical areas like security have absolute priority over architectural or operational decisions. This deterministic model avoids ambiguity and ensures consistency in agent-generated outputs.

## Distribution

Packaged and distributed via NPM for local execution, under MIT license.
</Content>
```

### 🖼️ Imágenes para Android Skill Package
Coloca en `public/projects/android-skill-pkg/screenshots/`:
```
cover.webp   ← AndroidSkill.png convertida a WebP
01.webp      ← La misma u otra variante
```

---
---

## 📄 `komea.mdx`

```mdx
---
id: "komea"
title: "Komea"
subtitle: "AI-Powered Food Management"
zone: "android"
status: "active"
date: "2025-12"
color: "#34d399"
hasImages: true
githubUrl: ""
demoUrl: ""
linkedinUrl: ""
stack:
  - "Kotlin"
  - "Jetpack Compose"
  - "Android Jetpack"
  - "Generative AI"
  - "MVVM"
  - "Clean Architecture"
  - "Material Design 3"
description:
  es: "App Android nativa para optimizar la gestión alimentaria con IA generativa. Planificación de menús, control de inventario, lista de la compra automática y recetas personalizadas según los ingredientes disponibles."
  en: "Native Android app to optimize food management with generative AI. Menu planning, inventory control, automatic shopping lists and personalized recipes based on available ingredients."
---

<Content lang="es">
## ¿Qué es Komea?

Komea es una aplicación Android nativa diseñada para eliminar la fricción en la gestión alimentaria del día a día. Unifica la planificación de menús y el control de inventario doméstico en una única experiencia automatizada, impulsada por IA generativa.

## El problema que resuelve

La planificación de comidas y el control de lo que hay en casa son dos procesos que normalmente viven en apps distintas, notas de papel o directamente en la memoria. Komea los une y automatiza.

## Funcionalidades clave

- **Planificación inteligente de menús** — La IA sugiere menús semanales adaptados a los ingredientes disponibles, restricciones dietéticas y preferencias personales.
- **Lista de la compra automática** — Se genera automáticamente a partir del plan de menús, sin introducción manual.
- **Control de inventario** — Registro del stock disponible en casa con alertas de caducidad.
- **Comunidad de recetas** — Los usuarios pueden compartir sus recetas para que la comunidad las use, adapte o mejore.

## Arquitectura técnica

- Clean Architecture con patrón MVVM y flujo de datos unidireccional (UDF)
- Desarrollo 100% nativo en Kotlin con Jetpack Compose
- Procesamiento de datos mediante IA generativa
- Diseño escalable y mantenible orientado a producto de largo recorrido

## Estado actual

En fase de desarrollo avanzado, con lanzamiento público previsto en los próximos meses.
</Content>

<Content lang="en">
## What is Komea?

Komea is a native Android application designed to eliminate friction in everyday food management. It unifies menu planning and home inventory control into a single automated experience, powered by generative AI.

## The problem it solves

Meal planning and home stock control are two processes that usually live in separate apps, paper notes or just memory. Komea brings them together and automates them.

## Key features

- **Smart menu planning** — AI suggests weekly menus adapted to available ingredients, dietary restrictions and personal preferences.
- **Automatic shopping list** — Generated automatically from the menu plan, no manual input needed.
- **Inventory control** — Home stock registry with expiration date alerts.
- **Recipe community** — Users can share their recipes for the community to use, adapt or improve.

## Technical architecture

- Clean Architecture with MVVM pattern and Unidirectional Data Flow (UDF)
- 100% native Kotlin development with Jetpack Compose
- Data processing powered by generative AI
- Scalable and maintainable product-oriented architecture

## Current status

In advanced development stage, with public launch planned for the coming months.
</Content>
```

### 🖼️ Imágenes para Komea
Coloca en `public/projects/komea/screenshots/`:
```
cover.webp   ← KomeaMockUp.png convertida a WebP
01.webp      ← La misma u otras pantallas si las tienes
```

---
---

## 📄 `petconnect.mdx`

```mdx
---
id: "petconnect"
title: "PetConnect"
subtitle: "Full-Stack Veterinary Platform"
zone: "fullstack"
status: "completed"
date: "2025-11"
color: "#60a5fa"
hasImages: true
githubUrl: ""
demoUrl: ""
linkedinUrl: ""
stack:
  - "Java 21"
  - "Spring Boot 3.4"
  - "Spring Security"
  - "JWT"
  - "PostgreSQL"
  - "Supabase"
  - "React.js"
  - "TypeScript"
  - "Leaflet"
  - "JPA"
description:
  es: "Plataforma integral para la digitalización del sector veterinario. Backend con Java 21 y Spring Boot, mapas interactivos con geolocalización en tiempo real y red social para propietarios de mascotas."
  en: "Comprehensive platform for digitizing the veterinary sector. Backend with Java 21 and Spring Boot, interactive maps with real-time geolocation and social network for pet owners."
---

<Content lang="es">
## ¿Qué es PetConnect?

Plataforma integral para la digitalización del sector veterinario, desarrollada como Proyecto de Fin de Grado. Unifica la gestión clínica, la geolocalización de urgencias y la comunidad de propietarios de mascotas en un único ecosistema.

## Backend

Arquitectura robusta construida con Java 21 y Spring Boot 3.4. La seguridad se gestiona mediante JWT con Spring Security, y la persistencia de datos utiliza PostgreSQL alojado en Supabase con JPA como capa de acceso a datos.

## Geolocalización

Sistema de mapas interactivos desarrollado con Leaflet y la API Overpass para obtener datos de clínicas veterinarias en tiempo real. Incluye estrategias de caché personalizadas y reintentos con backoff exponencial para garantizar la disponibilidad de datos de urgencias incluso bajo carga o fallos de la API externa.

## Ecosistema social

Red social integrada para propietarios de mascotas con:
- Perfiles médicos compartibles para cada mascota
- Soporte para subida y gestión de multimedia en la nube (Supabase Storage)
- Sistema de seguimiento entre usuarios

## Stack completo

- **Backend:** Java 21 · Spring Boot 3.4 · Spring Security · JWT · JPA · PostgreSQL
- **Frontend:** React.js · TypeScript
- **Geolocalización:** Leaflet · Overpass API
- **Infraestructura:** Supabase (DB + Storage)
</Content>

<Content lang="en">
## What is PetConnect?

A comprehensive platform for digitizing the veterinary sector, developed as a Final Degree Project. It unifies clinical management, emergency geolocation and a pet owner community into a single ecosystem.

## Backend

Robust architecture built with Java 21 and Spring Boot 3.4. Security is handled via JWT with Spring Security, and data persistence uses PostgreSQL hosted on Supabase with JPA as the data access layer.

## Geolocation

Interactive map system built with Leaflet and the Overpass API to fetch real-time veterinary clinic data. Includes custom caching strategies and exponential backoff retries to ensure emergency data availability even under load or external API failures.

## Social ecosystem

Integrated social network for pet owners featuring:
- Shareable medical profiles for each pet
- Cloud media upload and management support (Supabase Storage)
- User follow system

## Full stack

- **Backend:** Java 21 · Spring Boot 3.4 · Spring Security · JWT · JPA · PostgreSQL
- **Frontend:** React.js · TypeScript
- **Geolocation:** Leaflet · Overpass API
- **Infrastructure:** Supabase (DB + Storage)
</Content>
```

### 🖼️ Imágenes para PetConnect
Coloca en `public/projects/petconnect/screenshots/`:
```
cover.webp   ← Captura del vídeo PetConnect.mp4 convertida a WebP
01.webp      ← Otras capturas del vídeo o pantallas de la app

NOTA sobre el vídeo:
Tienes dos opciones:
  A) Extraer capturas del .mp4 y convertirlas a WebP (más sencillo, recomendado)
  B) Convertir el .mp4 a un GIF o WebP animado y usarlo como 01.webp
     → Comando ffmpeg: ffmpeg -i PetConnect.mp4 -vf "fps=10,scale=800:-1" -loop 0 01.gif
     → Luego convertir a WebP animado si quieres máximo rendimiento
```

---
---

## 📄 `lovepage.mdx`

```mdx
---
id: "lovepage"
title: "LovePage"
subtitle: "Full-Stack Personalized Web App"
zone: "fullstack"
status: "completed"
date: "2024-01"
color: "#f472b6"
hasImages: true
githubUrl: "https://github.com/adrigm06/LovePage"
demoUrl: ""
linkedinUrl: ""
stack:
  - "HTML5"
  - "CSS3"
  - "JavaScript"
  - "Node.js"
  - "Express.js"
  - "PostgreSQL"
  - "REST API"
  - "GitHub Pages"
  - "Render"
description:
  es: "Aplicación web full-stack para crear espacios digitales personalizados. Sistema de autenticación completo, mensajes personalizados, fechas importantes y playlists de Spotify. Frontend en GitHub Pages, backend en Render."
  en: "Full-stack web application to create personalized digital spaces. Complete authentication system, custom messages, important dates and Spotify playlists. Frontend on GitHub Pages, backend on Render."
---

<Content lang="es">
## ¿Qué es LovePage?

LovePage es una aplicación web full-stack diseñada para que cualquier persona pueda crear un espacio digital personalizado y afectivo. Cada usuario tiene su propio espacio único donde guardar lo que más importa.

## Funcionalidades

- **Autenticación completa** — Sistema de registro e inicio de sesión con gestión de sesiones.
- **Mensajes personalizados** — Cada usuario puede escribir y guardar mensajes en su espacio.
- **Fechas importantes** — Registro de fechas especiales con recordatorios.
- **Playlists de Spotify** — Integración para mostrar y guardar playlists de Spotify en el espacio personal.

## Arquitectura

- **Frontend:** HTML5, CSS3 y JavaScript modular. Alojado en GitHub Pages.
- **Backend:** Node.js con Express.js. Desplegado en Render.
- **Base de datos:** PostgreSQL en la nube (Render).
- **API:** RESTful con políticas de CORS configuradas para comunicación segura entre frontend y backend.

## Lo que aprendí

Este proyecto fue mi primer full-stack real desplegado en producción. Aprendí a gestionar CORS entre dominios diferentes, a estructurar una API REST de forma escalable y a coordinar el ciclo de vida completo de un despliegue cloud con servicios gratuitos.
</Content>

<Content lang="en">
## What is LovePage?

LovePage is a full-stack web application designed for anyone to create a personalized and meaningful digital space. Each user has their own unique space to store what matters most.

## Features

- **Complete authentication** — Registration and login system with session management.
- **Custom messages** — Each user can write and save messages in their space.
- **Important dates** — Special date registry with reminders.
- **Spotify playlists** — Integration to display and save Spotify playlists in the personal space.

## Architecture

- **Frontend:** HTML5, CSS3 and modular JavaScript. Hosted on GitHub Pages.
- **Backend:** Node.js with Express.js. Deployed on Render.
- **Database:** Cloud PostgreSQL (Render).
- **API:** RESTful with CORS policies configured for secure frontend-backend communication.

## What I learned

This was my first real full-stack project deployed to production. I learned to manage CORS between different domains, to structure a REST API in a scalable way and to coordinate the complete lifecycle of a cloud deployment using free-tier services.
</Content>
```

### 🖼️ Imágenes para LovePage
Coloca en `public/projects/lovepage/screenshots/`:
```
cover.webp   ← "Vista principal de la web" convertida a WebP
01.webp      ← La misma u otras pantallas si las tienes
```

---
---

## 📄 `vantagesystems.mdx`

```mdx
---
id: "vantagesystems"
title: "VantageSystems"
subtitle: "Digital Infrastructure & Automation Agency"
zone: "fullstack"
status: "active"
date: "2024-06"
color: "#818cf8"
hasImages: false
githubUrl: ""
demoUrl: "https://vantagesystems.eu"
linkedinUrl: ""
stack:
  - "Astro 4"
  - "React 19"
  - "TypeScript"
  - "TailwindCSS"
  - "GSAP"
  - "Lenis"
  - "Zod"
  - "React Hook Form"
  - "SEO Técnico"
  - "i18n"
description:
  es: "Plataforma de servicios tecnológicos para pymes: webs de alto rendimiento, apps, automatizaciones y chatbots con IA. 100/100 en Speed Insights. Construida con Astro 4, React 19 y Zero JS en el payload crítico."
  en: "Tech services platform for SMBs: high-performance websites, apps, automations and AI chatbots. 100/100 Speed Insights. Built with Astro 4, React 19 and Zero JS on the critical payload."
---

<Content lang="es">
## ¿Qué es VantageSystems?

VantageSystems nació con un doble propósito: ser la tarjeta de presentación de los servicios tecnológicos ofrecidos y, al mismo tiempo, funcionar como un banco de pruebas real que demuestra capacidad en rendimiento web, SEO técnico y experiencia de usuario.

## Servicios

Desarrollo de infraestructura digital y automatizaciones para pymes y empresas:
- Webs de alto rendimiento
- Aplicaciones móviles y web
- Sistemas de inventario
- Chatbots con IA integrada

## Stack tecnológico

- **Arquitectura:** Astro 4 con Islas de React 19 y TypeScript
- **UI/UX:** TailwindCSS 3, animaciones con GSAP 3 y smooth scrolling con Lenis
- **Backend & Datos:** React Hook Form y Zod para validación

## Optimización de rendimiento

El resultado es un **100/100 en Speed Insights** de Vercel, conseguido mediante:

- **Zero JS en el payload crítico** — Carga de JavaScript completamente diferida
- **Estilos en línea** — Para eliminar bloqueos de renderizado en el first paint
- **Fuentes variables auto-hospedadas** — Sin dependencias de Google Fonts
- **SEO dinámico internacional (i18n)** — Con datos estructurados Schema.org
- **Imágenes optimizadas** — Formato moderno con lazy loading selectivo

## Por qué es relevante en este portfolio

VantageSystems no es solo un proyecto — es la prueba viva de que sé construir para producción real. El mismo cuidado técnico que apliqué aquí es el que aplico en cada proyecto.
</Content>

<Content lang="en">
## What is VantageSystems?

VantageSystems was born with a dual purpose: to serve as the showcase for tech services offered and, at the same time, to function as a real testbed demonstrating capability in web performance, technical SEO and user experience.

## Services

Digital infrastructure and automation development for SMBs and companies:
- High-performance websites
- Mobile and web applications
- Inventory systems
- AI-integrated chatbots

## Tech stack

- **Architecture:** Astro 4 with React 19 Islands and TypeScript
- **UI/UX:** TailwindCSS 3, GSAP 3 animations and Lenis smooth scrolling
- **Backend & Data:** React Hook Form and Zod for validation

## Performance optimization

The result is a **100/100 Speed Insights score** on Vercel, achieved through:

- **Zero JS on critical payload** — Fully deferred JavaScript loading
- **Inline styles** — To eliminate render-blocking on first paint
- **Self-hosted variable fonts** — No Google Fonts dependencies
- **Dynamic international SEO (i18n)** — With Schema.org structured data
- **Optimized images** — Modern format with selective lazy loading

## Why it matters in this portfolio

VantageSystems is not just a project — it's living proof of knowing how to build for real production. The same technical care applied here is the same applied to every project.
</Content>
```

### 🖼️ Imágenes para VantageSystems
`hasImages: false` — No se necesita carpeta de imágenes. En su lugar, el botón de Demo apunta a `vantagesystems.eu` directamente desde la tab de Links.

---

## 📁 Resumen de estructura de imágenes a crear

```
public/
└── projects/
    ├── androbox/
    │   └── screenshots/
    │       ├── cover.webp
    │       ├── 01.webp   (WirelessDebug)
    │       ├── 02.webp   (ToolsMap)
    │       ├── 03.webp   (Stats)
    │       ├── 04.webp
    │       └── 05.webp
    ├── android-skill-pkg/
    │   └── screenshots/
    │       ├── cover.webp
    │       └── 01.webp
    ├── komea/
    │   └── screenshots/
    │       ├── cover.webp
    │       └── 01.webp
    ├── petconnect/
    │   └── screenshots/
    │       ├── cover.webp
    │       └── 01.webp   (o gif animado del vídeo)
    └── lovepage/
        └── screenshots/
            ├── cover.webp
            └── 01.webp

# betterprompt/ y vantagesystems/ NO necesitan carpeta de screenshots.
```

## 🛠️ Cómo convertir imágenes a WebP

Si tienes las imágenes en JPG o PNG, conviértelas con cualquiera de estos métodos:

**Online (sin instalar nada):**
→ https://squoosh.app — Arrastra la imagen, selecciona WebP, ajusta calidad a ~80% y descarga.

**Con ffmpeg (para el vídeo de PetConnect):**
```bash
# Extraer frame concreto del vídeo como imagen
ffmpeg -i PetConnect.mp4 -ss 00:00:03 -frames:v 1 cover.webp

# Crear GIF animado (opcional)
ffmpeg -i PetConnect.mp4 -vf "fps=10,scale=800:-1" -loop 0 petconnect.gif
```
