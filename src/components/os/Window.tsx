import { useRef, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDrag } from '@/hooks/useDrag';
import type { WindowState } from '@/hooks/useWindowManager';
import { WINDOW_MIN } from '@/hooks/useWindowManager';

interface WindowProps {
  window: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onBringToFront: (id: string) => void;
  onUpdatePosition: (id: string, pos: { x: number; y: number }) => void;
  onUpdateSize?: (id: string, size: { width: number; height: number }) => void;
  isMobile?: boolean;
  accentColor?: string;
  children: React.ReactNode;
}

const TRAFFIC = { close: '#ff5f57', minimize: '#febc2e', maximize: '#28c840' } as const;

const DOCK_Y_OFFSET = 70;

export default function Window({
  window: win,
  onClose,
  onMinimize,
  onMaximize,
  onBringToFront,
  onUpdatePosition,
  onUpdateSize,
  isMobile,
  accentColor,
  children,
}: WindowProps) {
  const { dragRef, position, isDragging, handleMouseDown, handleTouchStart } = useDrag({
    initialPosition: win.position,
    onDragEnd: (pos) => onUpdatePosition(win.id, pos),
    disabled: win.isMaximized || (isMobile ?? false),
  });

  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const exitIntentRef = useRef<'minimize' | 'close' | null>(null);
  const isMaximized = win.isMaximized;
  const accent = accentColor || 'var(--os-accent)';
  const isFullScreen = isMobile || isMaximized;

  /* ── Resize ── */
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (isFullScreen) return;
    e.stopPropagation();
    resizeStart.current = { x: e.clientX, y: e.clientY, w: win.size.width, h: win.size.height };
    setIsResizing(true);
  }, [isFullScreen, win.size]);

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const dw = e.clientX - resizeStart.current.x;
      const dh = e.clientY - resizeStart.current.y;
      const newW = Math.max(WINDOW_MIN.width, resizeStart.current.w + dw);
      const newH = Math.max(WINDOW_MIN.height, resizeStart.current.h + dh);
      onUpdateSize?.(win.id, { width: newW, height: newH });
    };
    const onUp = () => setIsResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isResizing, win.id, onUpdateSize]);

  const handleMinimize = () => {
    exitIntentRef.current = 'minimize';
    onMinimize(win.id);
  };

  const handleClose = () => {
    exitIntentRef.current = 'close';
    onClose(win.id);
  };

  const handleMaximize = () => {
    onMaximize(win.id);
  };

  // ── Dock center (genie target) ──
  const dockX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const dockY = typeof window !== 'undefined' ? window.innerHeight - DOCK_Y_OFFSET : 0;
  const winCenterX = position.x + win.size.width / 2;
  const winCenterY = position.y + win.size.height / 2;
  const genieDX = dockX - winCenterX;
  const genieDY = dockY - winCenterY;

  const getExit = () => {
    if (exitIntentRef.current === 'minimize') {
      return { opacity: 0, scale: 0.08, x: genieDX, y: genieDY, filter: 'blur(4px)' };
    }
    if (exitIntentRef.current === 'close') {
      return { opacity: 0, scale: 0.6, rotate: -1.5, filter: 'blur(3px)' };
    }
    return { opacity: 0, scale: 0.88, y: 16 };
  };

  const winStyle: React.CSSProperties = isFullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: win.zIndex,
      }
    : {
        position: 'fixed',
        top: position.y,
        left: position.x,
        width: win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
        cursor: isDragging ? 'grabbing' : (isResizing ? 'se-resize' : 'default'),
      };

  return (
    <motion.div
      ref={dragRef}
      initial={{ opacity: 0, scale: 0.88, y: 20 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
        rotate: 0,
        filter: 'blur(0px)',
        width: isFullScreen ? '100vw' : win.size.width,
        height: isFullScreen ? '100dvh' : win.size.height,
        top: isFullScreen ? 0 : position.y,
        left: isFullScreen ? 0 : position.x,
      }}
      exit={getExit()}
      transition={{
        duration: 0.28,
        ease: [0.16, 1, 0.3, 1],
        width: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
        height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
        top: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
        left: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
      style={{
        ...winStyle,
        backgroundColor: 'var(--os-surface)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: isFullScreen ? 0 : 'var(--radius-lg)',
        boxShadow: 'var(--shadow-window)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
      onClick={() => onBringToFront(win.id)}
      role="dialog"
      aria-label={win.title}
      aria-modal="true"
    >
      {/* macOS Titlebar */}
      <div
        className="flex items-center gap-2 px-3 flex-shrink-0 select-none"
        style={{
          height: 'var(--titlebar-h)',
          backgroundColor: 'rgba(28, 31, 43, 0.85)',
          backdropFilter: 'blur(16px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(16px) saturate(1.2)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          borderTopLeftRadius: isFullScreen ? 0 : 'var(--radius-lg)',
          borderTopRightRadius: isFullScreen ? 0 : 'var(--radius-lg)',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Traffic lights */}
        <div className="flex items-center gap-[8px] flex-shrink-0">
          <MacOSTrafficLight color={TRAFFIC.close} label="Cerrar" onClick={handleClose} icon="×" />
          <MacOSTrafficLight color={TRAFFIC.minimize} label="Minimizar" onClick={handleMinimize} icon="−" />
          <MacOSTrafficLight color={TRAFFIC.maximize} label="Maximizar" onClick={handleMaximize} icon="⤢" />
        </div>

        {/* Title — centered */}
        <div className="flex-1 flex items-center justify-center min-w-0 mr-[52px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ backgroundColor: accent }} />
            <span className="text-[11px] font-mono truncate" style={{ color: 'var(--os-muted)' }}>
              {win.title}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--os-bg)' }}>
        {children}
      </div>

      {/* Resize handle (drag to resize) */}
      {!isFullScreen && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 cursor-se-resize"
          style={{
            width: 20,
            height: 20,
            borderRight: '2px solid rgba(255,255,255,0.1)',
            borderBottom: '2px solid rgba(255,255,255,0.1)',
            borderBottomRightRadius: 'var(--radius-sm)',
            zIndex: 10,
          }}
        />
      )}
    </motion.div>
  );
}

function MacOSTrafficLight({ color, label, onClick, icon }: { color: string; label: string; onClick: () => void; icon: string }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex items-center justify-center group"
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 2px rgba(0,0,0,0.2)',
        transition: 'filter 0.1s ease, transform 0.1s ease',
      }}
      aria-label={label}
    >
      <span className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity leading-none font-bold" style={{ color: 'rgba(0,0,0,0.45)' }}>
        {icon}
      </span>
    </button>
  );
}
