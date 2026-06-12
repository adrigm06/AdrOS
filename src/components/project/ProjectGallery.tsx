import { useState } from 'react';
import type { CollectionEntry } from 'astro:content';

interface ProjectGalleryProps {
  project: CollectionEntry<'projects'>;
}

export default function ProjectGallery({ project }: ProjectGalleryProps) {
  const p = project.data;
  const [activeIndex, setActiveIndex] = useState(0);
  const totalImages = 5; // 01.webp to 05.webp + cover.webp

  // Generate image paths
  const images = Array.from({ length: totalImages }, (_, i) => ({
    src: `/projects/${p.id}/screenshots/${String(i + 1).padStart(2, '0')}.webp`,
    thumb: `/projects/${p.id}/screenshots/${String(i + 1).padStart(2, '0')}.webp`,
    alt: `Screenshot ${i + 1} del proyecto ${p.title}`,
  }));

  const cover = {
    src: `/projects/${p.id}/screenshots/cover.webp`,
    alt: `Cover del proyecto ${p.title}`,
  };

  const hasRealImages = p.hasImages;

  if (!hasRealImages) {
    return (
      <div
        className="p-4 rounded-[var(--radius-md)] font-mono text-xs"
        style={{ backgroundColor: 'var(--os-bg)', color: 'var(--os-accent)' }}
      >
        <p className="mb-2">$ ls screenshots/</p>
        <p style={{ color: 'var(--os-muted)' }}>No screenshots available for this project.</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {p.stack.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 text-[10px] rounded-[var(--radius-sm)]"
              style={{
                backgroundColor: 'var(--os-surface-2)',
                border: '1px solid var(--os-border)',
                color: p.color,
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div
        className="w-full flex items-center justify-center mb-3 overflow-hidden rounded-[var(--radius-md)]"
        style={{ maxHeight: 280, backgroundColor: 'var(--os-bg)' }}
      >
        <img
          src={activeIndex === 0 ? cover.src : images[activeIndex - 1]?.src || cover.src}
          alt={activeIndex === 0 ? cover.alt : images[activeIndex - 1]?.alt || cover.alt}
          className="w-full h-full object-contain"
          style={{ maxHeight: 280 }}
          width={720}
          height={280}
          loading={activeIndex === 0 ? 'eager' : 'lazy'}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '';
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 flex-wrap">
        {/* Cover thumbnail */}
        <button
          type="button"
          onClick={() => setActiveIndex(0)}
          className="flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] border-2 transition-opacity hover:opacity-80"
          style={{
            width: 80,
            height: 60,
            borderColor: activeIndex === 0 ? p.color : 'var(--os-border)',
          }}
        >
          <img
            src={cover.src}
            alt={cover.alt}
            className="w-full h-full object-cover"
            width={80}
            height={60}
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </button>
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i + 1)}
            className="flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)] border-2 transition-opacity hover:opacity-80"
            style={{
              width: 80,
              height: 60,
              borderColor: activeIndex === i + 1 ? p.color : 'var(--os-border)',
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover"
              width={80}
              height={60}
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
