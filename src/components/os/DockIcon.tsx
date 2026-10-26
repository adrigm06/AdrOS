import { useState, useRef } from 'react';
import { motion, AnimatePresence, useTransform, useSpring, useReducedMotion, type MotionValue } from 'framer-motion';

/* ── Magnified Dock Item Component ── */

export default function DockIcon({
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
        className="dock-app-button flex items-center justify-center rounded-[12px] p-0.5 outline-none transition-transform active:scale-95"
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
