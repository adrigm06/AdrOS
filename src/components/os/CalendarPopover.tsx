import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  /** Ref del elemento que abre el calendario para posicionarlo */
  anchorEl: HTMLElement | null;
}

const WEEKDAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const WEEKDAYS_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const LANG = typeof navigator !== 'undefined' && navigator.language.startsWith('es') ? 'es' : 'en';

export default function CalendarPopover({ isOpen, onClose, anchorEl }: CalendarPopoverProps) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const popoverRef = useRef<HTMLDivElement>(null);

  const goPrevMonth = useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 0) {
        if (viewYear > today.getFullYear()) return prev; // no ir más allá
        setViewYear((y) => Math.max(y - 1, today.getFullYear()));
        return 11;
      }
      return prev - 1;
    });
  }, [viewYear, today]);

  const goNextMonth = useCallback(() => {
    setViewMonth((prev) => {
      if (prev === 11) {
        if (viewYear < today.getFullYear()) return prev;
        setViewYear((y) => Math.min(y + 1, today.getFullYear()));
        return 0;
      }
      return prev + 1;
    });
  }, [viewYear, today]);

  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > 0);
  const canGoNext = viewYear < today.getFullYear() || (viewYear === today.getFullYear() && viewMonth < 11);

  // Calcular días del mes
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const weeks: (number | null)[][] = [];
  let day = 1;
  for (let w = 0; w < 6; w++) {
    const week: (number | null)[] = [];
    for (let d = 0; d < 7; d++) {
      if ((w === 0 && d < firstDayOfWeek) || day > daysInMonth) {
        week.push(null);
      } else {
        week.push(day);
        day++;
      }
    }
    weeks.push(week);
    if (day > daysInMonth) break;
  }

  // Click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
          anchorEl && !anchorEl.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    // Delay to avoid immediate close from the click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleEsc);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose, anchorEl]);

  const months = LANG === 'es' ? MONTHS : MONTHS_EN;
  const weekdays = LANG === 'es' ? WEEKDAYS : WEEKDAYS_EN;
  const isToday = (d: number) =>
    d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="fixed z-[99999]"
          style={{
            bottom: anchorEl ? anchorEl.getBoundingClientRect().height + 12 : 70,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 260,
          }}
        >
          <div
            className="rounded-[var(--radius-lg)] overflow-hidden"
            style={{
              backgroundColor: 'rgba(22, 24, 34, 0.94)',
              backdropFilter: 'blur(28px) saturate(1.4)',
              WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <button
                type="button"
                onClick={goPrevMonth}
                disabled={!canGoPrev}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-150 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
                aria-label="Mes anterior"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--os-text)' }}>
                  <path d="M7 10L3 6L7 2" />
                </svg>
              </button>

              <span className="font-sans text-[13px] font-semibold" style={{ color: 'var(--os-text)' }}>
                {months[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onClick={goNextMonth}
                disabled={!canGoNext}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-150 hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
                aria-label="Mes siguiente"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--os-text)' }}>
                  <path d="M5 2L9 6L5 10" />
                </svg>
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 px-3 pb-1">
              {weekdays.map((wd, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] font-mono py-1"
                  style={{ color: 'var(--os-muted)' }}
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="px-3 pb-3 space-y-0.5">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7">
                  {week.map((d, di) => (
                    <div key={di} className="flex items-center justify-center">
                      {d !== null ? (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-sans transition-colors duration-100"
                          style={{
                            backgroundColor: isToday(d) ? 'var(--os-accent)' : 'transparent',
                            color: isToday(d) ? '#000' : 'var(--os-text)',
                            fontWeight: isToday(d) ? 600 : 400,
                          }}
                        >
                          {d}
                        </div>
                      ) : (
                        <div className="w-8 h-8" />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
