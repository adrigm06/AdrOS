import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import { chunkPdfText, extractPdfChunks, parseMdxContent, parseMdxProject } from '../scripts/lib/chunks.js';

vi.mock('pdf-parse', () => ({ default: vi.fn(async () => ({
  text: ['short', ' ' + 'a'.repeat(60) + ' ', 'b'.repeat(61), 'c'.repeat(800), 'd'.repeat(801)].join('\n\n'),
})) }));

describe('credential-free ingestion parsers', () => {
  it('builds bilingual metadata and ordered language chunks from MDX', () => {
    const fixture = new URL('./fixtures/project.mdx', import.meta.url);
    const chunks = parseMdxProject(fileURLToPath(fixture));
    expect(chunks).toEqual(parseMdxContent(readFileSync(fixture, 'utf8')));
    expect(chunks.map(({ source_id }) => source_id)).toEqual(['mdx-fixture-meta', 'mdx-fixture-es', 'mdx-fixture-en']);
    expect(chunks[0].content).toContain('Stack: TypeScript, Astro');
    expect(chunks[0].content).toContain('Description (ES): Descripción de prueba');
    expect(chunks[0].content).toContain('Description (EN): Test description');
    expect(chunks[0].content).toContain('Demo: ');
    expect(chunks[1]).toEqual({ source_id: 'mdx-fixture-es', content: '[Fixture Project] Contenido de ejemplo.', source: 'mdx', metadata: { project_id: 'fixture', title: 'Fixture Project', lang: 'es', section: 'content' } });
    expect(chunks[2].content).toBe('[Fixture Project] Example content.');
  });

  it('discards trimmed sections of 60 characters or less but keeps 61', () => {
    const chunks = chunkPdfText(['short', ' ' + 'a'.repeat(60) + ' ', 'b'.repeat(61)].join('\n\n'));
    expect(chunks).toHaveLength(1);
    expect(chunks[0].source_id).toBe('pdf-cv-section-0');
    expect(chunks[0].content).toBe('[CV Adrián Gómez] ' + 'b'.repeat(61));
  });

  it('documents existing behavior: 800 and 801+ characters are preserved, not capped', () => {
    for (const length of [800, 801, 1200]) {
      expect(chunkPdfText('a'.repeat(length))[0].content).toBe('[CV Adrián Gómez] ' + 'a'.repeat(length));
    }
  });

  it('redacts contact details and uses a deterministic PDF parser stub', async () => {
    const text = 'Public career description '.repeat(4) + 'person@example.test +34 600 123 456';
    const chunk = chunkPdfText(text)[0];
    expect(chunk.content).toContain('[email removed]');
    expect(chunk.content).toContain('[phone removed]');
    const chunks = await extractPdfChunks(fileURLToPath(new URL('./fixtures/project.mdx', import.meta.url)));
    expect(chunks).toHaveLength(3);
    expect(chunks.map(({ content }) => content)).toEqual([
      '[CV Adrián Gómez] ' + 'b'.repeat(61),
      '[CV Adrián Gómez] ' + 'c'.repeat(800),
      '[CV Adrián Gómez] ' + 'd'.repeat(801),
    ]);
  });
});
