import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ZONE_COLORS, ZONE_LABELS } from '@/data/projects';
import type { ZoneId } from '@/data/projects';
import type { Lang } from '@/hooks/useLanguage';

interface ZoneLegendProps {
  lang: Lang;
}

export default function ZoneLegend({ lang }: ZoneLegendProps) {
  const zones = Object.keys(ZONE_COLORS) as ZoneId[];
  // Empieza abierto inicialmente y se cierra tras una breve pausa para que el usuario lo descubra
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false);
    }, 2800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed right-0 z-30 flex items-center cursor-pointer select-none"
      style={{
        top: '50%',
        transform: 'translateY(-50%)',
        height: 'auto',
        minHeight: 48,
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(h => !h)}
    >
      {/* Content panel — slides in/out from the right */}
      <motion.div
        animate={{
          width: isOpen ? 190 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden rounded-l-[14px] shadow-xl"
        style={{
          backgroundColor: 'rgba(20, 23, 34, 0.88)',
          backdropFilter: 'blur(30px) saturate(180%)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          borderTop: '1px solid rgba(255,255,255,0.12)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          borderLeft: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <div className="flex flex-col gap-3.5 px-4 py-4 whitespace-nowrap">
          <div className="text-[10px] font-sans font-semibold uppercase tracking-wider text-white/40 pb-1 border-b border-white/10">
            {lang === 'es' ? 'Categorías' : 'Categories'}
          </div>
          {zones.map((zone) => (
            <div key={zone} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: ZONE_COLORS[zone],
                  boxShadow: `0 0 8px ${ZONE_COLORS[zone]}88`,
                }}
              />
              <span
                className="text-xs font-sans font-medium text-white/90"
              >
                {ZONE_LABELS[zone][lang]}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tab handle — macOS glass pill handle */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-center gap-1 transition-all duration-200 ease-out shadow-lg"
        style={{
          width: 8,
          height: isOpen ? 100 : 64,
          backgroundColor: isOpen ? 'var(--os-blue)' : 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(20px)',
          borderRadius: '4px 0 0 4px',
          opacity: isOpen ? 1 : 0.75,
          cursor: 'pointer',
        }}
      >
        <div className="w-1 h-1 rounded-full bg-white/70" />
        <div className="w-1 h-1 rounded-full bg-white/70" />
        <div className="w-1 h-1 rounded-full bg-white/70" />
      </div>
    </div>
  );
}
