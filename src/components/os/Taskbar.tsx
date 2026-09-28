import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion, type MotionValue } from 'framer-motion';
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

  return (
    <div className="fixed bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 z-[9999] flex items-center justify-center pointer-events-auto max-w-[96vw]">
      {/* ── macOS 3D Frosted Glass Dock Shelf ── */}
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="vibrancy-dock flex items-end gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-[20px] sm:rounded-[22px] overflow-visible"
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

        {/* ── 2. Siri (AdrBOT) ── */}
        <DockIcon
          mouseX={mouseX}
          src="/icons/siri.webp"
          label="AdrBOT (Siri)"
          onClick={() => triggerBounce('siri', onOpenChat)}
          isOpen={isChatOpen}
          isBouncing={bouncingApp === 'siri'}
        />

        {/* ── 3. Safari (Web / GitHub) ── */}
        <DockIcon
          mouseX={mouseX}
          src="/icons/safari.webp"
          label="Safari — GitHub"
          onClick={() => triggerBounce('safari', () => window.open('https://github.com/adrigm06', '_blank'))}
          isBouncing={bouncingApp === 'safari'}
        />

        {/* ── 4. Notas / TextEdit (Perfil & CV) ── */}
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

/* ── Magnified Dock Item Component ── */

function DockIcon({
  mouseX,
  src,
  label,
  onClick,
  isOpen,
  isBouncing,
}: {
  mouseX: MotionValue<number>;
  src: string;
  label: string;
  onClick: () => void;
  isOpen?: boolean;
  isBouncing?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const shouldReduce = useReducedMotion();

  // Distance from mouse to icon center
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - (bounds.x + bounds.width / 2);
  });

  // Parabolic magnification curve: 48px baseline up to 66px when hovered
  const widthSync = useTransform(distance, [-100, 0, 100], [46, 64, 46]);
  const springWidth = useSpring(widthSync, { mass: 0.1, stiffness: 220, damping: 16 });
  const width = shouldReduce ? 46 : springWidth;

  return (
    <div
      ref={ref}
      className={`relative flex flex-col items-center justify-end ${isHovered ? 'z-30' : 'z-10'}`}
      style={{ transformOrigin: 'bottom' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute -top-10 whitespace-nowrap px-2.5 py-1 rounded-[6px] vibrancy-popover text-[11px] font-sans font-medium text-white shadow-lg pointer-events-none z-[99999]"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive App Button with Spring Width */}
      <motion.button
        type="button"
        onClick={onClick}
        style={{ width, height: width, originY: 1 }}
        animate={isBouncing && !shouldReduce ? { y: [0, -18, 0, -8, 0] } : { y: 0 }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        className="flex items-center justify-center rounded-[12px] p-0.5 outline-none transition-transform active:scale-95"
        aria-label={label}
      >
        <img
          src={src}
          alt={label}
          className="w-full h-full object-contain pointer-events-none"
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35))',
          }}
        />
      </motion.button>

      {/* Running App Indicator Dot */}
      <div className="h-1 flex items-center justify-center mt-0.5">
        {isOpen && (
          <div className="w-1 h-1 rounded-full bg-white/90 shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
        )}
      </div>
    </div>
  );
}
