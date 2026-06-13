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

/**
 * macOS-style traffic light colors
 */
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
        height: 'calc(100vh - var(--taskbar-h))',
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

  return (
    <motion.div
      ref={dragRef}
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        width: isMaximized ? '100vw' : win.size.width,
        height: isMaximized ? 'calc(100vh - var(--taskbar-h))' : win.size.height,
        top: isMaximized ? 0 : position.y,
        left: isMaximized ? 0 : position.x,
      }}
      exit={{ opacity: 0, scale: 0.88, y: 12 }}
      transition={{
        duration: 0.18,
        ease: [0.16, 1, 0.3, 1],
        width: { duration: 0.2 },
        height: { duration: 0.2 },
        top: { duration: 0.2 },
        left: { duration: 0.2 },
      }}
      style={{
        ...winStyle,
        backgroundColor: 'var(--os-surface)',
        border: '1px solid var(--os-border)',
        borderRadius: isMaximized ? 0 : 'var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-sm)',
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
          backgroundColor: 'var(--os-surface-2)',
          borderBottom: '1px solid var(--os-border)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Traffic lights — macOS exact */}
        <div className="flex items-center gap-[8px] flex-shrink-0">
          <MacOSTrafficLight color={TRAFFIC.close} label="Cerrar" onClick={() => onClose(win.id)} icon="×" />
          <MacOSTrafficLight color={TRAFFIC.minimize} label="Minimizar" onClick={() => onMinimize(win.id)} icon="−" />
          <MacOSTrafficLight color={TRAFFIC.maximize} label="Maximizar" onClick={() => onMaximize(win.id)} icon="⤢" />
        </div>

        {/* Title — centrado */}
        <div className="flex-1 flex items-center justify-center min-w-0 mr-[52px]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ backgroundColor: accent }} />
            <span
              className="text-xs font-mono truncate"
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

      {/* Resize handle (desktop only) */}
      {!isMobile && !isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize"
          style={{
            borderRight: '2px solid var(--os-border)',
            borderBottom: '2px solid var(--os-border)',
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
      className="flex items-center justify-center transition-all duration-100 group"
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: color,
      }}
      aria-label={label}
    >
      <span
        className="text-[9px] opacity-0 group-hover:opacity-100 transition-opacity leading-none font-bold"
        style={{ color: 'rgba(0,0,0,0.5)', fontWeight: 700 }}
      >
        {icon}
      </span>
    </button>
  );
}
