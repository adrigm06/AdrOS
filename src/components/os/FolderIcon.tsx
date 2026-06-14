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
  onDragEnd?: (pos: { x: number; y: number }) => void;
  onDragStateChange?: (dragging: boolean) => void;
}

export default function FolderIcon({
  project, zoneColor, isOpen, onOpen,
  position, onDragEnd, onDragStateChange,
}: FolderIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const hasMoved = useRef(false);
  const lastClick = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const color = zoneColor;
  const topTechs = project.data.stack.slice(0, 3);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setIsHovered(true), 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setIsHovered(false);
  };

  /* ── Drag ── */
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    if (!position || !onDragEnd) return;
    hasMoved.current = false;
    dragStart.current = { x: clientX, y: clientY, posX: position.x, posY: position.y };
    setIsDragging(true);
    onDragStateChange?.(true);
  }, [position, onDragEnd, onDragStateChange]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
    if (dragRef.current) {
      dragRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging || !position || !onDragEnd) return;
    onDragStateChange?.(false);
    const el = dragRef.current;
    if (el) {
      const match = el.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      if (match) {
        const deltaX = parseFloat(match[1]);
        const deltaY = parseFloat(match[2]);
        let newX = position.x + deltaX;
        let newY = position.y + deltaY;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        newX = Math.max(0, Math.min(vw - 100, newX));
        newY = Math.max(0, Math.min(vh - 130, newY));
        onDragEnd({ x: newX, y: newY });
      } else {
        onDragEnd(position);
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
      label: 'Open',
      onClick: () => { onOpen(); closeContextMenu(); },
    },
    {
      label: 'Get Info',
      onClick: () => { setShowInfo(true); closeContextMenu(); },
    },
  ];

  /* ── Double-click ── */
  const handleClick = () => {
    if (hasMoved.current || !position) return;
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
      }
    : {};

  const iconScale = isDragging ? 0.95 : isHovered ? 1.05 : 1;

  return (
    <div
      ref={dragRef}
      className="inline-flex flex-col items-center gap-1"
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
        className="flex flex-col items-center gap-1 p-2 outline-none rounded-[var(--radius-md)] transition-transform active:scale-[0.94]"
        style={{
          minWidth: 80,
          minHeight: 80,
          cursor: position ? 'grab' : 'pointer',
          transform: `scale(${iconScale})`,
          transition: 'transform 0.18s var(--ease-out), box-shadow 0.18s var(--ease-out)',
          boxShadow: isHovered && !isDragging ? `0 0 0 2px ${color}44` : 'none',
        }}
        tabIndex={0}
        aria-label={`Abrir proyecto ${project.data.title}`}
      >
        {/* macOS Folder SVG with 3D shading */}
        <svg
          width={56}
          height={56}
          viewBox="0 0 56 56"
          fill="none"
          style={{
            filter: isOpen || isHovered ? `drop-shadow(0 2px 8px ${color}66)` : 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))',
            pointerEvents: 'none',
          }}
        >
          {/* Folder shadow */}
          <rect x="6" y="44" width="44" height="4" rx="2" fill="rgba(0,0,0,0.15)" />
          {/* Folder tab (back) */}
          <path
            d="M9 17a5 5 0 0 1 5-5h9.5a5 5 0 0 1 3.535 1.465l3.5 3.5A5 5 0 0 0 34.07 18.5H42a5 5 0 0 1 5 5V39a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5V17z"
            fill={isOpen || isHovered ? color : `${color}cc`}
            stroke={isOpen ? color : `${color}44`}
            strokeWidth="0.5"
          />
          {/* Folder body (front) — with gradient via overlapping paths */}
          <path
            d="M9 21a5 5 0 0 1 5-5h24a5 5 0 0 1 5 5v18a5 5 0 0 1-5 5H14a5 5 0 0 1-5-5V21z"
            fill={isOpen || isHovered ? color : `${color}99`}
            opacity={isOpen || isHovered ? 1 : 0.85}
          />
          {/* Subtle top highlight */}
          <path
            d="M9 21a5 5 0 0 1 5-5h24a5 5 0 0 1 5 5v2a5 5 0 0 0-5-5H14a5 5 0 0 0-5 5v-2z"
            fill="rgba(255,255,255,0.1)"
          />
          {/* Paper detail when open */}
          {isOpen && (
            <>
              <rect x="16" y="27" width="20" height="2.5" rx="1.25" fill="rgba(255,255,255,0.2)" />
              <rect x="16" y="32" width="14" height="2.5" rx="1.25" fill="rgba(255,255,255,0.15)" />
            </>
          )}
        </svg>

        {/* Label with text shadow for readability */}
        <span
          className="text-[11px] font-mono text-center leading-tight max-w-[88px] truncate px-1"
          style={{
            color: isOpen ? 'var(--os-text)' : isHovered ? 'var(--os-text)' : 'var(--os-muted-light, #8b95a5)',
            textDecoration: isOpen ? 'underline' : 'none',
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
          }}
        >
          {project.data.title}
        </span>

        {/* Active dot */}
        {isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
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
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 font-mono text-[10px] pointer-events-none z-50"
            style={{
              backgroundColor: 'rgba(22, 24, 34, 0.92)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--os-text-dim)',
            }}
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

      {/* Get Info card */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="fixed z-[99999]"
            style={{
              left: position ? position.x + 20 : 20,
              top: position ? position.y : 20,
              width: 220,
            }}
          >
            <div
              className="rounded-[var(--radius-md)] p-3"
              style={{
                backgroundColor: 'rgba(22, 24, 34, 0.94)',
                backdropFilter: 'blur(20px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              }}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--os-muted)' }}>
                  <path d="M1 1L7 7M7 1L1 7" />
                </svg>
              </button>

              <div className="flex items-center gap-2 mb-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: zoneColor }} />
                <span className="font-sans text-sm font-semibold" style={{ color: 'var(--os-text)' }}>
                  {project.data.title}
                </span>
              </div>

              <div className="space-y-1.5">
                <InfoRow label={langLabel('Status', 'Estado')} value={project.data.status} colorKey="status" />
                <InfoRow label={langLabel('Date', 'Fecha')} value={project.data.date} />
                <InfoRow label={langLabel('Category', 'Categoría')} value={project.data.zone} />
                <div className="pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--os-muted)' }}>
                    {langLabel('Technologies', 'Tecnologías')}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.data.stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[9px] px-1.5 py-0.5 font-mono rounded-[var(--radius-sm)]"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          color: 'var(--os-text-dim)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const LANG = typeof navigator !== 'undefined' && navigator.language.startsWith('es') ? 'es' : 'en';
function langLabel(en: string, es: string) { return LANG === 'es' ? es : en; }

function InfoRow({ label, value, colorKey }: { label: string; value: string; colorKey?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-mono text-[10px]" style={{ color: 'var(--os-muted)' }}>
        {label}
      </span>
      <span
        className="font-mono text-[10px]"
        style={{
          color: colorKey === 'status'
            ? value === 'active' ? 'var(--os-ok)' : value === 'completed' ? 'var(--os-warn)' : 'var(--os-muted)'
            : 'var(--os-text-dim)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
