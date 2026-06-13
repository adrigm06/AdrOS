import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootLine {
  text: string;
  delay: number;
}

const BOOT_LINES: BootLine[] = [
  { text: '', delay: 0 },
  { text: 'AdrOS v1.0.0', delay: 400 },
  { text: 'Copyright © 2026 Adrián Gómez', delay: 700 },
  { text: '', delay: 1000 },
  { text: 'Loading kernel modules...', delay: 1100 },
  { text: 'Initializing file system...', delay: 1300 },
  { text: 'Mounting project volumes...', delay: 1500 },
  { text: 'All systems nominal.', delay: 1800 },
  { text: '', delay: 2000 },
  { text: 'Click or press any key to continue.', delay: 2100 },
];

interface BootScreenProps {
  onComplete: () => void;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  const skipBoot = useCallback(() => {
    if (!skipped) {
      setSkipped(true);
      setProgress(100);
      setFadingOut(true);
      setTimeout(() => onComplete(), 350);
    }
  }, [skipped, onComplete]);

  useEffect(() => {
    if (skipped) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, i) => {
      if (i === 0) setVisibleLines(1);
      const timer = setTimeout(() => {
        setVisibleLines(i + 1);
        if (i >= 4 && i <= 7) {
          // Progress goes from 0 to 100 during boot messages
          const bootProgress = Math.min(100, ((i - 3) / 4) * 100);
          setTimeout(() => setProgress(bootProgress), 50);
        }
        if (i === BOOT_LINES.length - 1) {
          setTimeout(() => {
            setProgress(100);
            setTimeout(() => {
              setFadingOut(true);
              setTimeout(() => onComplete(), 350);
            }, 500);
          }, 300);
        }
      }, line.delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [skipped, onComplete]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') skipBoot();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [skipBoot]);

  return (
    <AnimatePresence>
      {!fadingOut ? (
        <motion.div
          key="boot"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            backgroundColor: '#000',
            fontFamily: 'var(--font-mono)',
          }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={skipBoot}
        >
          {/* Central content */}
          <div className="flex flex-col items-center gap-6" style={{ maxWidth: 520, width: '90%' }}>
            {/* AdrOS Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-2"
            >
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="22" stroke="var(--os-accent)" strokeWidth="1.5" opacity="0.5" />
                <path d="M24 4a30 30 0 0 1 8 20 30 30 0 0 1-8 20 30 30 0 0 1-8-20 30 30 0 0 1 8-20z" fill="var(--os-accent)" opacity="0.8" />
                <path d="M6 24h36" stroke="var(--os-accent)" strokeWidth="1.5" opacity="0.4" />
              </svg>
            </motion.div>

            {/* Boot lines */}
            <div className="flex flex-col gap-0 w-full">
              {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
                <motion.p
                  key={`boot-${i}`}
                  className="text-sm whitespace-pre text-center"
                  style={{ color: 'var(--os-accent)' }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.1, ease: [0.23, 1, 0.32, 1] }}
                >
                  {line.text}
                  {i === visibleLines - 1 && !skipped && i > 0 && (
                    <span className="cursor-blink" style={{ marginLeft: 2 }}>▊</span>
                  )}
                </motion.p>
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-48 h-[2px] rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: 'var(--os-accent)', width: `${progress}%` }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
