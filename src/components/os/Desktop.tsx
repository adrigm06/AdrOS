import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowManager } from '@/hooks/useWindowManager';
import { LanguageContext, useLanguageState, useTranslation } from '@/hooks/useLanguage';
import { useReducedMotion } from 'framer-motion';
import { useKonamiCode, useLsCommand } from '@/hooks/useEasterEggs';
import type { EasterEgg } from '@/hooks/useEasterEggs';
import Taskbar from './Taskbar';
import MenuBar from './MenuBar';
import BootScreen from './BootScreen';
import WindowManager from './WindowManager';
import FolderIcon from './FolderIcon';
import ZoneLegend from './ZoneLegend';
import BotIcon from './BotIcon';
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
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const positions: Record<string, { x: number; y: number }> = {};

  if (isMobile) {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 390;
    const available = vw - 24;
    const colWidth = Math.floor(available / 3);
    const rowHeight = 104;
    const startX = 12 + Math.floor((colWidth - 92) / 2);
    const startY = 44; // below menubar
    const cols = 3;

    // Cell 0 (0, 0) is reserved for AdrBOT
    positions['adrbot'] = {
      x: startX,
      y: startY,
    };

    // Projects start from cell 1
    projects.forEach((p, idx) => {
      const slot = idx + 1;
      const col = slot % cols;
      const row = Math.floor(slot / cols);
      positions[p.data.id] = {
        x: startX + col * colWidth,
        y: startY + row * rowHeight,
      };
    });
    return positions;
  }

  const zoneOrder = ['android', 'fullstack', 'ai-tools'];
  const zones = zoneOrder.filter((z) => projects.some((p) => p.data.zone === z));

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
    if (typeof window === 'undefined') return 'sequoia-dark';
    return localStorage.getItem('adros-wallpaper') || 'sequoia-dark';
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
    const initial = calcInitialPositions(projects);
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const isMobile = vw < 768;

    if (!isMobile) {
      const maxColX = Math.floor((vw - GRID_OFFSET_X - 40) / GRID_X) * GRID_X + GRID_OFFSET_X;
      const botX = maxColX - GRID_X;
      initial['adrbot'] = { x: Math.max(GRID_OFFSET_X, botX), y: GRID_OFFSET_Y };
    }
    setIconPositions(initial);
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
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const occupied = getOccupiedSetSnapshot(prev, id);
      const bounds = {
        minX: GRID_OFFSET_X,
        minY: GRID_OFFSET_Y,
        maxX: Math.floor((vw - GRID_OFFSET_X - 40) / GRID_X) * GRID_X + GRID_OFFSET_X,
        maxY: Math.floor((vh - 160 - GRID_OFFSET_Y) / GRID_Y) * GRID_Y + GRID_OFFSET_Y,
      };

      const resolved = occupied.has(`${snapped.x},${snapped.y}`)
        ? findNearestFreeCell(snapped, occupied, bounds)
        : { ...snapped };

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
    const maxColX = Math.floor((vw - GRID_OFFSET_X - 40) / GRID_X) * GRID_X + GRID_OFFSET_X;
    const bounds = {
      minX: GRID_OFFSET_X,
      minY: GRID_OFFSET_Y,
      maxX: maxColX,
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
    backgroundImage: `url('${currentWallpaper.image}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    transition: 'background-image 0.4s ease',
  };

  const activeWindow = windows
    .filter((w) => w.isOpen && !w.isMinimized)
    .sort((a, b) => b.zIndex - a.zIndex)[0];
  const activeWindowTitle = viewMode === 'list'
    ? 'Finder'
    : (activeWindow ? activeWindow.title : 'AdrOS');

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />;
  }

  return (
    <LanguageContext.Provider value={langState}>
      <div
        className="flex flex-col h-screen"
        style={wallpaperStyle}
      >
        {/* ── macOS Menu Bar ── */}
        <MenuBar
          lang={langState.lang}
          toggleLang={langState.toggleLang}
          activeWindowTitle={activeWindowTitle}
          onOpenWallpaperPicker={() => {
            setWallpaperPickerOpen(true);
            setViewMode('icons');
          }}
          onOpenProfile={() => {
            openWindow('profile', 'profile', t('profile_title'));
            setViewMode('icons');
          }}
          onOpenContact={() => {
            openWindow('contact', 'contact', langState.lang === 'es' ? 'Contáctame' : 'Contact me');
            setViewMode('icons');
          }}
          onOpenChat={() => {
            openWindow('chat', 'chat', 'AdrBOT');
            setViewMode('icons');
          }}
          viewMode={viewMode}
          onToggleView={() => setViewMode((v) => (v === 'icons' ? 'list' : 'icons'))}
          onRestart={() => setBooted(false)}
        />

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

          {/* ── AdrBOT desktop icon (2x2) ── */}
          {iconPositions['adrbot'] && (
            <BotIcon
              lang={langState.lang}
              isOpen={windows.some((w) => w.type === 'chat' && w.isOpen && !w.isMinimized)}
              onOpen={() => openWindow('chat', 'chat', 'AdrBOT')}
              position={iconPositions['adrbot']}
              onDragStateChange={(d) => handleDragState('adrbot', d)}
              onDragMove={(p) => handleIconDragMove('adrbot', p)}
              onDragEnd={(p) => handleIconDragEnd('adrbot', p)}
            />
          )}

          {/* ── Konami eggs ── */}
          {eggs.map((egg) => (
            <DraggableEgg key={egg.id} egg={egg} onMove={updateEgg} />
          ))}

          {/* QuickLinks — bottom-right on desktop, centered above dock on mobile */}
          <div
            className="absolute transition-all duration-200 z-10"
            style={{
              ...(typeof window !== 'undefined' && window.innerWidth < 768
                ? { left: '50%', transform: 'translateX(-50%)', bottom: 78 }
                : { right: 28, bottom: 24 }),
            }}
          >
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

        {/* ── macOS Dock ── */}
        <motion.div
          initial={reduce ? false : { y: 48 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <Taskbar
            lang={langState.lang}
            viewMode={viewMode}
            onToggleView={() => setViewMode((v) => (v === 'icons' ? 'list' : 'icons'))}
            minimizedWindows={minimizedWindows}
            onRestoreWindow={(id) => {
              restoreWindow(id);
              setViewMode('icons');
            }}
            onOpenProfile={() => {
              openWindow('profile', 'profile', t('profile_title'));
              setViewMode('icons');
            }}
            onOpenContact={() => {
              openWindow('contact', 'contact', langState.lang === 'es' ? 'Contáctame' : 'Contact me');
              setViewMode('icons');
            }}
            onOpenChat={() => {
              openWindow('chat', 'chat', 'AdrBOT');
              setViewMode('icons');
            }}
            onOpenWallpaperPicker={() => {
              setWallpaperPickerOpen(true);
              setViewMode('icons');
            }}
            openWindows={windows}
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
          lang={langState.lang}
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
      transition={{ duration: 0.18, ease: 'easeOut' }}
      role="dialog"
      aria-label={lang === 'es' ? 'Explorador Finder' : 'Finder Explorer'}
      className="fixed inset-0 top-[var(--menubar-h)] z-[8000] overflow-auto pb-[calc(var(--dock-h)+24px)]"
      style={{
        backgroundColor: 'rgba(18, 20, 29, 0.88)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      }}
    >
      <div className="max-w-4xl mx-auto p-6">
        {/* Finder Header bar */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
          <div className="flex items-center gap-2">
            <img src="/icons/finder.webp" alt="Finder" className="w-5 h-5 object-contain" />
            <span className="font-sans text-xs font-semibold text-white tracking-tight">
              {lang === 'es' ? 'Explorador de Proyectos' : 'Projects Explorer'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            onTouchEnd={(e) => {
              e.preventDefault();
              onClose();
            }}
            className="px-2.5 py-1 rounded-[6px] bg-white/15 active:bg-white/30 hover:bg-white/20 text-white font-medium text-[11px] font-sans transition-colors cursor-pointer border border-white/10"
          >
            {lang === 'es' ? '✕ Cerrar' : '✕ Close'}
          </button>
        </div>

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
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            <circle cx="6" cy="6" r="4.5" />
            <path d="M9.5 9.5L13 13" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === 'es' ? 'Buscar proyecto por nombre o tecnología...' : 'Search project by name or tech...'}
            className="w-full pl-9 pr-8 py-2 font-sans text-xs outline-none transition-colors duration-150 text-white placeholder:text-white/30 rounded-[8px] bg-white/5 border border-white/10 focus:border-[var(--os-blue)]"
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
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <path d="M1 1L9 9M9 1L1 9" />
              </svg>
            </button>
          )}
        </div>

        {/* Results count */}
        <div className="mb-3 font-sans text-[11px] text-white/50">
          {filtered.length === 0
            ? (lang === 'es' ? 'Sin proyectos coincidentes' : 'No matching projects')
            : `${filtered.length} ${lang === 'es' ? 'proyecto' : 'project'}${filtered.length !== 1 ? 's' : ''}`}
        </div>

        {/* Table */}
        {filtered.length > 0 && (
          <div className="rounded-[10px] border border-white/10 overflow-hidden bg-white/[0.03]">
            <table className="w-full font-sans">
              <thead>
                <tr className="text-left text-[11px] text-white/50 border-b border-white/10 bg-white/[0.04]">
                  <th className="py-2.5 px-3.5 font-medium">{lang === 'es' ? 'Nombre' : 'Name'}</th>
                  <th className="py-2.5 px-3.5 font-medium">{lang === 'es' ? 'Categoría' : 'Category'}</th>
                  <th className="py-2.5 px-3.5 font-medium hidden sm:table-cell">Stack</th>
                  <th className="py-2.5 px-3.5 font-medium whitespace-nowrap">{lang === 'es' ? 'Fecha' : 'Date'}</th>
                  <th className="py-2.5 px-3.5 font-medium text-right hidden sm:table-cell">{lang === 'es' ? 'Abrir' : 'Open'}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((project, i) => {
                  const zone = project.data.zone as keyof typeof ZONE_COLORS;
                  return (
                    <motion.tr
                      key={project.data.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02, duration: 0.12 }}
                      className="group cursor-pointer transition-colors duration-100 hover:bg-[var(--os-blue)]/20 active:bg-[var(--os-blue)]/30 border-b border-white/5 last:border-b-0"
                      onClick={() => onOpenProject(project)}
                    >
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <img src="/icons/folder.webp" alt="folder" className="w-4 h-4 object-contain flex-shrink-0" />
                          <span className="text-xs font-medium text-white group-hover:text-white">
                            {project.data.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: ZONE_COLORS[zone] }}
                          />
                          <span className="text-xs text-white/70">
                            {project.data.zone}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 hidden sm:table-cell">
                        <div className="flex gap-1 flex-wrap">
                          {project.data.stack.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className="text-[10px] px-1.5 py-0.5 rounded-[4px] bg-white/10 text-white/80"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 whitespace-nowrap">
                        <span className="text-xs text-white/50 font-mono whitespace-nowrap">
                          {project.data.date}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-right hidden sm:table-cell">
                        <span
                          className="text-xs font-semibold text-[var(--os-blue)] opacity-0 group-hover:opacity-100 transition-opacity"
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
