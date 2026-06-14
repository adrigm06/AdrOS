import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  separator?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

export default function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    // Delay to avoid immediate close from the right-click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleEsc);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Ajustar posición para que no se salga de la pantalla
  const adjustedPos = { ...position };
  if (typeof window !== 'undefined') {
    const menuWidth = 180;
    const menuHeight = items.length * 32;
    if (adjustedPos.x + menuWidth > window.innerWidth - 16) {
      adjustedPos.x = window.innerWidth - menuWidth - 16;
    }
    if (adjustedPos.y + menuHeight > window.innerHeight - 16) {
      adjustedPos.y = window.innerHeight - menuHeight - 16;
    }
    adjustedPos.x = Math.max(8, adjustedPos.x);
    adjustedPos.y = Math.max(8, adjustedPos.y);
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.92, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -4 }}
        transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
        className="fixed z-[99999] py-1"
        style={{
          left: adjustedPos.x,
          top: adjustedPos.y,
          minWidth: 160,
          backgroundColor: 'rgba(28, 30, 40, 0.94)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}
      >
        {items.map((item, i) =>
          item.separator ? (
            <div
              key={`sep-${i}`}
              className="mx-2 my-1"
              style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }}
            />
          ) : (
            <button
              key={i}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                onClose();
                item.onClick();
              }}
              className="w-full text-left px-3 py-1.5 font-sans text-[13px] transition-colors duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                color: item.disabled ? 'var(--os-muted)' : 'var(--os-text)',
              }}
              onMouseEnter={(e) => {
                if (!item.disabled) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {item.label}
            </button>
          )
        )}
      </motion.div>
    </AnimatePresence>
  );
}
