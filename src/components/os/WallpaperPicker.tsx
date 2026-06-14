import { motion, AnimatePresence } from 'framer-motion';

export interface WallpaperPreset {
  id: string;
  name: string;
  nameEs: string;
  css: string;
}

export const WALLPAPERS: WallpaperPreset[] = [
  {
    id: 'sonoma',
    name: 'Sonoma',
    nameEs: 'Sonoma',
    css: `
      radial-gradient(ellipse at 20% 15%, rgba(180, 130, 255, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(96, 165, 250, 0.12) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 90%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 10% 60%, rgba(0, 212, 170, 0.07) 0%, transparent 40%),
      radial-gradient(ellipse at 90% 70%, rgba(167, 139, 250, 0.06) 0%, transparent 40%),
      radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.02) 0%, transparent 60%),
      radial-gradient(ellipse at 0% 50%, rgba(96, 165, 250, 0.04) 0%, transparent 30%),
      radial-gradient(ellipse at 100% 50%, rgba(167, 139, 250, 0.04) 0%, transparent 30%),
      #080a10
    `,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    nameEs: 'Medianoche',
    css: `
      radial-gradient(ellipse at 30% 20%, rgba(20, 30, 80, 0.4) 0%, transparent 55%),
      radial-gradient(ellipse at 70% 80%, rgba(10, 50, 100, 0.3) 0%, transparent 55%),
      radial-gradient(ellipse at 50% 50%, rgba(30, 40, 60, 0.2) 0%, transparent 60%),
      radial-gradient(ellipse at 0% 100%, rgba(0, 50, 100, 0.15) 0%, transparent 40%),
      #05080f
    `,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    nameEs: 'Aurora',
    css: `
      radial-gradient(ellipse at 15% 50%, rgba(88, 130, 193, 0.2) 0%, transparent 50%),
      radial-gradient(ellipse at 85% 30%, rgba(193, 88, 130, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 80%, rgba(130, 88, 193, 0.12) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 20%, rgba(88, 193, 130, 0.08) 0%, transparent 50%),
      #080810
    `,
  },
  {
    id: 'sunset',
    name: 'Sunset',
    nameEs: 'Atardecer',
    css: `
      radial-gradient(ellipse at 25% 25%, rgba(255, 120, 80, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 75% 20%, rgba(255, 80, 120, 0.12) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 85%, rgba(200, 100, 50, 0.1) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 40%, rgba(255, 200, 100, 0.04) 0%, transparent 50%),
      #0c0808
    `,
  },
  {
    id: 'deepblue',
    name: 'Deep Blue',
    nameEs: 'Azul Profundo',
    css: `
      radial-gradient(ellipse at 20% 30%, rgba(30, 100, 200, 0.2) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 60%, rgba(20, 60, 150, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 20%, rgba(50, 150, 255, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 30% 80%, rgba(10, 40, 100, 0.1) 0%, transparent 50%),
      #060a14
    `,
  },
];

interface WallpaperPickerProps {
  isOpen: boolean;
  currentId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function WallpaperPicker({ isOpen, currentId, onSelect, onClose }: WallpaperPickerProps) {
  const LANG = typeof navigator !== 'undefined' && navigator.language.startsWith('es') ? 'es' : 'en';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[99998]"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="fixed z-[99999]"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 320,
            }}
          >
            <div
              className="rounded-[var(--radius-lg)] p-4"
              style={{
                backgroundColor: 'rgba(22, 24, 34, 0.94)',
                backdropFilter: 'blur(28px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-sans text-sm font-semibold" style={{ color: 'var(--os-text)' }}>
                  {LANG === 'es' ? 'Fondo de pantalla' : 'Wallpaper'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--os-muted)' }}>
                    <path d="M1 1L9 9M9 1L1 9" />
                  </svg>
                </button>
              </div>

              {/* Wallpaper grid */}
              <div className="grid grid-cols-2 gap-3">
                {WALLPAPERS.map((wp) => (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => onSelect(wp.id)}
                    className="group relative rounded-[var(--radius-md)] overflow-hidden transition-all duration-150"
                    style={{
                      aspectRatio: '16/10',
                      outline: currentId === wp.id ? `2px solid var(--os-accent)` : '1px solid rgba(255,255,255,0.06)',
                      outlineOffset: currentId === wp.id ? -2 : -1,
                    }}
                  >
                    {/* Preview */}
                    <div
                      className="w-full h-full"
                      style={{ background: wp.css }}
                    />
                    {/* Label */}
                    <div
                      className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                      style={{
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                      }}
                    >
                      <span className="font-mono text-[10px]" style={{ color: 'rgba(255,255,255,0.9)' }}>
                        {LANG === 'es' ? wp.nameEs : wp.name}
                      </span>
                    </div>
                    {/* Checkmark */}
                    {currentId === wp.id && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--os-accent)' }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1.5 4L3.5 6L6.5 2" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
