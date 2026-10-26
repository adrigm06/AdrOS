import { useState } from 'react';
import DockIcon from './DockIcon';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import type { WindowState } from '@/hooks/useWindowManager';
import type { Lang } from '@/hooks/useLanguage';

interface TaskbarProps {
  lang: Lang;
  toggleLang?: () => void;
  viewMode: 'icons' | 'list';
  onToggleView: () => void;
  minimizedWindows: WindowState[];
  onRestoreWindow: (id: string) => void;
  onOpenProfile: () => void;
  onOpenContact?: () => void;
  onOpenChat?: () => void;
  onOpenSafari?: () => void;
  onOpenTerminal?: () => void;
  onOpenWallpaperPicker?: () => void;
  openWindows?: WindowState[];
}

export default function Taskbar({
  lang,
  viewMode,
  onToggleView,
  minimizedWindows,
  onRestoreWindow,
  onOpenProfile,
  onOpenContact,
  onOpenChat,
  onOpenSafari,
  onOpenTerminal,
  onOpenWallpaperPicker,
  openWindows = [],
}: TaskbarProps) {
  const mouseX = useMotionValue(Infinity);
  const [bouncingApp, setBouncingApp] = useState<string | null>(null);

  const triggerBounce = (name: string, callback?: () => void) => {
    setBouncingApp(name);
    setTimeout(() => {
      setBouncingApp(null);
      callback?.();
    }, 180);
  };

  const isProfileOpen = openWindows.some((w) => w.type === 'profile' && w.isOpen && !w.isMinimized);
  const isChatOpen = openWindows.some((w) => w.type === 'chat' && w.isOpen && !w.isMinimized);
  const isContactOpen = openWindows.some((w) => w.type === 'contact' && w.isOpen && !w.isMinimized);
  const isSafariOpen = openWindows.some((w) => w.type === 'safari' && w.isOpen && !w.isMinimized);
  const isTerminalOpen = openWindows.some((w) => w.type === 'terminal' && w.isOpen && !w.isMinimized);

  return (
    <div className="fixed bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-[9999] flex items-center justify-center pointer-events-auto max-w-[96vw]">
      {/* ── macOS 3D Frosted Glass Dock Shelf ── */}
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="vibrancy-dock flex items-end gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-[20px] sm:rounded-[22px] overflow-visible"
        style={{
          height: 60,
        }}
      >
        {/* ── 1. Finder (Proyectos / Explorador) ── */}
        <DockIcon
          mouseX={mouseX}
          src="/icons/finder.webp"
          label={lang === 'es' ? 'Finder' : 'Finder'}
          onClick={() => triggerBounce('finder', onToggleView)}
          isOpen={viewMode === 'list'}
          isBouncing={bouncingApp === 'finder'}
        />

        {/* ── 2. AdrBOT ── */}
        <DockIcon
          mouseX={mouseX}
          src="/icons/siri.webp"
          label="AdrBOT"
          onClick={() => triggerBounce('siri', onOpenChat)}
          isOpen={isChatOpen}
          isBouncing={bouncingApp === 'siri'}
        />

        {/* ── 3. Safari ── */}
        <DockIcon
          mouseX={mouseX}
          src="/icons/safari.webp"
          label="Safari"
          onClick={() => triggerBounce('safari', onOpenSafari)}
          isOpen={isSafariOpen}
          isBouncing={bouncingApp === 'safari'}
        />

        {/* ── 4. Notas / TextEdit (Perfil) ── */}
        <DockIcon mouseX={mouseX} src="/icons/terminal.webp" label="Terminal"
          onClick={() => triggerBounce('terminal', onOpenTerminal)} isOpen={isTerminalOpen} isBouncing={bouncingApp === 'terminal'} />
        <DockIcon
          mouseX={mouseX}
          src="/icons/notes.webp"
          label={lang === 'es' ? 'Notas — Perfil' : 'Notes — Profile'}
          onClick={() => triggerBounce('notes', onOpenProfile)}
          isOpen={isProfileOpen}
          isBouncing={bouncingApp === 'notes'}
        />

        {/* ── 5. Mail (Contacto) ── */}
        <DockIcon
          mouseX={mouseX}
          src="/icons/mail.webp"
          label={lang === 'es' ? 'Mail — Contacto' : 'Mail — Contact'}
          onClick={() => triggerBounce('mail', onOpenContact)}
          isOpen={isContactOpen}
          isBouncing={bouncingApp === 'mail'}
        />

        {/* ── 6. Ajustes del Sistema (Fondos) ── */}
        <DockIcon
          mouseX={mouseX}
          src="/icons/settings.webp"
          label={lang === 'es' ? 'Ajustes del Sistema' : 'System Settings'}
          onClick={() => triggerBounce('settings', onOpenWallpaperPicker)}
          isBouncing={bouncingApp === 'settings'}
        />

        {/* ── Separator (If minimized windows exist) ── */}
        {minimizedWindows.length > 0 && (
          <div className="w-[1px] h-8 mx-1 bg-white/20 rounded-full self-center" />
        )}

        {/* ── Minimized Windows Section ── */}
        <AnimatePresence>
          {minimizedWindows.map((win) => (
            <motion.div
              key={win.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <DockIcon
                mouseX={mouseX}
                src="/icons/folder.webp"
                label={win.title}
                onClick={() => onRestoreWindow(win.id)}
                isOpen={false}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
