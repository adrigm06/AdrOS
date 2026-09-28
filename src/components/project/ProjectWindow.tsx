import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CollectionEntry } from 'astro:content';
import type { Lang } from '@/hooks/useLanguage';
import ProjectReadme from './ProjectReadme';
import ProjectGallery from './ProjectGallery';
import ProjectStack from './ProjectStack';
import ProjectLinks from './ProjectLinks';

const TABS = ['readme', 'screenshots', 'stack', 'links'] as const;
type Tab = (typeof TABS)[number];

interface ProjectWindowProps {
  project: CollectionEntry<'projects'>;
  lang: Lang;
}

export default function ProjectWindow({ project, lang }: ProjectWindowProps) {
  const [activeTab, setActiveTab] = useState<Tab>('readme');
  const p = project.data;

  const hasVideos = !!(p.videos && p.videos.length > 0);
  const visibleTabs: { id: Tab; label: string; icon: string }[] = [
    {
      id: 'readme',
      label: 'README',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    },
    ...(p.hasImages || hasVideos
      ? [
          {
            id: 'screenshots' as Tab,
            label: hasVideos && !p.hasImages
              ? (lang === 'es' ? 'Demos' : 'Demos')
              : (lang === 'es' ? 'Capturas' : 'Screenshots'),
            icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
          },
        ]
      : []),
    {
      id: 'stack',
      label: lang === 'es' ? 'Tecnologías' : 'Stack',
      icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    },
    {
      id: 'links',
      label: lang === 'es' ? 'Enlaces' : 'Links',
      icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row h-full overflow-hidden">
      {/* ── macOS Finder Sidebar / Mobile Header ── */}
      <div className="w-full sm:w-52 flex-shrink-0 bg-[rgba(20,23,34,0.6)] border-b sm:border-b-0 sm:border-r border-white/10 p-2.5 sm:p-3 flex flex-col justify-between select-none">
        <div>
          {/* Project Title Header */}
          <div className="flex items-center justify-between px-2 py-1 mb-1.5">
            <div className="flex items-center gap-2">
              <img src="/icons/folder.webp" alt="Folder" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
              <span className="font-sans text-[11px] font-semibold text-white/60 uppercase tracking-wider">
                {lang === 'es' ? 'Secciones' : 'Sections'}
              </span>
            </div>
          </div>

          {/* Navigation Items (Sidebar Style) */}
          <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
            {visibleTabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-[12px] font-sans transition-all text-left whitespace-nowrap ${
                    isSelected
                      ? 'bg-[var(--os-blue)] text-white font-medium shadow-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0"
                  >
                    <path d={tab.icon} />
                  </svg>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Info Tag */}
        <div className="hidden sm:flex flex-col gap-1.5 pt-3 border-t border-white/10 px-2">
          <div className="flex items-center justify-between text-[10px] font-sans">
            <span className="text-white/40">{lang === 'es' ? 'Categoría' : 'Category'}</span>
            <span className="text-white/80 font-medium">{p.zone}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-sans">
            <span className="text-white/40">{lang === 'es' ? 'Estado' : 'Status'}</span>
            <span className={p.status === 'active' ? 'text-[var(--os-ok)] font-medium' : 'text-white/70'}>
              {p.status}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content Area with macOS Breadcrumb Header ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[rgba(14,16,24,0.5)]">
        {/* Finder Path Breadcrumb */}
        <div className="hidden sm:flex items-center gap-1.5 px-5 py-2 border-b border-white/5 text-[11px] font-sans text-white/40 select-none">
          <span>{lang === 'es' ? 'Proyectos' : 'Projects'}</span>
          <span>›</span>
          <span className="text-white/70 font-medium">{p.title}</span>
          <span>›</span>
          <span className="text-white/90">
            {visibleTabs.find((t) => t.id === activeTab)?.label}
          </span>
        </div>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              {activeTab === 'readme' && <ProjectReadme project={project} lang={lang} />}
              {activeTab === 'screenshots' && <ProjectGallery project={project} />}
              {activeTab === 'stack' && <ProjectStack project={project} />}
              {activeTab === 'links' && <ProjectLinks project={project} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
