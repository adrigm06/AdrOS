/**
 * RAG Ingestion Script — AdrOS Portfolio
 *
 * Reads all project MDX files, the profile corpus and the CV PDF,
 * generates embeddings via Google Gemini (gemini-embedding-2),
 * and upserts everything into Supabase pgvector table.
 *
 * Usage:
 *   npx tsx scripts/ingest.ts                    # full ingest
 *   npx tsx scripts/ingest.ts --source mdx       # only projects
 *   npx tsx scripts/ingest.ts --source profile   # only profile chunks
 *   npx tsx scripts/ingest.ts --source pdf       # only CV
 *
 * Requires in .env:
 *   PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   GEMINI_API_KEY
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseMdxProject, extractPdfChunks, type Chunk } from './lib/chunks.js';
import { EMBEDDING_DIMENSIONS } from '../supabase/functions/_shared/embedding.ts';
import { createClient } from '@supabase/supabase-js';
import { profileChunks } from './corpus/profile.js';

// ── Load env ──────────────────────────────────────────────────
import 'dotenv/config';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !GEMINI_API_KEY) {
  console.error('❌ Missing env vars: PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── CLI arg ───────────────────────────────────────────────────
const sourceIndex = process.argv.indexOf('--source');
const sourceFilter = process.argv.find(a => a.startsWith('--source='))?.split('=')[1]
  ?? (sourceIndex !== -1 && process.argv[sourceIndex + 1] ? process.argv[sourceIndex + 1] : 'all');

// ── Types ─────────────────────────────────────────────────────
// ── Gemini batch embedding ────────────────────────────────────
async function embed(texts: string[]): Promise<number[][]> {
  // AQ. keys require x-goog-api-key header (not ?key= query param)
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:batchEmbedContents';
  
  const requests = texts.map(text => ({
    model: 'models/gemini-embedding-2',
    content: {
      parts: [{ text }],
    },
    outputDimensionality: EMBEDDING_DIMENSIONS,
  }));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type':   'application/json',
      'x-goog-api-key': GEMINI_API_KEY!,
    },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const embeddings = data.embeddings;
  if (!Array.isArray(embeddings)) {
    throw new Error('Invalid response format from Gemini Batch API');
  }

  return embeddings.map((e: { values: number[] }) => e.values);
}

// ── Upsert chunks into Supabase ───────────────────────────────
async function upsertChunks(chunks: Chunk[]): Promise<void> {
  // Keep the existing batch size of 32
  const BATCH = 32;
  let inserted = 0;

  for (let i = 0; i < chunks.length; i += BATCH) {
    const batch = chunks.slice(i, i + BATCH);
    const texts  = batch.map(c => c.content);
    const vecs   = await embed(texts);

    const rows = batch.map((chunk, idx) => ({
      content:   chunk.content,
      metadata:  { ...chunk.metadata, source_id: chunk.source_id },
      embedding: vecs[idx],
      source:    chunk.source,
    }));

    // Upsert by source_id stored in metadata
    for (const row of rows) {
      const { error } = await supabase
        .from('documents')
        .upsert(row, {
          onConflict:        'id',   // we rely on delete+insert pattern below
          ignoreDuplicates:  false,
        });

      if (error) {
        // Try delete-then-insert for upsert by source_id
        await supabase
          .from('documents')
          .delete()
          .eq('metadata->>source_id', row.metadata.source_id);

        const { error: e2 } = await supabase.from('documents').insert(row);
        if (e2) console.error(`❌ Insert error for ${row.metadata.source_id}:`, e2.message);
        else inserted++;
      } else {
        inserted++;
      }
    }

    console.log(`  ✅ Batch ${Math.floor(i / BATCH) + 1} done (${inserted} total)`);

    // Preserve the existing pause between embedding batches
    if (i + BATCH < chunks.length) await sleep(500);
  }
}

// ── MDX parser ────────────────────────────────────────────────
// ── Profile chunks ────────────────────────────────────────────
function getProfileChunks(): Chunk[] {
  return profileChunks.map(pc => ({
    source_id: pc.id,
    content:   pc.content,
    metadata:  pc.metadata,
    source:    'profile' as const,
  }));
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 AdrOS RAG Ingest — source: ${sourceFilter}\n`);
  const allChunks: Chunk[] = [];

  // MDX projects
  if (sourceFilter === 'all' || sourceFilter === 'mdx') {
    const mdxDir = path.resolve('src/content/projects');
    const files  = fs.readdirSync(mdxDir).filter(f => f.endsWith('.mdx'));
    console.log(`📂 Parsing ${files.length} MDX project files...`);
    for (const file of files) {
      const chunks = parseMdxProject(path.join(mdxDir, file));
      allChunks.push(...chunks);
      console.log(`  ✔ ${file} → ${chunks.length} chunks`);
    }
  }

  // Profile corpus
  if (sourceFilter === 'all' || sourceFilter === 'profile') {
    const chunks = getProfileChunks();
    console.log(`\n👤 Adding ${chunks.length} profile chunks...`);
    allChunks.push(...chunks);
  }

  // PDF CV
  if (sourceFilter === 'all' || sourceFilter === 'pdf') {
    const pdfPath = path.resolve('public/Adrian_Gomez_FullStackAI_ES.pdf');
    if (fs.existsSync(pdfPath)) {
      console.log('\n📄 Extracting CV PDF...');
      const chunks = await extractPdfChunks(pdfPath);
      console.log(`  ✔ ${chunks.length} chunks extracted`);
      allChunks.push(...chunks);
    } else {
      console.warn('⚠️  CV PDF not found, skipping.');
    }
  }

  console.log(`\n🔢 Total chunks to ingest: ${allChunks.length}`);
  console.log('🤗 Generating embeddings via Gemini...\n');

  await upsertChunks(allChunks);

  console.log('\n✅ Ingestion complete!');
  console.log('   Check your documents table in Supabase Dashboard.');
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
