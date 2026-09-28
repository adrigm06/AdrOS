import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lang } from '@/hooks/useLanguage';

interface BotIconProps {
  isOpen: boolean;
  onOpen: () => void;
  position?: { x: number; y: number };
  onDragMove?: (pos: { x: number; y: number }) => void;
  onDragEnd?: (pos: { x: number; y: number }) => void;
  onDragStateChange?: (dragging: boolean) => void;
  lang: Lang;
}

export default function BotIcon({
  isOpen,
  onOpen,
  position,
  onDragMove,
  onDragEnd,
  onDragStateChange,
  lang,
}: BotIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const hasMoved = useRef(false);
  const dragReported = useRef(false);
  const lastClick = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  /* ── Drag handling ── */
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
        zIndex: isDragging ? 100 : 2,
        transition: isDragging
          ? 'none'
          : 'left 0.25s cubic-bezier(0.23, 1, 0.32, 1), top 0.25s cubic-bezier(0.23, 1, 0.32, 1)',
      }
    : {};

  const iconScale = isDragging ? 0.95 : isHovered ? 1.05 : 1;

  return (
    <div
      ref={dragRef}
      className="inline-flex flex-col items-center justify-center select-none"
      style={containerStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className="group flex flex-col items-center gap-1.5 p-1.5 outline-none rounded-[var(--radius-md)] transition-transform active:scale-[0.94]"
        style={{
          width: 90,
          cursor: position ? 'grab' : 'pointer',
          transform: `scale(${iconScale})`,
          transition: 'transform 0.18s var(--ease-out)',
        }}
        tabIndex={0}
        aria-label="Abrir AdrBOT (Siri)"
      >
        {/* Siri Icon Container with Apple Intelligence Halo */}
        <div className="relative flex items-center justify-center w-14 h-14">
          {/* Subtle Ambient Chromatic Halo */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-300"
            style={{
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(59, 130, 246, 0.2) 50%, transparent 70%)',
              filter: 'blur(8px)',
              transform: isHovered ? 'scale(1.2)' : 'scale(0.9)',
              opacity: isHovered || isOpen ? 1 : 0.4,
            }}
          />

          <img
            src="/icons/siri.webp"
            alt="AdrBOT"
            className="w-14 h-14 object-contain relative z-10 transition-transform duration-200 pointer-events-none"
            style={{
              filter: isHovered || isOpen
                ? 'drop-shadow(0 4px 14px rgba(168, 85, 247, 0.6))'
                : 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))',
            }}
          />
        </div>

        {/* macOS Finder-style Label */}
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
          AdrBOT
        </span>

        {/* Running indicator dot if open */}
        {isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-1.5 h-1.5 rounded-full -mt-0.5"
            style={{ backgroundColor: 'var(--os-violet)', boxShadow: '0 0 6px var(--os-violet)' }}
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
            {lang === 'es' ? 'Asistente IA' : 'AI Assistant'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
