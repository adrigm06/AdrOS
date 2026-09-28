import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProjectEntry } from './Desktop';
import ContextMenu from './ContextMenu';
import type { ContextMenuItem } from './ContextMenu';

interface FolderIconProps {
  project: ProjectEntry;
  zoneColor: string;
  isOpen: boolean;
  onOpen: () => void;
  position?: { x: number; y: number };
  onDragMove?: (pos: { x: number; y: number }) => void;
  onDragEnd?: (pos: { x: number; y: number }) => void;
  onDragStateChange?: (dragging: boolean) => void;
}

export default function FolderIcon({
  project,
  zoneColor,
  isOpen,
  onOpen,
  position,
  onDragMove,
  onDragEnd,
  onDragStateChange,
}: FolderIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const hasMoved = useRef(false);
  const dragReported = useRef(false);
  const lastClick = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const topTechs = project.data.stack.slice(0, 3);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setIsHovered(true), 250);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setIsHovered(false);
  };

  /* ── Drag (only reports to parent after actual movement) ── */
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (!position || !onDragEnd) return;
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    hasMoved.current = false;
    dragReported.current = false;
    dragStart.current = { x: clientX, y: clientY, posX: position.x, posY: position.y };
    setIsDragging(true);
  }, [position, onDragEnd]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    if (!hasMoved.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
      hasMoved.current = true;
      if (!dragReported.current) {
        dragReported.current = true;
        onDragStateChange?.(true);
      }
    }
    if (dragRef.current) {
      dragRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    if (hasMoved.current && position) {
      onDragMove?.({ x: position.x + dx, y: position.y + dy });
    }
  }, [isDragging, onDragStateChange, position, onDragMove]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging || !position || !onDragEnd) return;
    if (dragReported.current) {
      onDragStateChange?.(false);
    }
    dragReported.current = false;

    const el = dragRef.current;
    if (el) {
      const match = el.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      if (match && hasMoved.current) {
        const deltaX = parseFloat(match[1]);
        const deltaY = parseFloat(match[2]);
        onDragEnd({ x: position.x + deltaX, y: position.y + deltaY });
      }
      el.style.transform = '';
    }
    setIsDragging(false);
  }, [isDragging, position, onDragEnd, onDragStateChange]);

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      handleDragMove(t.clientX, t.clientY);
    };
    const onUp = () => handleDragEnd();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onUp);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    handleDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    handleDragStart(t.clientX, t.clientY);
  };

  /* ── Context menu ── */
  const [ctxMenuPos, setCtxMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowInfo(false);
    setCtxMenuPos({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setCtxMenuPos(null);

  const ctxItems: ContextMenuItem[] = [
    {
      label: 'Abrir',
      onClick: () => { onOpen(); closeContextMenu(); },
    },
    {
      label: 'Obtener información',
      onClick: () => {
        setShowInfo(true);
        if (position) {
          setInfoPos({ x: position.x + 30, y: position.y - 20 });
        }
        closeContextMenu();
      },
    },
  ];

  /* ── Draggable Get Info window ── */
  const [infoPos, setInfoPos] = useState({ x: 0, y: 0 });
  const infoDragRef = useRef<HTMLDivElement>(null);
  const infoDragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const [isInfoDragging, setIsInfoDragging] = useState(false);

  const handleInfoMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    infoDragStart.current = { x: e.clientX, y: e.clientY, posX: infoPos.x, posY: infoPos.y };
    setIsInfoDragging(true);
  };

  useEffect(() => {
    if (!isInfoDragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - infoDragStart.current.x;
      const dy = e.clientY - infoDragStart.current.y;
      if (infoDragRef.current) {
        infoDragRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      }
    };
    const onUp = () => {
      if (infoDragRef.current) {
        const el = infoDragRef.current;
        const match = el.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
        if (match) {
          const dx = parseFloat(match[1]);
          const dy = parseFloat(match[2]);
          setInfoPos((prev) => ({
            x: Math.max(0, Math.min(window.innerWidth - 240, prev.x + dx)),
            y: Math.max(0, Math.min(window.innerHeight - 300, prev.y + dy)),
          }));
        }
        el.style.transform = '';
      }
      setIsInfoDragging(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isInfoDragging]);

  /* ── Double-click / Single-tap on Mobile ── */
  const handleClick = () => {
    if (hasMoved.current || !position) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    if (isMobile) {
      onOpen();
      return;
    }
    const now = Date.now();
    if (now - lastClick.current < 380) {
      lastClick.current = 0;
      if (clickTimer.current) clearTimeout(clickTimer.current);
      onOpen();
    } else {
      lastClick.current = now;
    }
  };

  const containerStyle: React.CSSProperties = position
    ? {
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 100 : 1,
        transition: isDragging
          ? 'none'
          : 'left 0.25s cubic-bezier(0.23, 1, 0.32, 1), top 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
      }
    : {};

  const iconScale = isDragging ? 0.95 : isHovered ? 1.05 : 1;

  const LANG = typeof navigator !== 'undefined' && navigator.language.startsWith('es') ? 'es' : 'en';

  return (
    <div
      ref={dragRef}
      className="inline-flex flex-col items-center gap-1 select-none"
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className="group flex flex-col items-center gap-1.5 p-1.5 outline-none rounded-[var(--radius-md)] transition-transform active:scale-[0.94]"
        style={{
          width: 92,
          minHeight: 88,
          cursor: position ? 'grab' : 'pointer',
          transform: `scale(${iconScale})`,
          transition: 'transform 0.18s var(--ease-out)',
        }}
        tabIndex={0}
        aria-label={`Abrir proyecto ${project.data.title}`}
      >
        {/* Authentic macOS Folder Asset */}
        <div className="relative w-14 h-14 flex items-center justify-center pointer-events-none">
          <img
            src="/icons/folder.webp"
            alt={project.data.title}
            className="w-14 h-14 object-contain"
            style={{
              filter: isOpen || isHovered
                ? 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.5))'
                : 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.35))',
            }}
          />

          {/* Finder Category Tag (Apple-style colored dot in bottom right of folder) */}
          <div
            className="absolute bottom-1 right-1.5 w-3 h-3 rounded-full border border-black/40 shadow-sm"
            style={{ backgroundColor: zoneColor }}
            title={`Categoría: ${project.data.zone}`}
          />
        </div>

        {/* macOS Finder-style Label with Selection Pill on Hover */}
        <span
          className={`font-sans text-[11px] font-medium text-center leading-tight max-w-[86px] truncate px-1.5 py-0.5 rounded-[4px] transition-colors pointer-events-none ${
            isHovered || isOpen
              ? 'bg-[var(--os-blue)] text-white shadow-sm'
              : 'text-white'
          }`}
          style={{
            textShadow: isHovered || isOpen ? 'none' : '0 1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)',
          }}
        >
          {project.data.title}
        </span>

        {/* Running Indicator Dot if open */}
        {isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-1.5 h-1.5 rounded-full -mt-0.5"
            style={{ backgroundColor: zoneColor, boxShadow: `0 0 5px ${zoneColor}` }}
          />
        )}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 font-sans text-[10px] pointer-events-none z-50 rounded-[4px] vibrancy-popover text-white/90"
          >
            {topTechs.join(' · ')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context menu */}
      {ctxMenuPos && (
        <ContextMenu
          items={ctxItems}
          position={ctxMenuPos}
          onClose={closeContextMenu}
        />
      )}

      {/* Draggable Get Info window */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            ref={infoDragRef}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="fixed vibrancy-window rounded-[var(--radius-lg)] overflow-hidden z-[99999]"
            style={{
              left: infoPos.x,
              top: infoPos.y,
              width: 250,
              boxShadow: 'var(--shadow-window)',
            }}
          >
            {/* Title bar — draggable */}
            <div
              className="flex items-center justify-between px-3 select-none border-b border-white/10"
              style={{
                height: 32,
                backgroundColor: 'rgba(28, 31, 43, 0.75)',
                cursor: 'grab',
              }}
              onMouseDown={handleInfoMouseDown}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: zoneColor }} />
                <span className="text-[11px] font-sans font-medium text-white/70">
                  {LANG === 'es' ? 'Información' : 'Get Info'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="w-4 h-4 rounded-full bg-[#ff5f57] flex items-center justify-center hover:opacity-80 transition-opacity"
                aria-label="Cerrar"
              >
                <span className="text-[8px] text-black/60 font-bold leading-none">×</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-3.5 space-y-2 bg-[rgba(16,18,26,0.6)]">
              <div className="flex items-center gap-2 mb-2">
                <img src="/icons/folder.webp" alt="Folder" className="w-8 h-8 object-contain" />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-sans text-xs font-semibold text-white truncate">
                    {project.data.title}
                  </span>
                  <span className="font-sans text-[10px] text-white/50">
                    {project.data.zone}
                  </span>
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-white/5">
                <InfoRow label={LANG === 'es' ? 'Estado' : 'Status'} value={project.data.status} colorKey="status" />
                <InfoRow label={LANG === 'es' ? 'Fecha' : 'Date'} value={project.data.date} />
              </div>

              <div className="pt-2 border-t border-white/5">
                <span className="font-sans text-[10px] text-white/50 block mb-1">
                  {LANG === 'es' ? 'Tecnologías' : 'Technologies'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {project.data.stack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[9px] px-1.5 py-0.5 font-sans rounded-[4px] bg-white/10 text-white/80"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ label, value, colorKey }: { label: string; value: string; colorKey?: string }) {
  return (
    <div className="flex justify-between items-center text-[10px] font-sans">
      <span className="text-white/50">{label}</span>
      <span
        className={
          colorKey === 'status'
            ? value === 'active' ? 'text-[var(--os-ok)] font-medium' : 'text-white/70'
            : 'text-white/80'
        }
      >
        {value}
      </span>
    </div>
  );
}
