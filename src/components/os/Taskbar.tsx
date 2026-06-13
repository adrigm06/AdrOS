import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WindowState } from '@/hooks/useWindowManager';
import type { Lang } from '@/hooks/useLanguage';

interface TaskbarProps {
  lang: Lang;
  toggleLang: () => void;
  viewMode: 'icons' | 'list';
  onToggleView: () => void;
  minimizedWindows: WindowState[];
  onRestoreWindow: (id: string) => void;
  onOpenProfile: () => void;
}

/**
 * macOS Sonoma Dock
 * Glass pill centered at bottom with app icons + system widgets
 */
export default function Taskbar({
  lang,
  toggleLang,
  viewMode,
  onToggleView,
  minimizedWindows,
  onRestoreWindow,
  onOpenProfile,
}: TaskbarProps) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [showEaster, setShowEaster] = useState(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTime(`${h}:${m}`);

      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      setDate(`${day}/${month}`);
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAdrOSClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (clickTimer.current) clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => setClickCount(0), 3000);
    if (newCount >= 5) {
      setShowEaster(true);
      setClickCount(0);
      setTimeout(() => setShowEaster(false), 4000);
    }
  };

  const openAppCount = minimizedWindows.length;

  return (
    <>
      {/* ── macOS DOCK ── */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9999] flex items-center justify-center">
        <div
          className="glass-dock flex items-center gap-1 px-2 py-2"
          style={{ borderRadius: 'var(--radius-xl)', height: 58 }}
        >
          {/* Profile / Finder icon */}
          <DockItem
            onClick={onOpenProfile}
            label="Adrián"
            isActive={false}
          >
            <div className="w-9 h-9 rounded-[var(--radius-md)] overflow-hidden ring-1 ring-white/10">
              <img
                src="/avatar.webp"
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </DockItem>

          {/* View Toggle (Finder-like icon) */}
          <DockItem
            onClick={onToggleView}
            label={viewMode === 'icons' ? 'List' : 'Grid'}
            isActive={false}
          >
            <div
              className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center"
              style={{ backgroundColor: 'var(--os-surface-2)' }}
            >
              {viewMode === 'icons' ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" style={{ color: 'var(--os-muted)' }}>
                  <rect x="1" y="1" width="6" height="6" rx="1.5" />
                  <rect x="11" y="1" width="6" height="6" rx="1.5" />
                  <rect x="1" y="11" width="6" height="6" rx="1.5" />
                  <rect x="11" y="11" width="6" height="6" rx="1.5" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" style={{ color: 'var(--os-muted)' }}>
                  <rect x="1" y="1" width="16" height="4" rx="1.5" />
                  <rect x="1" y="7" width="16" height="4" rx="1.5" />
                  <rect x="1" y="13" width="16" height="4" rx="1.5" />
                </svg>
              )}
            </div>
          </DockItem>

          {/* AdrOS logo in center */}
          <div className="px-2">
            <button
              type="button"
              onClick={handleAdrOSClick}
              className="font-mono text-[11px] tracking-[0.12em] transition-all duration-200"
              style={{ color: 'var(--os-muted)' }}
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] transition-colors duration-150 hover:bg-white/5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--os-accent)' }}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <path d="M2 12h20" />
                </svg>
              </div>
            </button>
          </div>

          {/* Minimized windows (open apps) */}
          <AnimatePresence>
            {minimizedWindows.map((w, idx) => (
              <motion.button
                key={w.id}
                type="button"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onRestoreWindow(w.id)}
                className="dock-icon flex flex-col items-center justify-center gap-0.5 relative"
                style={{ width: 36, height: 36 }}
                title={w.title}
              >
                <div
                  className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center text-[10px] font-mono truncate px-1"
                  style={{
                    backgroundColor: 'var(--os-surface-2)',
                    border: '1px solid var(--os-border-light)',
                    color: 'var(--os-muted)',
                  }}
                >
                  {w.title.slice(0, 3)}
                </div>
                {/* Active indicator */}
                <div
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                  style={{ backgroundColor: 'var(--os-accent)' }}
                />
              </motion.button>
            ))}
          </AnimatePresence>

          {/* Separator */}
          {openAppCount > 0 && (
            <div className="w-px h-6 mx-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
          )}

          {/* Trash / System area — clock + lang */}
          <DockItem onClick={toggleLang} label={lang.toUpperCase()} isActive={false}>
            <div
              className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center font-mono text-[10px] font-bold tracking-wider"
              style={{
                backgroundColor: 'var(--os-surface-2)',
                color: 'var(--os-muted)',
                border: '1px solid var(--os-border-light)',
              }}
            >
              {lang === 'es' ? 'ES' : 'EN'}
            </div>
          </DockItem>

          {/* Clock */}
          <div className="flex flex-col items-center justify-center px-1">
            <span
              className="font-mono text-[10px] leading-tight"
              style={{ color: 'var(--os-muted)' }}
            >
              {time}
            </span>
            <span
              className="font-mono text-[8px] leading-tight"
              style={{ color: 'var(--os-muted-light, #8b95a5)' }}
            >
              {date}
            </span>
          </div>
        </div>
      </div>

      {/* Easter egg notification */}
      <AnimatePresence>
        {showEaster && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-[68px] left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 font-mono text-xs glass-strong"
            style={{ borderRadius: 'var(--radius-md)', color: 'var(--os-accent)' }}
          >
            ✦ Nice try. Nothing here... yet.
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Dock Item ── */
function DockItem({
  children,
  onClick,
  label,
  isActive,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  isActive: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="dock-icon flex flex-col items-center justify-center relative"
      style={{ width: 36, height: 36 }}
      title={label}
    >
      {children}
      {/* Active indicator */}
      {isActive && (
        <div
          className="absolute -bottom-0.5 w-1 h-1 rounded-full"
          style={{ backgroundColor: 'var(--os-accent)' }}
        />
      )}
      {/* Dock label tooltip (macOS style) */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 font-mono text-[10px] pointer-events-none"
            style={{
              backgroundColor: 'rgba(30, 32, 42, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--os-text)',
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
