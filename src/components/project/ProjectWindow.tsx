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
  const color = p.color;

  const hasVideos = !!(p.videos && p.videos.length > 0);
  const visibleTabs: { id: Tab; label: string }[] = [
    { id: 'readme', label: 'README' },
    ...(p.hasImages || hasVideos
      ? [
          {
            id: 'screenshots' as Tab,
            label: hasVideos && !p.hasImages ? 'Demos' : 'Screenshots',
          },
        ]
      : []),
    { id: 'stack', label: 'Stack' },
    { id: 'links', label: 'Links' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-0 px-4 border-b" style={{ borderColor: 'var(--os-border)' }}>
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 text-xs font-sans transition-colors duration-100 border-b-2 border-transparent"
            style={{
              color: activeTab === tab.id ? 'var(--os-text)' : 'var(--os-muted)',
              borderBottomColor: activeTab === tab.id ? color : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'readme' && <ProjectReadme project={project} lang={lang} />}
            {activeTab === 'screenshots' && <ProjectGallery project={project} />}
            {activeTab === 'stack' && <ProjectStack project={project} />}
            {activeTab === 'links' && <ProjectLinks project={project} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
