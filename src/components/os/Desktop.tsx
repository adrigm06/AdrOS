import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowManager } from '@/hooks/useWindowManager';
import { LanguageContext, useLanguageState, useTranslation } from '@/hooks/useLanguage';
import { useReducedMotion } from 'framer-motion';
import { useKonamiCode, useLsCommand } from '@/hooks/useEasterEggs';
import type { EasterEgg } from '@/hooks/useEasterEggs';
import Taskbar from './Taskbar';
import BootScreen from './BootScreen';
import WindowManager from './WindowManager';
import FolderIcon from './FolderIcon';
import ZoneLegend from './ZoneLegend';
import QuickLinks from '@/components/widgets/QuickLinks';
import { ZONE_COLORS } from '@/data/projects';
import ContextMenu from './ContextMenu';
import type { ContextMenuItem } from './ContextMenu';
import WallpaperPicker, { WALLPAPERS } from './WallpaperPicker';
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

/* ── Pure grid utilities ── */
function snapToGrid(pos: { x: number; y: number }): { x: number; y: number } {
  return {
    x: Math.round((pos.x - GRID_OFFSET_X) / GRID_X) * GRID_X + GRID_OFFSET_X,
    y: Math.round((pos.y - GRID_OFFSET_Y) / GRID_Y) * GRID_Y + GRID_OFFSET_Y,
  };
}

function getOccupiedSetSnapshot(
  positions: Record<string, { x: number; y: number }>,
  excludeId?: string,
): Set<string> {
  const set = new Set<string>();
  for (const [id, pos] of Object.entries(positions)) {
    if (id === excludeId) continue;
    const s = snapToGrid(pos);
    set.add(`${s.x},${s.y}`);
  }
  return set;
}

/** BFS outward from target to find the nearest unoccupied grid cell. */
function findNearestFreeCell(
  target: { x: number; y: number },
  occupiedKeys: Set<string>,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
): { x: number; y: number } {
  const key = `${target.x},${target.y}`;
  if (!occupiedKeys.has(key)) return { ...target };

  for (let r = 1; r <= 20; r++) {
    const candidates: Array<{ x: number; y: number }> = [];
    // Top & bottom rows (full width)
    for (let dx = -r; dx <= r; dx++) {
      candidates.push({ x: target.x + dx * GRID_X, y: target.y - r * GRID_Y });
      candidates.push({ x: target.x + dx * GRID_X, y: target.y + r * GRID_Y });
    }
    // Left & right columns (excluding corners)
    for (let dy = -r + 1; dy <= r - 1; dy++) {
      candidates.push({ x: target.x - r * GRID_X, y: target.y + dy * GRID_Y });
      candidates.push({ x: target.x + r * GRID_X, y: target.y + dy * GRID_Y });
    }

    for (const c of candidates) {
      if (
        c.x < bounds.minX || c.x > bounds.maxX ||
        c.y < bounds.minY || c.y > bounds.maxY
      ) continue;
      if (!occupiedKeys.has(`${c.x},${c.y}`)) return c;
    }
  }
  return { ...target };
}

/* ── Distribución inicial ── */
const COL_START_X = GRID_OFFSET_X;
const ROW_START_Y = GRID_OFFSET_Y;

function calcInitialPositions(projects: ProjectEntry[]): Record<string, { x: number; y: number }> {
  const zoneOrder = ['android', 'fullstack', 'ai-tools'];
  const zones = zoneOrder.filter((z) => projects.some((p) => p.data.zone === z));
  const positions: Record<string, { x: number; y: number }> = {};

  zones.forEach((zone, col) => {
    const baseX = COL_START_X + col * GRID_X;
    const zoneProjects = projects.filter((p) => p.data.zone === zone);
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
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [desktopCtxMenu, setDesktopCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [wallpaperId, setWallpaperId] = useState<string>(() => {
    if (typeof window === 'undefined') return 'sonoma';
    return localStorage.getItem('adros-wallpaper') || 'sonoma';
  });
  const [wallpaperPickerOpen, setWallpaperPickerOpen] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null);

  const {
    windows, minimizedWindows,
    openWindow, closeWindow, minimizeWindow, maximizeWindow,
    restoreWindow, bringToFront, updatePosition, updateSize,
  } = useWindowManager();

  const langState = useLanguageState();
  const { t } = useTranslation(langState.lang);
  const reduce = useReducedMotion();

  const { eggs, updateEgg } = useKonamiCode();
  useLsCommand();

  useEffect(() => {
    setIconPositions(calcInitialPositions(projects));
  }, [projects]);

  const handleOpenProject = useCallback((project: ProjectEntry) => {
    openWindow(project.data.id, 'project', project.data.title, project.data.id);
  }, [openWindow]);

  /* ── Drag state ── */
  const handleDragState = useCallback((id: string, dragging: boolean) => {
    setDraggingId(dragging ? id : null);
    if (!dragging) setDragPos(null);
  }, []);

  /* ── Drag move: raw position for snap markers ── */
  const handleIconDragMove = useCallback((_id: string, pos: { x: number; y: number }) => {
    setDragPos(pos);
  }, []);

  /* ── Drag end: snap → collide → clamp ── */
  const handleIconDragEnd = useCallback((id: string, rawPos: { x: number; y: number }) => {
    setIconPositions((prev) => {
      const snapped = snapToGrid(rawPos);
      const occupied = getOccupiedSetSnapshot(prev, id);

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Compute the last valid grid point within the viewport
      const bounds = {
        minX: GRID_OFFSET_X,
        minY: GRID_OFFSET_Y,
        maxX: Math.floor((vw - GRID_OFFSET_X - 40) / GRID_X) * GRID_X + GRID_OFFSET_X,
        maxY: Math.floor((vh - 160 - GRID_OFFSET_Y) / GRID_Y) * GRID_Y + GRID_OFFSET_Y,
      };

      const resolved = occupied.has(`${snapped.x},${snapped.y}`)
        ? findNearestFreeCell(snapped, occupied, bounds)
        : { ...snapped };

      // Final clamp
      resolved.x = Math.max(bounds.minX, Math.min(bounds.maxX, resolved.x));
      resolved.y = Math.max(bounds.minY, Math.min(bounds.maxY, resolved.y));

      return { ...prev, [id]: resolved };
    });
  }, []);

  /* ── snap-target & nearby cells (for corner markers) ── */
  const occupiedKeys = useMemo(
    () => getOccupiedSetSnapshot(iconPositions, draggingId ?? undefined),
    [iconPositions, draggingId],
  );

  const snapTarget = useMemo(() => {
    if (!dragPos) return null;
    const snapped = snapToGrid(dragPos);
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const bounds = {
      minX: GRID_OFFSET_X,
      minY: GRID_OFFSET_Y,
      maxX: Math.floor((vw - GRID_OFFSET_X - 40) / GRID_X) * GRID_X + GRID_OFFSET_X,
      maxY: Math.floor((vh - 160 - GRID_OFFSET_Y) / GRID_Y) * GRID_Y + GRID_OFFSET_Y,
    };
    if (occupiedKeys.has(`${snapped.x},${snapped.y}`)) {
      return findNearestFreeCell(snapped, occupiedKeys, bounds);
    }
    return snapped;
  }, [dragPos, occupiedKeys]);

  const nearbyCells = useMemo(() => {
    if (!snapTarget) return [];
    const cells: Array<{ x: number; y: number; isTarget: boolean }> = [];
    const range = 2;
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        cells.push({
          x: snapTarget.x + dx * GRID_X,
          y: snapTarget.y + dy * GRID_Y,
          isTarget: dx >= 0 && dx <= 1 && dy >= 0 && dy <= 1,
        });
      }
    }
    return cells;
  }, [snapTarget]);

  /* ── Desktop context menu ── */
  const handleDesktopContext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDesktopCtxMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleWallpaperSelect = useCallback((id: string) => {
    setWallpaperId(id);
    localStorage.setItem('adros-wallpaper', id);
    setWallpaperPickerOpen(false);
  }, []);

  const desktopCtxItems: ContextMenuItem[] = [
    {
      label: langState.lang === 'es' ? 'Cambiar fondo de pantalla' : 'Change Wallpaper',
      onClick: () => { setWallpaperPickerOpen(true); },
    },
  ];

  // Orden estable por zona
  const sortedProjects = [...projects].sort((a, b) => {
    const order = ['android', 'fullstack', 'ai-tools'];
    return order.indexOf(a.data.zone) - order.indexOf(b.data.zone);
  });

  const openProjectIds = windows
    .filter((w) => w.type === 'project' && w.isOpen && !w.isMinimized)
    .map((w) => w.projectId || '');

  /* ── Wallpaper from state ── */
  const currentWallpaper = WALLPAPERS.find((w) => w.id === wallpaperId) || WALLPAPERS[0];
  const wallpaperStyle: React.CSSProperties = {
    background: currentWallpaper.css,
    position: 'relative',
    transition: 'background 0.4s ease',
  };

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />;
  }

  return (
    <LanguageContext.Provider value={langState}>
      <div
        className="flex flex-col h-screen"
        style={wallpaperStyle}
      >
        {/* ── macOS-style menubar (normal flow, pushes content down) ── */}
        <div
          className="flex-shrink-0 flex items-center px-3 select-none"
          style={{
            height: 28,
            backgroundColor: 'rgba(16, 18, 26, 0.82)',
            backdropFilter: 'blur(20px) saturate(1.3)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-1.5">
            <img
              src="/AdrOS.webp"
              alt="AdrOS"
              className="w-[16px] h-[16px]"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
            />
            <span
              className="font-mono text-[11px] font-semibold tracking-wide"
              style={{ color: 'var(--os-text)' }}
            >
              AdrOS
            </span>
          </div>
        </div>

        <div
          ref={desktopRef}
          className="flex-1 relative overflow-hidden select-none"
          onContextMenu={handleDesktopContext}
        >
        {/* ── Corner markers (visible solo al arrastrar) ── */}
        <AnimatePresence>
          {nearbyCells.length > 0 && draggingId && (
            <SnapCornerMarkers cells={nearbyCells} />
          )}
        </AnimatePresence>

        {/* ── Desktop canvas ── */}
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
                onDragStateChange={(d) => handleDragState(project.data.id, d)}
                onDragMove={(p) => handleIconDragMove(project.data.id, p)}
                onDragEnd={(p) => handleIconDragEnd(project.data.id, p)}
              />
            );
          })}

          {/* ── Konami eggs ── */}
          {eggs.map((egg) => (
            <DraggableEgg key={egg.id} egg={egg} onMove={updateEgg} />
          ))}

          {/* QuickLinks — bottom-right */}
          <div className="absolute" style={{ right: 28, bottom: 24 }}>
            <QuickLinks
              lang={langState.lang}
              onOpenContact={() => openWindow('contact', 'contact', langState.lang === 'es' ? 'Contáctame' : 'Contact me')}
            />
          </div>
        </motion.div>

        {/* ── Zone Legend (visible solo al arrastrar) ── */}
        <ZoneLegend lang={langState.lang} />

        {/* ── Windows layer ── */}
        <WindowManager
          windows={windows}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onBringToFront={bringToFront}
          onUpdatePosition={updatePosition}
          onUpdateSize={updateSize}
          projects={projects}
          lang={langState.lang}
          onOpenContact={() => openWindow('contact', 'contact', langState.lang === 'es' ? 'Contáctame' : 'Contact me')}
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

        {/* ── Desktop context menu ── */}
        {desktopCtxMenu && (
          <ContextMenu
            items={desktopCtxItems}
            position={desktopCtxMenu}
            onClose={() => setDesktopCtxMenu(null)}
          />
        )}

        {/* ── Wallpaper picker ── */}
        <WallpaperPicker
          isOpen={wallpaperPickerOpen}
          currentId={wallpaperId}
          onSelect={handleWallpaperSelect}
          onClose={() => setWallpaperPickerOpen(false)}
        />

        {/* ── List view ── */}
        <AnimatePresence>
          {viewMode === 'list' && (
            <ListView
              projects={projects}
              onOpenProject={handleOpenProject}
              lang={langState.lang}
              onClose={() => setViewMode('icons')}
            />
          )}
        </AnimatePresence>
      </div>{/* end desktop */}
    </div>{/* end flex outer */}
    </LanguageContext.Provider>
  );
}

/* ==================================================================
   SnapCornerMarkers — stylised + at grid intersections during drag
   ================================================================== */
function SnapCornerMarkers({ cells }: { cells: Array<{ x: number; y: number; isTarget: boolean }> }) {
  const targetCells = cells.filter((c) => c.isTarget);
  const hasTarget = targetCells.length === 4;
  const rectX = hasTarget ? Math.min(...targetCells.map((c) => c.x)) : 0;
  const rectY = hasTarget ? Math.min(...targetCells.map((c) => c.y)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 51 }}
    >
      {/* Rectangle outline of the target grid cell */}
      {hasTarget && (
        <div
          className="absolute pointer-events-none rounded-[4px]"
          style={{
            left: rectX,
            top: rectY,
            width: GRID_X,
            height: GRID_Y,
            border: '1.5px solid var(--os-accent)',
            backgroundColor: 'rgba(0, 212, 170, 0.04)',
            opacity: 0.35,
          }}
        />
      )}

      {/* Individual + markers */}
      {cells.map((cell) => (
        <div
          key={`${cell.x}-${cell.y}`}
          className="absolute"
          style={{
            left: cell.x - 7,
            top: cell.y - 7,
            width: 14,
            height: 14,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            style={{ opacity: cell.isTarget ? 1 : 0.3 }}
          >
            <line
              x1="7" y1="2" x2="7" y2="12"
              stroke={cell.isTarget ? 'var(--os-accent)' : 'rgba(255,255,255,0.35)'}
              strokeWidth={cell.isTarget ? 1.5 : 0.75}
              strokeLinecap="round"
            />
            <line
              x1="2" y1="7" x2="12" y2="7"
              stroke={cell.isTarget ? 'var(--os-accent)' : 'rgba(255,255,255,0.35)'}
              strokeWidth={cell.isTarget ? 1.5 : 0.75}
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </motion.div>
  );
}

/* ==================================================================
   DraggableEgg — konami code easter egg (literally a draggable egg)
   ================================================================== */
function DraggableEgg({ egg, onMove }: { egg: EasterEgg; onMove: (id: number, x: number, y: number) => void }) {
  const dragRef = useRef<HTMLDivElement>(null);
  const startPos = useRef({ x: 0, y: 0, eggX: 0, eggY: 0 });
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    startPos.current = { x: e.clientX, y: e.clientY, eggX: egg.x, eggY: egg.y };
    setDragging(true);
  }, [egg.x, egg.y]);

  useEffect(() => {
    if (!dragging) return;
    const onMove_ = (e: MouseEvent) => {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      if (dragRef.current) {
        dragRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };
    const onUp = (e: MouseEvent) => {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      onMove(egg.id, startPos.current.eggX + dx, startPos.current.eggY + dy);
      if (dragRef.current) dragRef.current.style.transform = '';
      setDragging(false);
    };
    window.addEventListener('mousemove', onMove_);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove_);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, egg.id, onMove]);

  return (
    <div
      ref={dragRef}
      onMouseDown={handleMouseDown}
      className="absolute flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
      style={{
        left: egg.x - 22,
        top: egg.y - 22,
        width: 44,
        height: 44,
        zIndex: dragging ? 9998 : 100,
        transition: dragging ? 'none' : 'left 0.2s ease, top 0.2s ease',
        filter: `drop-shadow(0 4px 16px rgba(0, 212, 170, 0.35))`,
      }}
    >
      <div
        className="rounded-full flex items-center justify-center transition-transform"
        style={{
          width: 44,
          height: 44,
          background: 'radial-gradient(circle at 35% 30%, rgba(0,212,170,0.2), rgba(0,212,170,0.05))',
          border: '1px solid rgba(0,212,170,0.2)',
          transform: dragging ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <img
          src="/AdrOS.webp"
          alt="🥚"
          className="w-[26px] h-[26px] pointer-events-none"
          style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,170,0.4))' }}
        />
      </div>
    </div>
  );
}

/* ── ListView con buscador ── */
function ListView({
  projects,
  onOpenProject,
  lang,
  onClose,
}: {
  projects: ProjectEntry[];
  onOpenProject: (p: ProjectEntry) => void;
  lang: string;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const sorted = [...projects].sort((a, b) => b.data.date.localeCompare(a.data.date));

  const filtered = query.trim()
    ? sorted.filter((p) => {
        const q = query.toLowerCase();
        const nameMatch = p.data.title.toLowerCase().includes(q);
        const techMatch = p.data.stack.some((t) => t.toLowerCase().includes(q));
        return nameMatch || techMatch;
      })
    : sorted;

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Escape to close list view
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

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
        bottom: 0,
        backgroundColor: 'rgba(13, 15, 20, 0.98)',
        backdropFilter: 'blur(16px)',
      }}
    >
      <div className="max-w-4xl mx-auto p-6">
        {/* Search input */}
        <div className="relative mb-5">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--os-muted)' }}
          >
            <circle cx="6" cy="6" r="4.5" />
            <path d="M9.5 9.5L13 13" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'es' ? 'Buscar por nombre o tecnología...' : 'Search by name or technology...'}
            className="w-full pl-9 pr-8 py-2 font-mono text-sm outline-none transition-colors duration-150"
            style={{
              backgroundColor: 'var(--os-surface-2)',
              border: '1px solid var(--os-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--os-text)',
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setQuery('');
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Clear search"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--os-muted)' }}>
                <path d="M1 1L9 9M9 1L1 9" />
              </svg>
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="mb-3 font-mono text-[10px]" style={{ color: 'var(--os-muted)' }}>
          {filtered.length === 0
            ? (lang === 'es' ? 'Sin resultados' : 'No results')
            : `${filtered.length} ${lang === 'es' ? 'proyecto' : 'project'}${filtered.length !== 1 ? 's' : ''}`}
        </div>

        {/* Table */}
        {filtered.length > 0 && (
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
              {filtered.map((project, i) => {
                const zone = project.data.zone as keyof typeof ZONE_COLORS;
                return (
                  <motion.tr
                    key={project.data.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.1 }}
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
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--os-muted)', opacity: 0.5 }}>
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21L16.65 16.65" />
            </svg>
            <span className="font-mono text-xs" style={{ color: 'var(--os-muted)' }}>
              {lang === 'es' ? 'Ningún proyecto coincide con tu búsqueda' : 'No projects match your search'}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
