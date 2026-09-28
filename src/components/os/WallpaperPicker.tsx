import { motion, AnimatePresence } from 'framer-motion';
import type { Lang } from '@/hooks/useLanguage';

export interface WallpaperPreset {
  id: string;
  name: string;
  nameEs: string;
  image: string;
  thumb: string;
}

export const WALLPAPERS: WallpaperPreset[] = [
  {
    id: 'sequoia-dark',
    name: 'Sequoia Dark',
    nameEs: 'Sequoia Oscuro',
    image: '/wallpapers/sequoia-dark.webp',
    thumb: '/wallpapers/sequoia-dark-thumb.webp',
  },
  {
    id: 'sequoia-light',
    name: 'Sequoia Light',
    nameEs: 'Sequoia Claro',
    image: '/wallpapers/sequoia-light.webp',
    thumb: '/wallpapers/sequoia-light-thumb.webp',
  },
  {
    id: 'sonoma-dark',
    name: 'Sonoma Dark',
    nameEs: 'Sonoma Oscuro',
    image: '/wallpapers/sonoma-dark.webp',
    thumb: '/wallpapers/sonoma-dark-thumb.webp',
  },
  {
    id: 'sonoma-light',
    name: 'Sonoma Light',
    nameEs: 'Sonoma Claro',
    image: '/wallpapers/sonoma-light.webp',
    thumb: '/wallpapers/sonoma-light-thumb.webp',
  },
  {
    id: 'ventura-dark',
    name: 'Ventura Dark',
    nameEs: 'Ventura Oscuro',
    image: '/wallpapers/ventura-dark.webp',
    thumb: '/wallpapers/ventura-dark-thumb.webp',
  },
  {
    id: 'ventura',
    name: 'Ventura Light',
    nameEs: 'Ventura Claro',
    image: '/wallpapers/ventura.webp',
    thumb: '/wallpapers/ventura-thumb.webp',
  },
  {
    id: 'monterey-dark',
    name: 'Monterey Dark',
    nameEs: 'Monterey Oscuro',
    image: '/wallpapers/monterey-dark.webp',
    thumb: '/wallpapers/monterey-dark-thumb.webp',
  },
  {
    id: 'monterey',
    name: 'Monterey Light',
    nameEs: 'Monterey Claro',
    image: '/wallpapers/monterey.webp',
    thumb: '/wallpapers/monterey-thumb.webp',
  },
  {
    id: 'big-sur',
    name: 'Big Sur Graphic',
    nameEs: 'Big Sur Gráfico',
    image: '/wallpapers/big-sur.webp',
    thumb: '/wallpapers/big-sur-thumb.webp',
  },
  {
    id: 'solar-gradient',
    name: 'Solar Gradient',
    nameEs: 'Gradiente Solar',
    image: '/wallpapers/solar-gradient.webp',
    thumb: '/wallpapers/solar-gradient-thumb.webp',
  },
];

interface WallpaperPickerProps {
  isOpen: boolean;
  currentId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  lang?: Lang;
}

export default function WallpaperPicker({ isOpen, currentId, onSelect, onClose, lang }: WallpaperPickerProps) {
  const browserLang = typeof navigator !== 'undefined' && navigator.language.startsWith('es') ? 'es' : 'en';
  const effectiveLang = lang || browserLang;

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
            style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            onClick={onClose}
          />

          {/* Panel style macOS System Settings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="vibrancy-popover rounded-[var(--radius-xl)] p-4 sm:p-5 overflow-hidden w-full max-w-[460px] max-h-[85vh] flex flex-col pointer-events-auto"
              style={{
                boxShadow: 'var(--shadow-window)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <img src="/icons/settings.webp" alt="Settings" className="w-5 h-5 object-contain" />
                  <h3 className="font-sans text-sm font-semibold tracking-tight" style={{ color: 'var(--os-text)' }}>
                    {effectiveLang === 'es' ? 'Fondos de pantalla' : 'Wallpaper Settings'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors cursor-pointer"
                  aria-label={effectiveLang === 'es' ? 'Cerrar' : 'Close'}
                >
                  <svg width="12" height="12" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ color: '#fff' }}>
                    <path d="M1 1L9 9M9 1L1 9" />
                  </svg>
                </button>
              </div>

              {/* Wallpaper grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 overflow-y-auto pr-1 flex-1">
                {WALLPAPERS.map((wp) => {
                  const isSelected = currentId === wp.id;
                  return (
                    <button
                      key={wp.id}
                      type="button"
                      onClick={() => onSelect(wp.id)}
                      className="group relative rounded-[var(--radius-md)] overflow-hidden transition-all duration-150 flex flex-col text-left"
                      style={{
                        outline: isSelected ? '2px solid var(--os-blue)' : '1px solid rgba(255,255,255,0.1)',
                        outlineOffset: isSelected ? 2 : 0,
                      }}
                    >
                      {/* Thumbnail */}
                      <div className="w-full aspect-[16/10] overflow-hidden bg-black/40">
                        <img
                          src={wp.thumb}
                          alt={wp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>

                      {/* Label bar */}
                      <div className="px-2 py-1.5 bg-[rgba(18,20,28,0.85)] flex items-center justify-between">
                        <span className="text-[11px] font-sans font-medium truncate" style={{ color: isSelected ? 'var(--os-blue)' : 'rgba(255,255,255,0.85)' }}>
                          {effectiveLang === 'es' ? wp.nameEs : wp.name}
                        </span>
                        {isSelected && (
                          <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center bg-[var(--os-blue)] flex-shrink-0">
                            <svg width="7" height="7" viewBox="0 0 8 8" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1.5 4L3.5 6L6.5 2" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
