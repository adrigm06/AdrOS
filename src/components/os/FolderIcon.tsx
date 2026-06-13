import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProjectEntry } from './Desktop';

interface FolderIconProps {
  project: ProjectEntry;
  zoneColor: string;
  isOpen: boolean;
  onOpen: () => void;
  /** Si se proporciona, el icono se posiciona absolutamente y es arrastrable */
  position?: { x: number; y: number };
  onDragEnd?: (pos: { x: number; y: number }) => void;
  /** Reporta si se está arrastrando (para mostrar grid/leyenda) */
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

  /* ── Hover ── */
  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setIsHovered(true), 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setIsHovered(false);
  };

  /* ── Drag handlers ── */
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
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMoved.current = true;
    }
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

        // Clamp
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

    // Cursor
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

  /* ── Double-click to open ── */
  const handleClick = () => {
    if (hasMoved.current || !position) return; // was a drag, not a click
    const now = Date.now();
    if (now - lastClick.current < 380) {
      // Double click!
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
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className="flex flex-col items-center gap-1 p-2 transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-1 focus:ring-[var(--os-accent)] rounded-[var(--radius-md)]"
        style={{
          minWidth: 80,
          minHeight: 80,
          cursor: position ? 'grab' : 'pointer',
        }}
        tabIndex={0}
        aria-label={`Abrir proyecto ${project.data.title}`}
      >
        {/* SVG Folder Icon — coloreado por zona */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          style={{
            filter: isOpen || isHovered ? `drop-shadow(0 0 6px ${color}88)` : undefined,
            pointerEvents: 'none',
          }}
        >
          <path
            d="M8 14C8 11.7909 9.79086 10 12 10H20.6863C21.7685 10 22.806 10.4214 23.5858 11.1716L26.8284 14.3431C27.5786 15.0933 28.6159 15.5 29.698 15.5H36C38.2091 15.5 40 17.2909 40 19.5V34C40 36.2091 38.2091 38 36 38H12C9.79086 38 8 36.2091 8 34V14Z"
            fill={isOpen || isHovered ? color : `${color}d9`}
            stroke={isOpen ? color : 'none'}
            strokeWidth="0.5"
          />
          <path
            d="M8 18C8 15.7909 9.79086 14 12 14H29.5C31.7091 14 33.5 15.7909 33.5 18V34C33.5 36.2091 31.7091 38 29.5 38H12C9.79086 38 8 36.2091 8 34V18Z"
            fill={isOpen || isHovered ? color : `${color}b3`}
            opacity={isOpen || isHovered ? 1 : 0.85}
          />
          {isOpen && (
            <rect x="13" y="22" width="15" height="2" rx="1" fill={`${color}66`} />
          )}
        </svg>

        {/* Label */}
        <span
          className="text-[11px] font-mono text-center leading-tight transition-colors duration-150 max-w-[80px] truncate"
          style={{
            color: isOpen ? 'var(--os-text)' : isHovered ? 'var(--os-text)' : 'var(--os-muted)',
            textDecoration: isOpen ? 'underline' : 'none',
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
            style={{ backgroundColor: color }}
          />
        )}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 font-mono text-[10px] pointer-events-none z-50"
            style={{
              backgroundColor: 'var(--os-surface-2)',
              border: '1px solid var(--os-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--os-text)',
            }}
          >
            {topTechs.join(' · ')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
