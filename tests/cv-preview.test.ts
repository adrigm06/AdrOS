import { createHash } from 'node:crypto';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('src/data/cv-preview.json', root), 'utf8')) as {
  sourceSha256: string; pages: { src: string; width: number; height: number; page: number }[];
};

describe('published CV preview', () => {
  it('ties previews to the versioned published PDF checksum', () => {
    const published = readFileSync(new URL('public/documents/EN_Adrian_Gomez_AI_Engineer.pdf', root));
    expect(published.subarray(0, 5).toString('ascii')).toBe('%PDF-');
    expect(createHash('sha256').update(published).digest('hex')).toBe(manifest.sourceSha256);
  });
  it('uses complete, sized WebP previews within the asset budget', () => {
    expect(manifest.pages.length).toBeGreaterThan(0);
    manifest.pages.forEach((page, index) => {
      expect(page.page).toBe(index + 1);
      expect(page.src).toMatch(/^\/documents\/cv\/\d+\.webp$/);
      expect(page.width).toBeGreaterThan(0);
      expect(page.width).toBeLessThanOrEqual(1200);
      expect(page.height).toBeGreaterThan(0);
      expect(statSync(fileURLToPath(new URL(`public${page.src}`, root))).size).toBeLessThan(150000);
    });
  });
});
