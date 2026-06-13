import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowManager } from '@/hooks/useWindowManager';
import { LanguageContext, useLanguageState, useTranslation } from '@/hooks/useLanguage';
import { useReducedMotion } from 'framer-motion';
import { useKonamiCode, useLsCommand } from '@/hooks/useEasterEggs';
import Taskbar from './Taskbar';
import BootScreen from './BootScreen';
import WindowManager from './WindowManager';
import FolderIcon from './FolderIcon';
import ZoneLegend from './ZoneLegend';
import QuickLinks from '@/components/widgets/QuickLinks';
import { ZONE_COLORS } from '@/data/projects';
import type { CollectionEntry } from 'astro:content';

type ViewMode = 'icons' | 'list';

export type ProjectEntry = CollectionEntry<'projects'>;

interface DesktopProps {
  projects: ProjectEntry[];
}

/* ── Grid constants (matching FolderIcon snap) ── */
const GRID_X = 110;
const GRID_Y = 118;
const GRID_OFFSET_X = 36;
const GRID_OFFSET_Y = 32;

/* ── Distribución inicial ── */
const COL_START_X = GRID_OFFSET_X;
const ROW_START_Y = GRID_OFFSET_Y;

function calcInitialPositions(projects: ProjectEntry[]): Record<string, { x: number; y: number }> {
  const zoneOrder = ['android', 'fullstack', 'ai-tools'];
  const zones = zoneOrder.filter((z) => projects.some((p) => p.data.zone === z));
  const positions: Record<string, { x: number; y: number }> = {};

  zones.forEach((zone, col) => {
    const zoneProjects = projects.filter((p) => p.data.zone === zone);
    const baseX = COL_START_X + col * GRID_X;
    zoneProjects.forEach((p, row) => {
      const baseY = ROW_START_Y + row * GRID_Y;
      positions[p.data.id] = { x: baseX, y: baseY };
    });
  });

  return positions;
}

export default function Desktop({ projects }: DesktopProps) {
  const [booted, setBooted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('icons');
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const desktopRef = useRef<HTMLDivElement>(null);

  const {
    windows, minimizedWindows,
    openWindow, closeWindow, minimizeWindow, maximizeWindow,
    restoreWindow, bringToFront, updatePosition,
  } = useWindowManager();

  const langState = useLanguageState();
  const { t } = useTranslation(langState.lang);
  const reduce = useReducedMotion();

  useKonamiCode();
  useLsCommand();

  useEffect(() => {
    setIconPositions(calcInitialPositions(projects));
  }, [projects]);

  const handleOpenProject = useCallback((project: ProjectEntry) => {
    openWindow(project.data.id, 'project', project.data.title, project.data.id);
  }, [openWindow]);

  const handleIconDrag = useCallback((id: string, pos: { x: number; y: number }) => {
    setIconPositions((prev) => ({ ...prev, [id]: pos }));
  }, []);

  /* ── Drag state para mostrar grid y leyenda ── */
  const handleDragState = useCallback((id: string, dragging: boolean) => {
    setDraggingId(dragging ? id : null);
  }, []);

  // Orden estable por zona
  const sortedProjects = [...projects].sort((a, b) => {
    const order = ['android', 'fullstack', 'ai-tools'];
    return order.indexOf(a.data.zone) - order.indexOf(b.data.zone);
  });

  const openProjectIds = windows
    .filter((w) => w.type === 'project' && w.isOpen && !w.isMinimized)
    .map((w) => w.projectId || '');

  /* ── macOS Sonoma wallpaper — vibrant layered gradients ── */
  const wallpaperStyle: React.CSSProperties = {
    background: `
      /* Deep chromatic base */
      radial-gradient(ellipse at 20% 15%, rgba(180, 130, 255, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(96, 165, 250, 0.12) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 90%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 10% 60%, rgba(0, 212, 170, 0.07) 0%, transparent 40%),
      radial-gradient(ellipse at 90% 70%, rgba(167, 139, 250, 0.06) 0%, transparent 40%),
      /* Subtle center glow */
      radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.02) 0%, transparent 60%),
      /* Ambient edge light */
      radial-gradient(ellipse at 0% 50%, rgba(96, 165, 250, 0.04) 0%, transparent 30%),
      radial-gradient(ellipse at 100% 50%, rgba(167, 139, 250, 0.04) 0%, transparent 30%),
      #080a10
    `,
    position: 'relative',
  };

  /* ── Grid overlay lines ── */
  const gridStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    bottom: 'var(--taskbar-h)',
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)
    `,
    backgroundSize: `${GRID_X}px ${GRID_Y}px`,
    backgroundPosition: `${GRID_OFFSET_X}px ${GRID_OFFSET_Y}px`,
    pointerEvents: 'none',
    zIndex: 50,
    opacity: draggingId ? 1 : 0,
    transition: 'opacity 0.15s ease',
  };

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />;
  }

  return (
    <LanguageContext.Provider value={langState}>
      <div
        ref={desktopRef}
        className="relative w-full h-screen overflow-hidden select-none"
        style={wallpaperStyle}
      >
        {/* ── Grid overlay (visible solo al arrastrar) ── */}
        <div style={gridStyle} />

        {/* ── Desktop canvas (full height — dock floats) ── */}
        <motion.div
          className="absolute inset-0"
          style={{ bottom: 0 }}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {sortedProjects.map((project) => {
            const zone = project.data.zone as keyof typeof ZONE_COLORS;
            const zoneColor = ZONE_COLORS[zone];
            const pos = iconPositions[project.data.id];

            return (
              <FolderIcon
                key={project.data.id}
                project={project}
                zoneColor={zoneColor}
                isOpen={openProjectIds.includes(project.data.id)}
                onOpen={() => handleOpenProject(project)}
                position={pos}
                onDragEnd={(p) => handleIconDrag(project.data.id, p)}
                onDragStateChange={(d) => handleDragState(project.data.id, d)}
              />
            );
          })}

          {/* QuickLinks — bottom-right */}
          <div className="absolute" style={{ right: 28, bottom: 24 }}>
            <QuickLinks />
          </div>
        </motion.div>

        {/* ── Zone Legend (visible solo al arrastrar) ── */}
        <ZoneLegend isVisible={draggingId !== null} lang={langState.lang} />

        {/* ── Windows layer ── */}
        <WindowManager
          windows={windows}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onBringToFront={bringToFront}
          onUpdatePosition={updatePosition}
          projects={projects}
          lang={langState.lang}
        />

        {/* ── Taskbar ── */}
        <motion.div
          initial={reduce ? false : { y: 48 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <Taskbar
            lang={langState.lang}
            toggleLang={langState.toggleLang}
            viewMode={viewMode}
            onToggleView={() => setViewMode((v) => (v === 'icons' ? 'list' : 'icons'))}
            minimizedWindows={minimizedWindows}
            onRestoreWindow={restoreWindow}
            onOpenProfile={() => openWindow('profile', 'profile', t('profile_title'))}
          />
        </motion.div>

        {/* ── List view ── */}
        <AnimatePresence>
          {viewMode === 'list' && (
            <ListView projects={projects} onOpenProject={handleOpenProject} lang={langState.lang} />
          )}
        </AnimatePresence>
      </div>
    </LanguageContext.Provider>
  );
}

/* ── ListView ── */
function ListView({
  projects,
  onOpenProject,
  lang,
}: {
  projects: ProjectEntry[];
  onOpenProject: (p: ProjectEntry) => void;
  lang: string;
}) {
  const sorted = [...projects].sort((a, b) => b.data.date.localeCompare(a.data.date));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 overflow-auto"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 'var(--taskbar-h)',
        backgroundColor: 'rgba(13, 15, 20, 0.95)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="max-w-4xl mx-auto p-6">
        <table className="w-full" style={{ fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr className="text-left text-xs" style={{ color: 'var(--os-muted)' }}>
              <th className="pb-3 font-normal">{lang === 'es' ? 'Proyecto' : 'Project'}</th>
              <th className="pb-3 font-normal">{lang === 'es' ? 'Categoría' : 'Category'}</th>
              <th className="pb-3 font-normal hidden sm:table-cell">Stack</th>
              <th className="pb-3 font-normal">{lang === 'es' ? 'Fecha' : 'Date'}</th>
              <th className="pb-3 font-normal" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((project, i) => {
              const zone = project.data.zone as keyof typeof ZONE_COLORS;
              return (
                <motion.tr
                  key={project.data.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.1 }}
                  className="group cursor-pointer transition-colors duration-100"
                  style={{ borderBottom: '1px solid var(--os-border)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--os-surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  onClick={() => onOpenProject(project)}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ZONE_COLORS[zone] }}
                      />
                      <span className="text-sm" style={{ color: 'var(--os-text)' }}>
                        {project.data.title}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs" style={{ color: 'var(--os-muted)' }}>
                      {project.data.zone}
                    </span>
                  </td>
                  <td className="py-3 pr-4 hidden sm:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {project.data.stack.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] px-1.5 py-0.5 rounded-[var(--radius-sm)]"
                          style={{
                            backgroundColor: 'var(--os-surface-2)',
                            border: '1px solid var(--os-border)',
                            color: 'var(--os-muted)',
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs" style={{ color: 'var(--os-muted)' }}>
                      {project.data.date}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className="text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--os-accent)' }}
                    >
                      →
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
