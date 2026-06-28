import { useState, useRef, useCallback, useEffect } from 'react';
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
  isOpen, onOpen, position, onDragMove, onDragEnd, onDragStateChange, lang
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

  const iconScale = isDragging ? 0.95 : isHovered ? 1.03 : 1;

  return (
    <div
      ref={dragRef}
      className="inline-flex flex-col items-center justify-center"
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
        className="flex flex-col items-center justify-between p-4 outline-none transition-all duration-200"
        style={{
          width: 206, // ocupe aprox 2 celdas de ancho (220 - padding)
          height: 224, // ocupe aprox 2 celdas de alto (236 - padding)
          cursor: position ? 'grab' : 'pointer',
          transform: `scale(${iconScale})`,
          // Glassmorphism premium
          background: 'rgba(20, 22, 30, 0.35)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(0, 212, 170, 0.2)',
          boxShadow: isHovered && !isDragging
            ? '0 8px 32px rgba(0, 212, 170, 0.15), inset 0 0 12px rgba(0, 212, 170, 0.1)'
            : '0 8px 24px rgba(0, 0, 0, 0.3)',
          borderRadius: 24,
        }}
        tabIndex={0}
        aria-label="Abrir AdrBOT"
      >
        {/* Top bar indicators or design detail */}
        <div className="w-full flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="font-mono text-[9px] text-[var(--os-muted)] uppercase tracking-widest font-bold">
            SYS:BOT
          </span>
        </div>

        {/* Centered Robot Image */}
        <div className="relative flex items-center justify-center flex-1 my-2">
          {/* Subtle glowing backdrop pulse */}
          <div
            className="absolute w-24 h-24 rounded-full transition-all duration-500"
            style={{
              background: 'radial-gradient(circle, rgba(0, 212, 170, 0.15) 0%, transparent 70%)',
              transform: isHovered ? 'scale(1.25)' : 'scale(1.0)',
            }}
          />
          <img
            src={isHovered || isOpen ? '/AIHover.webp' : '/AI.webp'}
            alt="Robot AdrBOT"
            width={72}
            height={72}
            className="object-contain relative z-10 transition-transform duration-300"
            style={{
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))',
              transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
            }}
          />
        </div>

        {/* Bottom Label & Info */}
        <div className="w-full text-center flex flex-col gap-0.5 mt-auto">
          <span
            className="font-mono text-xs font-bold transition-colors duration-200"
            style={{
              color: 'var(--os-accent)',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
            }}
          >
            AdrBOT
          </span>
          <span className="font-mono text-[9px] text-[var(--os-muted)]">
            {lang === 'es' ? 'Doble click para chatear' : 'Double click to chat'}
          </span>
        </div>
      </button>
    </div>
  );
}
