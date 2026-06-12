import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowManager } from '@/hooks/useWindowManager';
import { LanguageContext, useLanguageState, useTranslation } from '@/hooks/useLanguage';
import { useReducedMotion } from 'framer-motion';
import { useKonamiCode, useLsCommand } from '@/hooks/useEasterEggs';
import Taskbar from './Taskbar';
import BootScreen from './BootScreen';
import WindowManager from './WindowManager';
import DesktopZone from './DesktopZone';
import { ZONES } from '@/data/projects';
import type { ZoneId } from '@/data/projects';
import QuickLinks from '@/components/widgets/QuickLinks';
import type { CollectionEntry } from 'astro:content';

type ViewMode = 'icons' | 'list';

export type ProjectEntry = CollectionEntry<'projects'>;

interface DesktopProps {
  projects: ProjectEntry[];
}

export default function Desktop({ projects }: DesktopProps) {
  const [booted, setBooted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('icons');
  const { windows, minimizedWindows, openWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, bringToFront, updatePosition } = useWindowManager();
  const langState = useLanguageState();
  const { t } = useTranslation(langState.lang);
  const reduce = useReducedMotion();

  // Easter eggs
  useKonamiCode();
  useLsCommand();

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />;
  }

  const grouped = projects.reduce<Record<string, ProjectEntry[]>>((acc, p) => {
    const zone = p.data.zone;
    if (!acc[zone]) acc[zone] = [];
    acc[zone].push(p);
    return acc;
  }, {});

  const handleOpenProject = (project: ProjectEntry) => {
    openWindow(project.data.id, 'project', project.data.title, project.data.id);
  };

  return (
    <LanguageContext.Provider value={langState}>
      <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: 'var(--os-bg)' }}>
        {/* Desktop grid */}
        <motion.div
          className="desktop-grid"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Zone: android */}
          <motion.div
            className="zone-panel"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0, ease: [0.16, 1, 0.3, 1] }}
            style={{ gridArea: 'android' }}
          >
            <DesktopZone
              label={t('zone_android')}
              projects={grouped['android'] || []}
              onOpenProject={handleOpenProject}
              openProjectIds={windows.filter(w => w.type === 'project' && w.isOpen && !w.isMinimized).map(w => w.projectId || '')}
            />
          </motion.div>

          {/* Zone: fullstack */}
          <motion.div
            className="zone-panel"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ gridArea: 'fullstack' }}
          >
            <DesktopZone
              label={t('zone_fullstack')}
              projects={grouped['fullstack'] || []}
              onOpenProject={handleOpenProject}
              openProjectIds={windows.filter(w => w.type === 'project' && w.isOpen && !w.isMinimized).map(w => w.projectId || '')}
            />
          </motion.div>

          {/* Zone: ai-tools */}
          <motion.div
            className="zone-panel"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ gridArea: 'ai-tools' }}
          >
            <DesktopZone
              label={t('zone_ai_tools')}
              projects={grouped['ai-tools'] || []}
              onOpenProject={handleOpenProject}
              openProjectIds={windows.filter(w => w.type === 'project' && w.isOpen && !w.isMinimized).map(w => w.projectId || '')}
            />
          </motion.div>

          {/* Zone: quicklinks */}
          <motion.div
            className="zone-panel"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ gridArea: 'quicklinks' }}
          >
            <QuickLinks lang={langState.lang} onOpenProfile={() => openWindow('profile', 'profile', t('profile_title'))} />
          </motion.div>
        </motion.div>

        {/* Windows layer */}
        <WindowManager
          windows={windows}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
          onBringToFront={bringToFront}
          onUpdatePosition={updatePosition}
          projects={projects}
          lang={langState.lang}
        />

        {/* Taskbar */}
        <motion.div
          initial={reduce ? false : { y: 48 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <Taskbar
            lang={langState.lang}
            toggleLang={langState.toggleLang}
            viewMode={viewMode}
            onToggleView={() => setViewMode(v => v === 'icons' ? 'list' : 'icons')}
            minimizedWindows={minimizedWindows}
            onRestoreWindow={restoreWindow}
            onOpenProfile={() => openWindow('profile', 'profile', t('profile_title'))}
          />
        </motion.div>

        {/* List view overlay */}
        <AnimatePresence>
          {viewMode === 'list' && (
            <ListView
              projects={projects}
              onOpenProject={handleOpenProject}
              lang={langState.lang}
            />
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .desktop-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          grid-template-areas:
            "android    fullstack"
            "ai-tools   quicklinks";
          gap: 12px;
          padding: 12px;
          height: calc(100vh - var(--taskbar-h));
          position: relative;
        }

        .zone-panel {
          background: rgba(22, 26, 35, 0.6);
          border: 1px solid var(--os-border);
          border-radius: var(--radius-lg);
          backdrop-filter: blur(4px);
          overflow-y: auto;
          padding: 12px;
        }

        @media (max-width: 768px) {
          .desktop-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            grid-template-areas:
              "android"
              "fullstack"
              "ai-tools"
              "quicklinks";
          }
        }

        @media (max-width: 480px) {
          .desktop-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
            grid-template-areas:
              "android"
              "fullstack"
              "ai-tools"
              "quicklinks";
          }
        }
      `}</style>
    </LanguageContext.Provider>
  );
}

function ListView({ projects, onOpenProject, lang }: { projects: ProjectEntry[]; onOpenProject: (p: ProjectEntry) => void; lang: string }) {
  const sorted = [...projects].sort((a, b) => b.data.date.localeCompare(a.data.date));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 overflow-auto"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 'var(--taskbar-h)',
        backgroundColor: 'rgba(13, 15, 20, 0.95)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="max-w-4xl mx-auto p-6">
        <table className="w-full" style={{ fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr className="text-left text-xs" style={{ color: 'var(--os-muted)' }}>
              <th className="pb-3 font-normal">{lang === 'es' ? 'Proyecto' : 'Project'}</th>
              <th className="pb-3 font-normal">{lang === 'es' ? 'Categoría' : 'Category'}</th>
              <th className="pb-3 font-normal hidden sm:table-cell">Stack</th>
              <th className="pb-3 font-normal">{lang === 'es' ? 'Fecha' : 'Date'}</th>
              <th className="pb-3 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((project, i) => (
              <motion.tr
                key={project.data.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.1 }}
                className="group cursor-pointer transition-colors duration-100"
                style={{
                  borderBottom: '1px solid var(--os-border)',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--os-surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                onClick={() => onOpenProject(project)}
              >
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: project.data.color }}
                    />
                    <span className="text-sm" style={{ color: 'var(--os-text)' }}>
                      {project.data.title}
                    </span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-xs" style={{ color: 'var(--os-muted)' }}>
                    {ZONES[project.data.zone as ZoneId]?.labelKey.replace('zone_', '') || project.data.zone}
                  </span>
                </td>
                <td className="py-3 pr-4 hidden sm:table-cell">
                  <div className="flex gap-1 flex-wrap">
                    {project.data.stack.slice(0, 3).map(tech => (
                      <span
                        key={tech}
                        className="text-[10px] px-1.5 py-0.5 rounded-[var(--radius-sm)]"
                        style={{
                          backgroundColor: 'var(--os-surface-2)',
                          border: '1px solid var(--os-border)',
                          color: 'var(--os-muted)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <span className="text-xs" style={{ color: 'var(--os-muted)' }}>
                    {project.data.date}
                  </span>
                </td>
                <td className="py-3">
                  <span
                    className="text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--os-accent)' }}
                  >
                    →
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
