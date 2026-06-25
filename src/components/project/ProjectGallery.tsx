import { useState, useCallback } from 'react';
import type { CollectionEntry } from 'astro:content';

interface ProjectGalleryProps {
  project: CollectionEntry<'projects'>;
}

const TOTAL_SCREENSHOTS = 5;

type GalleryItem =
  | { type: 'image'; src: string; alt: string }
  | { type: 'video'; url: string; title: string; previewUrl: string };

export default function ProjectGallery({ project }: ProjectGalleryProps) {
  const p = project.data;
  const [activeIndex, setActiveIndex] = useState(0);

  const items: GalleryItem[] = [];

  if (p.hasImages) {
    items.push({
      type: 'image',
      src: `/projects/${p.id}/screenshots/cover.webp`,
      alt: `Cover del proyecto ${p.title}`,
    });
    for (let i = 0; i < TOTAL_SCREENSHOTS; i++) {
      items.push({
        type: 'image',
        src: `/projects/${p.id}/screenshots/${String(i + 1).padStart(2, '0')}.webp`,
        alt: `Screenshot ${i + 1} del proyecto ${p.title}`,
      });
    }
  }

  const projectVideos = (p as any).videos;
  if (projectVideos && projectVideos.length > 0) {
    projectVideos.forEach((vid: { title: string; url: string }) => {
      let previewUrl = vid.url;
      if (previewUrl.includes('/view')) {
        previewUrl = previewUrl.replace('/view', '/preview');
      }
      items.push({
        type: 'video',
        url: vid.url,
        title: vid.title,
        previewUrl: previewUrl,
      });
    });
  }

  const goTo = useCallback(
    (index: number) => setActiveIndex(Math.max(0, Math.min(index, items.length - 1))),
    [items.length],
  );

  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  if (items.length === 0) {
    return (
      <div
        className="p-4 rounded-[var(--radius-md)] font-mono text-xs"
        style={{ backgroundColor: 'var(--os-bg)', color: 'var(--os-accent)' }}
      >
        <p className="mb-2">$ ls screenshots/</p>
        <p style={{ color: 'var(--os-muted)' }}>No screenshots or videos available for this project.</p>
      </div>
    );
  }

  const current = items[activeIndex];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* ── Main image/video with arrows ── */}
      <div className="relative w-full flex items-center justify-center" style={{ minHeight: 200 }}>
        {/* Previous arrow */}
        {activeIndex > 0 && (
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-0 z-10 flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150 hover:scale-110 active:scale-95"
            style={{
              backgroundColor: 'rgba(0,0,0,0.55)',
              color: 'var(--os-text)',
              backdropFilter: 'blur(4px)',
            }}
            aria-label="Anterior"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 14L7 9L11 4" />
            </svg>
          </button>
        )}

        {/* Media Container */}
        <div
          className="overflow-hidden rounded-[var(--radius-md)] w-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--os-bg)', height: 320 }}
        >
          {current.type === 'video' ? (
            <iframe
              src={current.previewUrl}
              title={current.title}
              className="w-full h-full border-0 rounded-[var(--radius-md)]"
              allow="autoplay; encrypted-media"
              allowFullScreen
              loading="eager"
            />
          ) : (
            <img
              src={current.src}
              alt={current.alt}
              className="object-contain w-full h-full"
              style={{ maxHeight: 320 }}
              width={720}
              height={320}
              loading="eager"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>

        {/* Next arrow */}
        {activeIndex < items.length - 1 && (
          <button
            type="button"
            onClick={goNext}
            className="absolute right-0 z-10 flex items-center justify-center w-9 h-9 rounded-full transition-all duration-150 hover:scale-110 active:scale-95"
            style={{
              backgroundColor: 'rgba(0,0,0,0.55)',
              color: 'var(--os-text)',
              backdropFilter: 'blur(4px)',
            }}
            aria-label="Siguiente"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 4L11 9L7 14" />
            </svg>
          </button>
        )}

        {/* Counter badge */}
        <div
          className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full font-mono text-[10px]"
          style={{
            backgroundColor: 'rgba(0,0,0,0.6)',
            color: 'var(--os-muted)',
            backdropFilter: 'blur(4px)',
          }}
        >
          {activeIndex + 1} / {items.length}
        </div>
      </div>

      {/* ── Thumbnails ── */}
      <div className="flex gap-2 flex-wrap justify-center">
        {items.map((item, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className="overflow-hidden rounded-[var(--radius-sm)] border-2 transition-all duration-150"
              style={{
                width: isActive ? 88 : 68,
                height: isActive ? 64 : 48,
                borderColor: isActive ? p.color : 'var(--os-border)',
                opacity: isActive ? 1 : 0.5,
                filter: isActive ? 'none' : 'brightness(0.6)',
                transform: isActive ? 'scale(1)' : 'scale(0.92)',
              }}
            >
              {item.type === 'video' ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--os-surface-2, #1e2433)] text-[var(--os-accent)] p-1 text-center font-sans text-[8px] leading-tight gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span className="truncate max-w-[60px] block" title={item.title}>
                    {item.title}
                  </span>
                </div>
              ) : (
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full h-full object-cover"
                  width={88}
                  height={64}
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
