import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootLine {
  text: string;
  delay: number;
}

const BOOT_LINES: BootLine[] = [
  { text: '', delay: 0 },
  { text: 'AdrOS v1.0.0', delay: 200 },
  { text: 'Copyright © 2026 Adrián García M.', delay: 600 },
  { text: '', delay: 1000 },
  { text: 'Initializing file system...', delay: 1100 },
  { text: 'Loading projects... [████████░░] 82%', delay: 1400 },
  { text: 'Loading projects... [██████████] 100%', delay: 1600 },
  { text: 'All systems nominal.', delay: 1900 },
  { text: '', delay: 2100 },
  { text: 'Welcome, visitor. Enjoy the tour.', delay: 2200 },
];

interface BootScreenProps {
  onComplete: () => void;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [skipped, setSkipped] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  const skipBoot = useCallback(() => {
    if (!skipped) {
      setSkipped(true);
      setVisibleLines(BOOT_LINES.length);
      setFadingOut(true);
      setTimeout(() => onComplete(), 300);
    }
  }, [skipped, onComplete]);

  useEffect(() => {
    if (skipped) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      if (i === 0) {
        // Cursor starts visible immediately
        setVisibleLines(1);
      }
      const timer = setTimeout(() => {
        setVisibleLines(i + 1);
        // Start fadeout at TOTAL_DURATION
        if (i === BOOT_LINES.length - 1) {
          setTimeout(() => {
            setFadingOut(true);
            setTimeout(() => onComplete(), 300);
          }, 300);
        }
      }, line.delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [skipped, onComplete]);

  // Key handler for skip
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        skipBoot();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [skipBoot]);

  return (
    <AnimatePresence>
      {!fadingOut ? (
        <motion.div
          key="boot"
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backgroundColor: '#000', fontFamily: 'var(--font-mono)' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          onClick={skipBoot}
        >
          <div className="flex flex-col gap-0" style={{ maxWidth: 520, width: '90%' }}>
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.p
                key={`boot-line-${i}`}
                className="text-sm whitespace-pre"
                style={{ color: 'var(--os-accent)' }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.08, ease: 'easeOut' }}
              >
                {line.text}
                {i === visibleLines - 1 && !skipped && (
                  <span className="cursor-blink" style={{ marginLeft: 2 }}>
                    ▊
                  </span>
                )}
              </motion.p>
            ))}
            {visibleLines >= BOOT_LINES.length && !skipped && (
              <motion.p
                className="text-sm"
                style={{ color: 'var(--os-muted)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="cursor-blink">▊</span>
              </motion.p>
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
