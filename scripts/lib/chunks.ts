import * as fs from 'node:fs';
import matter from 'gray-matter';

export interface Chunk {
  source_id: string;  // unique key for upsert
  content:   string;
  metadata:  Record<string, unknown>;
  source:    'mdx' | 'pdf' | 'profile';
}

export function parseMdxProject(filePath: string): Chunk[] {
  const raw      = fs.readFileSync(filePath, 'utf-8');
  return parseMdxContent(raw);
}

export function parseMdxContent(raw: string): Chunk[] {
  const { data, content } = matter(raw);
  const id       = data.id as string;
  const title    = data.title as string;
  const subtitle = data.subtitle as string ?? '';
  const stack    = (data.stack as string[] ?? []).join(', ');
  const descEs   = (data.description as Record<string, string>)?.es ?? '';
  const descEn   = (data.description as Record<string, string>)?.en ?? '';

  // Chunk 1 — metadata summary (bilingual)
  const metaChunk: Chunk = {
    source_id: `mdx-${id}-meta`,
    content: `
Project: ${title}
Subtitle: ${subtitle}
Zone: ${data.zone}
Status: ${data.status}
Date: ${data.date}
Stack: ${stack}
GitHub: ${data.githubUrl ?? ''}
Demo: ${data.demoUrl ?? ''}
Description (ES): ${descEs}
Description (EN): ${descEn}
    `.trim(),
    metadata: { project_id: id, title, lang: 'both', section: 'meta' },
    source: 'mdx',
  };

  // Chunks 2 & 3 — full content per language
  const langRegex = /<Content lang="(\w+)">([\s\S]*?)<\/Content>/g;
  const langChunks: Chunk[] = [];
  let match: RegExpExecArray | null;

  while ((match = langRegex.exec(content)) !== null) {
    const lang = match[1];
    const body = match[2].trim();
    langChunks.push({
      source_id: `mdx-${id}-${lang}`,
      content:   `[${title}] ${body}`,
      metadata:  { project_id: id, title, lang, section: 'content' },
      source:    'mdx',
    });
  }

  return [metaChunk, ...langChunks];
}

// ── PDF extractor ─────────────────────────────────────────────
export async function extractPdfChunks(pdfPath: string): Promise<Chunk[]> {
  // pdf-parse is a CommonJS module — dynamic import
  const pdfParse = (await import('pdf-parse')).default;
  const buffer   = fs.readFileSync(pdfPath);
  const data     = await pdfParse(buffer);

  return chunkPdfText(data.text);
}

export function chunkPdfText(text: string): Chunk[] {
  // Preserve existing behavior: sections over 800 characters are NOT truncated.
  const rawSections = text
    .split(/\n{2,}/)
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 60);

  // Remove any lines that look like private contact info (safety net)
  const sanitize = (text: string) =>
    text
      .replace(/\b[\w.+-]+@[\w-]+\.\w+\b/g, '[email removed]')
      .replace(/\+?\d[\d\s\-().]{8,}\d/g, '[phone removed]');

  const chunks: Chunk[] = rawSections.map((section: string, idx: number) => ({
    source_id: `pdf-cv-section-${idx}`,
    content:   sanitize(`[CV Adrián Gómez] ${section}`),
    metadata:  { section: `cv-${idx}`, lang: 'es', source: 'pdf' },
    source:    'pdf' as const,
  }));

  return chunks;
}
