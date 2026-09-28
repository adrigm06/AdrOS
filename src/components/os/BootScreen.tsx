import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface BootScreenProps {
  onComplete: () => void;
}

export default function BootScreen({ onComplete }: BootScreenProps) {
  const shouldReduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [fadingOut, setFadingOut] = useState(false);

  const skipBoot = useCallback(() => {
    setProgress(100);
    setFadingOut(true);
    setTimeout(() => onComplete(), 300);
  }, [onComplete]);

  useEffect(() => {
    if (shouldReduce) {
      onComplete();
      return;
    }
    // Elegant Apple boot progress simulation
    const steps = [
      { progress: 15, delay: 150 },
      { progress: 38, delay: 400 },
      { progress: 65, delay: 750 },
      { progress: 88, delay: 1100 },
      { progress: 100, delay: 1350 },
    ];

    const timers: ReturnType<typeof setTimeout>[] = [];

    steps.forEach(({ progress: p, delay }) => {
      const t = setTimeout(() => {
        setProgress(p);
        if (p === 100) {
          setTimeout(() => {
            setFadingOut(true);
            setTimeout(() => onComplete(), 400);
          }, 200);
        }
      }, delay);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') skipBoot();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [skipBoot]);

  return (
    <AnimatePresence>
      {!fadingOut && (
        <motion.div
          key="apple-boot"
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black cursor-pointer select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={skipBoot}
        >
          <div className="flex flex-col items-center gap-10">
            {/* AdrOS Logo (Apple Boot style) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative flex items-center justify-center"
            >
              <img
                src="/AdrOS.webp"
                alt="AdrOS"
                className="w-16 h-16 object-contain pointer-events-none"
                style={{
                  filter: 'drop-shadow(0 2px 12px rgba(255,255,255,0.15))',
                }}
              />
            </motion.div>

            {/* Apple signature minimalist progress bar */}
            <div className="w-48 h-[4px] rounded-full bg-white/20 overflow-hidden relative">
              <motion.div
                className="h-full rounded-full bg-white"
                style={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
