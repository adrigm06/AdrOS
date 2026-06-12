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
  const [glitching, setGlitching] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showEaster, setShowEaster] = useState(false);
  const clickTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTime(`${h}:${m}:${s}`);
      if (h === '00' && m === '00' && s === '00') {
        setGlitching(true);
        setTimeout(() => setGlitching(false), 1000);
      }
    };
    update();
    const interval = setInterval(update, 1000);
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

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 flex items-center px-3 gap-3 z-[9999]"
        style={{
          height: 'var(--taskbar-h)',
          backgroundColor: 'var(--os-surface)',
          borderTop: '1px solid var(--os-border)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* LEFT */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex items-center gap-2 h-full px-2 transition-colors duration-100 hover:bg-[var(--os-surface-2)] flex-shrink-0"
          style={{ borderRadius: 'var(--radius-md)' }}
        >
          <div
            className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0"
            style={{ border: '2px solid var(--os-accent)' }}
          >
            <img
              src="/avatar.webp"
              alt="Foto de perfil"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <span className="hidden sm:inline text-sm" style={{ color: 'var(--os-text)' }}>
            Adrián
          </span>
        </button>

        {/* Minimized windows */}
        {minimizedWindows.length > 0 && (
          <>
            <div className="w-px h-5" style={{ backgroundColor: 'var(--os-border)' }} />
            <AnimatePresence>
              {minimizedWindows.map((w) => (
                <motion.button
                  key={w.id}
                  type="button"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onRestoreWindow(w.id)}
                  className="flex items-center gap-1 px-1.5 py-1 transition-colors duration-100 hover:bg-[var(--os-surface-2)]"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--os-accent-dim)' }} />
                  <span className="text-[11px] max-w-[60px] truncate hidden sm:inline" style={{ color: 'var(--os-muted)' }}>
                    {w.title}
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </>
        )}

        {/* CENTER */}
        <div className="flex-1 text-center">
          <button
            type="button"
            onClick={handleAdrOSClick}
            className="font-mono text-xs tracking-[0.15em] transition-colors duration-100"
            style={{ color: 'var(--os-muted)' }}
          >
            AdrOS
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* View Toggle */}
          <button
            type="button"
            onClick={onToggleView}
            className="p-1 transition-colors duration-100 hover:text-[var(--os-accent)]"
            style={{ color: 'var(--os-muted)' }}
            aria-label={viewMode === 'icons' ? 'Cambiar a vista lista' : 'Cambiar a vista iconos'}
          >
            {viewMode === 'icons' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-label="Vista iconos">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-label="Vista lista">
                <rect x="1" y="1" width="14" height="3" rx="1" />
                <rect x="1" y="6.5" width="14" height="3" rx="1" />
                <rect x="1" y="12" width="14" height="3" rx="1" />
              </svg>
            )}
          </button>

          {/* Clock */}
          <span
            className={`font-mono text-xs ${glitching ? 'glitch' : ''}`}
            style={{ color: 'var(--os-muted)' }}
          >
            {time}
          </span>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLang}
            className="font-mono text-xs px-2 py-1 transition-all duration-200 hover:text-[var(--os-accent)]"
            style={{ color: 'var(--os-muted)' }}
            aria-label={`Cambiar idioma a ${lang === 'es' ? 'inglés' : 'español'}`}
          >
            <motion.span
              key={lang}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
              aria-live="polite"
            >
              {lang === 'es' ? 'ES' : 'EN'}
            </motion.span>
          </button>
        </div>
      </div>

      {/* Easter egg notification */}
      <AnimatePresence>
        {showEaster && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-[56px] right-4 z-[9999] px-4 py-2 font-mono text-xs"
            style={{
              backgroundColor: 'var(--os-surface-2)',
              border: '1px solid var(--os-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--os-accent)',
            }}
          >
            Nice try. There is nothing here... yet.
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
