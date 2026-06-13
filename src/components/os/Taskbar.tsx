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
 * Glass pill centered at bottom
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

  // Easter egg: 5 clicks on the clock
  const handleClockClick = () => {
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

  const hasWindows = minimizedWindows.length > 0;

  return (
    <>
      {/* ── macOS DOCK ── */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[9999] flex items-center justify-center">
        <div
          className="glass-dock flex items-center gap-1.5 px-3 py-2"
          style={{ borderRadius: 'var(--radius-xl)', height: 60 }}
        >
          {/* ── LEFT: Fixed apps ── */}
          <DockItem onClick={onOpenProfile} label="Adrián">
            <div className="w-9 h-9 rounded-[var(--radius-md)] overflow-hidden ring-1 ring-white/10">
              <img
                src="/avatar.webp"
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </DockItem>

          <DockItem onClick={onToggleView} label={viewMode === 'icons' ? 'List view' : 'Grid view'}>
            <div
              className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center transition-colors duration-150 hover:bg-white/5"
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

          {/* ── Separator (only if there are windows) ── */}
          {hasWindows && <div className="w-px h-7 mx-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }} />}

          {/* ── CENTER: Minimized windows ── */}
          <AnimatePresence>
            {minimizedWindows.map((w, idx) => (
              <motion.button
                key={w.id}
                type="button"
                initial={{ scale: 0, opacity: 0, x: -10 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0, opacity: 0, x: 10 }}
                transition={{ duration: 0.2, delay: idx * 0.04, ease: [0.23, 1, 0.32, 1] }}
                onClick={() => onRestoreWindow(w.id)}
                className="dock-icon flex flex-col items-center justify-center gap-0.5 relative group"
                style={{ width: 44, height: 44 }}
                title={w.title}
              >
                <div
                  className="w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: 'var(--os-surface-2)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <span
                    className="text-[11px] font-mono font-bold tracking-wider"
                    style={{ color: 'var(--os-muted)' }}
                  >
                    {w.title.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                {/* Mini dot indicator */}
                <div
                  className="w-1 h-1 rounded-full absolute -bottom-0.5"
                  style={{ backgroundColor: 'var(--os-muted)' }}
                />
                {/* Tooltip on hover */}
                <span
                  className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none"
                  style={{
                    backgroundColor: 'rgba(22, 24, 34, 0.92)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--os-text)',
                  }}
                >
                  {w.title}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>

          {/* ── RIGHT: System ── */}
          {hasWindows && <div className="w-px h-7 mx-0.5" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }} />}

          <DockItem onClick={toggleLang} label={lang === 'es' ? 'Español' : 'English'}>
            <div
              className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center font-mono text-[10px] font-bold tracking-wider transition-colors duration-150 hover:bg-white/5"
              style={{
                backgroundColor: 'var(--os-surface-2)',
                color: 'var(--os-muted)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {lang === 'es' ? 'ES' : 'EN'}
            </div>
          </DockItem>

          {/* Clock — click 5x for easter egg */}
          <button
            type="button"
            onClick={handleClockClick}
            className="flex flex-col items-center justify-center px-1.5 rounded-[var(--radius-md)] transition-colors duration-150 hover:bg-white/5"
            style={{ height: 36, minWidth: 36 }}
          >
            <span className="font-mono text-[10px] leading-tight" style={{ color: 'var(--os-muted)' }}>
              {time}
            </span>
            <span className="font-mono text-[8px] leading-tight" style={{ color: 'rgba(107,114,128,0.6)' }}>
              {date}
            </span>
          </button>
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
            ✦ Easter egg! Nothing here... yet.
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
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="dock-icon flex items-center justify-center relative"
      style={{ width: 36, height: 36 }}
      title={label}
    >
      {children}
      {/* macOS-style floating label */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.92 }}
            transition={{ duration: 0.12, ease: [0.23, 1, 0.32, 1] }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 font-mono text-[10px] pointer-events-none z-50"
            style={{
              backgroundColor: 'rgba(22, 24, 34, 0.94)',
              backdropFilter: 'blur(12px)',
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
