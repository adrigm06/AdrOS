import { useRef, useCallback, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useDraggable } from '@neodrag/react';
import type { WindowState } from '@/hooks/useWindowManager';
import { WINDOW_MIN } from '@/hooks/useWindowManager';
import { useIsMobile } from '@/hooks/useIsMobile';

import type { Lang } from '@/hooks/useLanguage';

interface WindowProps {
  window: WindowState;
  onClose: (id: string) => void;
  onMinimize?: (id: string) => void;
  onMaximize: (id: string) => void;
  onBringToFront: (id: string) => void;
  onUpdatePosition: (id: string, pos: { x: number; y: number }) => void;
  onUpdateSize?: (id: string, size: { width: number; height: number }) => void;
  isMobile?: boolean;
  accentColor?: string;
  lang?: Lang;
  children: React.ReactNode;
}

const TRAFFIC = { close: '#ff5f56', minimize: '#ffbd2e', maximize: '#27c93f' } as const;
const DOCK_Y_OFFSET = 70;

export default function Window({
  window: win,
  onClose,
  onMaximize,
  onBringToFront,
  onUpdatePosition,
  onUpdateSize,
  isMobile: isMobileProp,
  accentColor,
  lang = 'es',
  children,
}: WindowProps) {
  const detectedMobile = useIsMobile();
  const isMobile = isMobileProp !== undefined ? isMobileProp : detectedMobile;
  const isMaximized = win.isMaximized;
  const isFullScreen = isMaximized || isMobile;
  const dragRef = useRef<HTMLDivElement>(null);

  const [isResizing, setIsResizing] = useState(false);
  const [trafficHovered, setTrafficHovered] = useState(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const exitIntentRef = useRef<'minimize' | 'close' | null>(null);

  // Smooth Neodrag draggable hook
  useDraggable(dragRef as unknown as React.RefObject<HTMLDivElement>, {
    handle: '.mac-titlebar',
    cancel: 'button, input, textarea, a',
    disabled: isFullScreen,
    position: isFullScreen ? { x: 0, y: 0 } : win.position,
    onDragEnd: (data) => {
      onUpdatePosition(win.id, { x: data.offsetX, y: data.offsetY });
    },
  });

  // When switching between fullscreen / windowed, ensure Neodrag's transform is cleared or synced
  useEffect(() => {
    if (isFullScreen && dragRef.current) {
      dragRef.current.style.transform = 'translate3d(0px, 0px, 0px)';
    }
  }, [isFullScreen]);

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
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isResizing, win.id, onUpdateSize]);

  const handleClose = () => {
    exitIntentRef.current = 'close';
    onClose(win.id);
  };

  const handleMaximize = () => {
    onMaximize(win.id);
  };

  // ── Dock center (genie effect target) ──
  const dockX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  const dockY = typeof window !== 'undefined' ? window.innerHeight - DOCK_Y_OFFSET : 0;
  const winCenterX = win.position.x + win.size.width / 2;
  const winCenterY = win.position.y + win.size.height / 2;
  const genieDX = dockX - winCenterX;
  const genieDY = dockY - winCenterY;

  const shouldReduce = useReducedMotion();

  const getExit = () => {
    if (shouldReduce) {
      return { opacity: 0 };
    }
    if (exitIntentRef.current === 'minimize') {
      return { opacity: 0, scale: 0.08, x: genieDX, y: genieDY, filter: 'blur(4px)' };
    }
    if (exitIntentRef.current === 'close') {
      return { opacity: 0, scale: 0.85, filter: 'blur(3px)' };
    }
    return { opacity: 0, scale: 0.9, y: 16 };
  };

  const fullScreenHeight = isMobile
    ? 'calc(100dvh - var(--menubar-h) - 62px)'
    : 'calc(100dvh - var(--menubar-h))';

  const winStyle: React.CSSProperties = isFullScreen
    ? {
        position: 'fixed',
        top: 'var(--menubar-h)',
        left: 0,
        right: 0,
        width: '100vw',
        height: fullScreenHeight,
        zIndex: win.zIndex,
        borderRadius: 0,
      }
    : {
        position: 'fixed',
        top: 0,
        left: 0,
        width: win.size.width,
        height: win.size.height,
        zIndex: win.zIndex,
      };

  return (
    <motion.div
      ref={dragRef}
      initial={shouldReduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 16 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
        width: isFullScreen ? '100vw' : win.size.width,
        height: isFullScreen ? fullScreenHeight : win.size.height,
        top: isFullScreen ? 'var(--menubar-h)' : undefined,
        left: isFullScreen ? 0 : undefined,
      }}
      exit={getExit()}
      transition={shouldReduce ? { duration: 0.05 } : {
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        ...winStyle,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isFullScreen ? 'none' : 'var(--shadow-window)',
        borderRadius: isFullScreen ? 0 : 'var(--radius-xl)',
        overflow: 'hidden',
        borderTopColor: accentColor ? `${accentColor}55` : undefined,
      }}
      className="vibrancy-window select-none border border-white/10"
      onClick={() => onBringToFront(win.id)}
      role="dialog"
      aria-label={win.title}
      aria-modal="true"
    >
      {/* ── macOS Unified Titlebar ── */}
      <div
        className="mac-titlebar flex items-center justify-between px-3.5 flex-shrink-0 select-none border-b border-white/5 cursor-default relative z-20"
        style={{
          height: 'var(--titlebar-h)',
          backgroundColor: 'rgba(25, 28, 40, 0.75)',
        }}
        onDoubleClick={!isMobile ? handleMaximize : undefined}
      >
        {/* Window Controls: Only close button */}
        <div
          className="flex items-center gap-2 flex-shrink-0 py-1"
          onMouseEnter={() => setTrafficHovered(true)}
          onMouseLeave={() => setTrafficHovered(false)}
        >
          <MacOSTrafficLight
            color={TRAFFIC.close}
            label={lang === 'es' ? 'Cerrar' : 'Close'}
            onClick={handleClose}
            icon="×"
            showIcon={isMobile || trafficHovered}
          />
        </div>

        {/* Title — centered */}
        <div className="flex-1 flex items-center justify-center min-w-0 px-2 sm:px-4">
          <span className="font-sans text-[12px] sm:text-[13px] font-medium text-white/90 truncate tracking-tight">
            {win.title}
          </span>
        </div>

        {/* Spacer on right to balance traffic light on left */}
        <div className="w-[15px] sm:w-[20px] flex items-center justify-end flex-shrink-0" />
      </div>

      {/* ── Content View ── */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[rgba(16,18,26,0.75)]">
        {children}
      </div>

      {/* ── Resize Handle (bottom-right) ── */}
      {!isFullScreen && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20"
        />
      )}
    </motion.div>
  );
}

function MacOSTrafficLight({
  color,
  label,
  onClick,
  icon,
  showIcon,
}: {
  color: string;
  label: string;
  onClick: () => void;
  icon: string;
  showIcon: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClick();
      }}
      className="flex items-center justify-center rounded-full relative group transition-transform active:scale-90 cursor-pointer"
      style={{
        width: 15,
        height: 15,
        backgroundColor: color,
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.3), 0 1px 2px rgba(0,0,0,0.3)',
      }}
      aria-label={label}
    >
      <span
        className={`text-[9px] font-bold leading-none select-none transition-opacity duration-100 ${
          showIcon ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ color: 'rgba(0, 0, 0, 0.65)' }}
      >
        {icon}
      </span>
    </button>
  );
}
