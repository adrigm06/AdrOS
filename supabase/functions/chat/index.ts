import { createClient } from 'npm:@supabase/supabase-js@2.108.2';
import { EMBEDDING_DIMENSIONS } from '../_shared/embedding.ts';
import { buildMessages, detectLang } from './core.ts';
import { handleChatRequest } from './request.ts';

// ── CORS ──────────────────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, prefer',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── Embed via Google Gemini (gemini-embedding-2) ─────────────
async function embedText(text: string, geminiKey: string): Promise<number[]> {
  if (!geminiKey) throw new Error('GEMINI_API_KEY is not set in Supabase secrets');
  
  // Use gemini-embedding-2 (768 dimensions), which is active on the user's account
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent';
  
  const res = await fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type':    'application/json',
      'x-goog-api-key':  geminiKey,
    },
    body: JSON.stringify({
      content: {
        parts: [{ text }],
      },
      outputDimensionality: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini embed failed: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const values = data.embedding?.values;
  if (!Array.isArray(values)) {
    throw new Error('Invalid embedding response format from Gemini');
  }
  return values;
}

// ── Main handler ──────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  return handleChatRequest(req, async ({ message, history }) => {
    try {
      const GROQ_KEY   = Deno.env.get('GROQ_API_KEY')!;
      const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY')!;
      const SB_URL     = Deno.env.get('SUPABASE_URL')!;
      const SB_KEY     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      const supabase = createClient(SB_URL, SB_KEY);
      const lang     = detectLang(message);

      // 1. Embed the user's question
      const embedding = await embedText(message, GEMINI_KEY);

      // 2. Semantic search in pgvector
      const { data: docs, error: matchError } = await supabase.rpc('match_documents', {
        query_embedding:  embedding,
        match_threshold:  0.15, // Lowered threshold since gemini-embedding-2 has a different cosine range
        match_count:      5,
      });

      if (matchError) {
        console.error('pgvector error:', matchError.message);
      } else {
        console.log(`[RAG] Semantic search found ${docs?.length ?? 0} documents.`);
        docs?.forEach((d: { similarity: number; metadata: { source_id: string } }) => {
          console.log(` - Chunk: ${d.metadata?.source_id} (Similarity: ${d.similarity})`);
        });
      }

      const messages = buildMessages(message, history, docs ?? []);

      // 4. Call Groq API (active available model)
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method:  'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
          'Content-Type':  'application/json',
        },
        body: JSON.stringify({
          model:       'openai/gpt-oss-120b',
          messages,
          temperature: 0.5,
          max_tokens:  800,
        }),
      });

      if (!groqRes.ok) {
        const err = await groqRes.text();
        throw new Error(`Groq API error ${groqRes.status}: ${err}`);
      }

      const groqData = await groqRes.json();
      const answer   = groqData.choices?.[0]?.message?.content ?? '';

      // 5. Log to chat_logs (fire and forget)
      supabase.from('chat_logs').insert({
        question: message,
        answer,
        lang,
        sources: (docs ?? []).map((d: { metadata: unknown }) => d.metadata),
      }).then(({ error }) => {
        if (error) console.error('Log error:', error.message);
      });

      // 6. Return response
      return new Response(
        JSON.stringify({
          answer,
          sources: (docs ?? []).map((d: { metadata: unknown }) => d.metadata),
          lang,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (err) {
      const errorDetails = err instanceof Error ? err.message : String(err);
      console.error('Edge function error:', errorDetails);
      return new Response(
        JSON.stringify({ error: errorDetails }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }, corsHeaders);
});
