import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProjectEntry } from './Desktop';

interface FolderIconProps {
  project: ProjectEntry;
  isOpen: boolean;
  onOpen: () => void;
}

export default function FolderIcon({ project, isOpen, onOpen }: FolderIconProps) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleMouseEnter = () => {
    hoverTimer.current = setTimeout(() => setIsHovered(true), 300);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setIsHovered(false);
  };

  const color = project.data.color;
  const topTechs = project.data.stack.slice(0, 3);

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={onOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        className="flex flex-col items-center gap-1 p-2 transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-1 focus:ring-[var(--os-accent)] rounded-[var(--radius-md)]"
        style={{ minWidth: 80, minHeight: 80 }}
        tabIndex={0}
        role="button"
        aria-label={`Abrir proyecto ${project.data.title}`}
      >
        {/* SVG Folder Icon */}
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          style={{
            filter: isOpen ? `drop-shadow(0 0 6px ${color}88)` : undefined,
          }}
        >
          {/* Folder tab */}
          <path
            d="M8 14C8 11.7909 9.79086 10 12 10H20.6863C21.7685 10 22.806 10.4214 23.5858 11.1716L26.8284 14.3431C27.5786 15.0933 28.6159 15.5 29.698 15.5H36C38.2091 15.5 40 17.2909 40 19.5V34C40 36.2091 38.2091 38 36 38H12C9.79086 38 8 36.2091 8 34V14Z"
            fill={isOpen || isHovered ? color : `${color}d9`}
            stroke={isOpen ? color : 'none'}
            strokeWidth="0.5"
          />
          {/* Folder body - slightly lighter tab */}
          <path
            d="M8 18C8 15.7909 9.79086 14 12 14H29.5C31.7091 14 33.5 15.7909 33.5 18V34C33.5 36.2091 31.7091 38 29.5 38H12C9.79086 38 8 36.2091 8 34V18Z"
            fill={isOpen || isHovered ? color : `${color}b3`}
            opacity={isOpen || isHovered ? 1 : 0.85}
          />
          {/* Open folder detail */}
          {isOpen && (
            <rect x="13" y="22" width="15" height="2" rx="1" fill={`${color}66`} />
          )}
        </svg>

        {/* Label */}
        <span
          className="text-[11px] font-mono text-center leading-tight transition-colors duration-150 max-w-[80px] truncate"
          style={{
            color: isOpen ? 'var(--os-text)' : isHovered ? 'var(--os-text)' : 'var(--os-muted)',
            textDecoration: isOpen ? 'underline' : 'none',
          }}
        >
          {project.data.title}
        </span>

        {/* Active indicator */}
        {isOpen && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        )}
      </button>

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 font-mono text-[10px] pointer-events-none z-50"
            style={{
              backgroundColor: 'var(--os-surface-2)',
              border: '1px solid var(--os-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--os-text)',
            }}
          >
            {topTechs.join(' · ')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
