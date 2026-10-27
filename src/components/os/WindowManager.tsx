import { AnimatePresence } from 'framer-motion';
import type { WindowState, WindowType } from '@/hooks/useWindowManager';
import type { Lang } from '@/hooks/useLanguage';
import type { ProjectEntry } from './Desktop';
import { ZONE_COLORS } from '@/data/projects';
import type { ZoneId } from '@/data/projects';
import { useIsMobile } from '@/hooks/useIsMobile';
import Window from './Window';
import ProjectWindow from '@/components/project/ProjectWindow';
import ProfileWindow from '@/components/widgets/ProfileWindow';
import ContactForm from '@/components/widgets/ContactForm';

import ChatWindow from '@/components/widgets/ChatWindow';
import SafariWindow from '@/components/widgets/SafariWindow';
import DocumentWindow from '@/components/widgets/DocumentWindow';
import { useState } from 'react';
import { initialBrowserHistory } from '@/lib/browser';
import { useContactSession } from '@/hooks/useContactSession';
import { useTerminalSession } from '@/hooks/useTerminalSession';
import TerminalWindow from '@/components/widgets/TerminalWindow';
import { navigateBrowser, parseBrowserTarget } from '@/lib/browser';
import type { TerminalAction } from '@/lib/terminal/types';
import { GithubRepositoryService } from '@/lib/terminal/repo-filesystem';

interface WindowManagerProps {
  windows: WindowState[];
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onBringToFront: (id: string) => void;
  onUpdatePosition: (id: string, pos: { x: number; y: number }) => void;
  onUpdateSize: (id: string, size: { width: number; height: number }) => void;
  projects: ProjectEntry[];
  lang: Lang;
  onOpenContact: () => void;
  onOpenWindow: (id: string, type: WindowType, title: string, projectId?: string) => void;
}

export default function WindowManager({
  windows,
  onClose,
  onMinimize,
  onMaximize,
  onBringToFront,
  onUpdatePosition,
  onUpdateSize,
  projects,
  lang,
  onOpenContact,
  onOpenWindow,
}: WindowManagerProps) {
  const isMobile = useIsMobile();
  const contact = useContactSession();
  const [browserHistory, setBrowserHistory] = useState(initialBrowserHistory);
  const [repositoryService, setRepositoryService] = useState(() => new GithubRepositoryService());
  const onTerminalAction = (action: TerminalAction) => {
    if (action.kind === 'contact') onOpenContact();
    if (action.kind === 'cv') onOpenWindow('cv', 'cv', 'CV · Adrian Gomez');
    if (action.kind === 'project') {
      const project = projects.find(entry => entry.data.id === action.id);
      if (project) onOpenWindow(project.data.id, 'project', project.data.title, project.data.id);
    }
    if (action.kind === 'browser') {
      const target = parseBrowserTarget(action.url);
      if (target) {
        setBrowserHistory(previous => navigateBrowser(previous, target));
        onOpenWindow('safari', 'safari', 'Safari');
      }
    }
  };
  const terminal = useTerminalSession(projects.map(project => project.data), lang, onTerminalAction);
  const closeApp = (id: string) => {
    if (id === 'contact') contact.reset();
    if (id === 'safari') { setBrowserHistory(initialBrowserHistory()); setRepositoryService(new GithubRepositoryService()); }
    if (id === 'terminal') terminal.reset();
    onClose(id);
  };

  return (
    <AnimatePresence>
      {windows.filter(w => w.isOpen && !w.isMinimized).map((win) => {
        const project = win.type === 'project'
          ? projects.find(p => p.data.id === win.projectId)
          : undefined;

        const accentColor = win.type === 'contact' || win.type === 'chat'
          ? 'var(--os-accent)'
          : (project ? ZONE_COLORS[project.data.zone as ZoneId] : undefined);

        return (
          <Window
            key={win.id}
            window={win}
            onClose={closeApp}
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            onBringToFront={onBringToFront}
            onUpdatePosition={onUpdatePosition}
            onUpdateSize={onUpdateSize}
            isMobile={isMobile}
            accentColor={accentColor}
            lang={lang}
          >
            {win.type === 'profile' ? (
              <ProfileWindow lang={lang} onOpenContact={onOpenContact} />
            ) : win.type === 'contact' ? (
              <ContactForm lang={lang} session={contact} onClose={() => closeApp(win.id)} />
            ) : win.type === 'chat' ? (
              <ChatWindow lang={lang} />
            ) : win.type === 'safari' ? (
              <SafariWindow lang={lang} projects={projects} history={browserHistory} onHistoryChange={setBrowserHistory} repositoryService={repositoryService} />
            ) : win.type === 'cv' ? (
              <DocumentWindow lang={lang} />
            ) : win.type === 'terminal' ? (
              <TerminalWindow lang={lang} session={terminal} />
            ) : project ? (
              <ProjectWindow
                project={project}
                lang={lang}
              />
            ) : null}
          </Window>
        );
      })}
    </AnimatePresence>
  );
}
