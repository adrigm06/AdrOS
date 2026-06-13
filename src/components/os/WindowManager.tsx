import { AnimatePresence } from 'framer-motion';
import type { WindowState } from '@/hooks/useWindowManager';
import type { Lang } from '@/hooks/useLanguage';
import type { ProjectEntry } from './Desktop';
import { ZONE_COLORS } from '@/data/projects';
import type { ZoneId } from '@/data/projects';
import Window from './Window';
import ProjectWindow from '@/components/project/ProjectWindow';
import ProfileWindow from '@/components/widgets/ProfileWindow';

interface WindowManagerProps {
  windows: WindowState[];
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onBringToFront: (id: string) => void;
  onUpdatePosition: (id: string, pos: { x: number; y: number }) => void;
  projects: ProjectEntry[];
  lang: Lang;
}

export default function WindowManager({
  windows,
  onClose,
  onMinimize,
  onMaximize,
  onBringToFront,
  onUpdatePosition,
  projects,
  lang,
}: WindowManagerProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <AnimatePresence>
      {windows.filter(w => w.isOpen && !w.isMinimized).map((win) => {
        const project = win.type === 'project'
          ? projects.find(p => p.data.id === win.projectId)
          : undefined;

        const accentColor = project ? ZONE_COLORS[project.data.zone as ZoneId] : undefined;

        return (
          <Window
            key={win.id}
            window={win}
            onClose={onClose}
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            onBringToFront={onBringToFront}
            onUpdatePosition={onUpdatePosition}
            isMobile={isMobile}
            accentColor={accentColor}
          >
            {win.type === 'profile' ? (
              <ProfileWindow lang={lang} />
            ) : project ? (
              <ProjectWindow project={project} lang={lang} />
            ) : null}
          </Window>
        );
      })}
    </AnimatePresence>
  );
}
