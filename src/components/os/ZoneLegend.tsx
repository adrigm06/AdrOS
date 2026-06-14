import { motion } from 'framer-motion';
import { useState } from 'react';
import { ZONE_COLORS, ZONE_LABELS } from '@/data/projects';
import type { ZoneId } from '@/data/projects';
import type { Lang } from '@/hooks/useLanguage';

interface ZoneLegendProps {
  lang: Lang;
}

export default function ZoneLegend({ lang }: ZoneLegendProps) {
  const zones = Object.keys(ZONE_COLORS) as ZoneId[];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed right-0 z-30 hidden md:flex items-center cursor-pointer select-none"
      style={{
        top: '50%',
        transform: 'translateY(-50%)',
        height: 'auto',
        minHeight: 40,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Content panel — slides in from the right on hover */}
      <motion.div
        animate={{
          width: isHovered ? 140 : 0,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
        className="overflow-hidden rounded-l-[var(--radius-md)]"
        style={{
          backgroundColor: 'rgba(20, 22, 30, 0.85)',
          backdropFilter: 'blur(20px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(20px) saturate(1.3)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex flex-col gap-3 px-3 py-4 whitespace-nowrap">
          {zones.map((zone) => (
            <div key={zone} className="flex items-center gap-2.5">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: ZONE_COLORS[zone],
                  boxShadow: `0 0 6px ${ZONE_COLORS[zone]}66`,
                }}
              />
              <span
                className="text-[11px] font-mono"
                style={{ color: 'var(--os-muted)' }}
              >
                {ZONE_LABELS[zone][lang]}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tab handle — thin vertical bar always visible on the right edge */}
      <div
        className="flex-shrink-0 transition-all duration-200 ease-out"
        style={{
          width: 3,
          height: isHovered ? 64 : 32,
          backgroundColor: isHovered ? 'var(--os-accent)' : 'var(--os-border)',
          borderRadius: '2px',
          opacity: isHovered ? 0.7 : 0.4,
          marginLeft: 2,
        }}
      />
    </div>
  );
}
