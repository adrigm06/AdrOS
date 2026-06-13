import { motion, AnimatePresence } from 'framer-motion';
import { ZONE_COLORS, ZONE_LABELS } from '@/data/projects';
import type { ZoneId } from '@/data/projects';
import type { Lang } from '@/hooks/useLanguage';

interface ZoneLegendProps {
  isVisible: boolean;
  lang: Lang;
}

export default function ZoneLegend({ isVisible, lang }: ZoneLegendProps) {
  const zones = Object.keys(ZONE_COLORS) as ZoneId[];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 16 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed right-4 z-30 pointer-events-none hidden md:block"
          style={{
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <div
            className="flex flex-col gap-3 px-3 py-4 rounded-[var(--radius-md)]"
            style={{
              backgroundColor: 'rgba(22, 26, 35, 0.85)',
              border: '1px solid var(--os-border)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {zones.map((zone) => (
              <div key={zone} className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: ZONE_COLORS[zone] }}
                />
                <span
                  className="text-[11px] font-mono whitespace-nowrap"
                  style={{ color: 'var(--os-muted)' }}
                >
                  {ZONE_LABELS[zone][lang]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
