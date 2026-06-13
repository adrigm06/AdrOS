import { motion } from 'framer-motion';
import { useDrag } from '@/hooks/useDrag';
import type { WindowState } from '@/hooks/useWindowManager';

interface WindowProps {
  window: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onBringToFront: (id: string) => void;
  onUpdatePosition: (id: string, pos: { x: number; y: number }) => void;
  isMobile?: boolean;
  accentColor?: string;
  children: React.ReactNode;
}

const TRAFFIC = {
  close: '#ff5f57',
  minimize: '#febc2e',
  maximize: '#28c840',
} as const;

export default function Window({
  window: win,
  onClose,
  onMinimize,
  onMaximize,
  onBringToFront,
  onUpdatePosition,
  isMobile,
  accentColor,
  children,
}: WindowProps) {
  const { dragRef, position, isDragging, handleMouseDown, handleTouchStart } = useDrag({
    initialPosition: win.position,
    onDragEnd: (pos) => onUpdatePosition(win.id, pos),
    disabled: win.isMaximized || isMobile,
  });

  const isMaximized = win.isMaximized;
  const accent = accentColor || 'var(--os-accent)';

  const winStyle: React.CSSProperties = isMobile || isMaximized
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
        cursor: isDragging ? 'grabbing' : 'default',
      };

  const isFullScreen = isMobile || isMaximized;

  return (
    <motion.div
      ref={dragRef}
      initial={{ opacity: 0, scale: 0.93, y: 12 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        width: isFullScreen ? '100vw' : win.size.width,
        height: isFullScreen ? '100dvh' : win.size.height,
        top: isFullScreen ? 0 : position.y,
        left: isFullScreen ? 0 : position.x,
      }}
      exit={{ opacity: 0, scale: 0.88, y: 16 }}
      transition={{
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1],
        width: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
        height: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
        top: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
        left: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
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
      {/* ── macOS Titlebar with glass ── */}
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
          <MacOSTrafficLight color={TRAFFIC.close} label="Cerrar" onClick={() => onClose(win.id)} icon="×" />
          <MacOSTrafficLight color={TRAFFIC.minimize} label="Minimizar" onClick={() => onMinimize(win.id)} icon="−" />
          <MacOSTrafficLight color={TRAFFIC.maximize} label="Maximizar" onClick={() => onMaximize(win.id)} icon="⤢" />
        </div>

        {/* Title — centered */}
        <div className="flex-1 flex items-center justify-center min-w-0 mr-[52px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ backgroundColor: accent }} />
            <span
              className="text-[11px] font-mono truncate"
              style={{ color: 'var(--os-muted)' }}
            >
              {win.title}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ backgroundColor: 'var(--os-bg)' }}
      >
        {children}
      </div>

      {/* Resize handle */}
      {!isFullScreen && (
        <div
          className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
          style={{
            borderRight: '2px solid rgba(255,255,255,0.08)',
            borderBottom: '2px solid rgba(255,255,255,0.08)',
            borderBottomRightRadius: 'var(--radius-sm)',
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
      <span
        className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity leading-none font-bold"
        style={{ color: 'rgba(0,0,0,0.45)' }}
      >
        {icon}
      </span>
    </button>
  );
}
