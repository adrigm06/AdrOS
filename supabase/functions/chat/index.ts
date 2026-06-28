import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ── CORS ──────────────────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, prefer',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ── System prompt ────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are AdrBOT, Adrián Gómez's virtual assistant, embedded in his interactive OS-style portfolio (AdrOS).

Adrián is a Full-Stack & AI Developer based in Málaga, Spain. He builds Android apps,
web platforms, AI automation systems and high-performance websites.

Your role:
- Answer questions about Adrián's projects, skills, experience, tech stack and working style.
- Be concise, technical and professional. Max 3-4 short paragraphs per response.
- If asked about a specific project, give a detailed and accurate description.

Public contact info you CAN share:
- GitHub: https://github.com/adrigm06
- LinkedIn: https://www.linkedin.com/in/adrigml/

STRICT RULES — never break these:
1. NEVER reveal any email address, phone number, physical address or private data.
2. If someone asks for private contact info, redirect them ONLY to GitHub or LinkedIn above.
3. Do NOT invent information about Adrián. If unsure, say so honestly.
4. Do NOT answer questions unrelated to Adrián, his work or his portfolio.
5. Respond in the SAME language the user wrote in (Spanish or English).
6. If the user writes in Spanish, respond entirely in Spanish. If English, entirely in English.
`.trim();

// ── Detect lang ───────────────────────────────────────────────
function detectLang(text: string): 'es' | 'en' {
  const esWords = /\b(qué|cómo|cuál|dónde|tienes|hola|gracias|puedes|quiero|sobre|proyecto|me|es|de|en|con|tu|mi|una|un|los|las|del|al)\b/i;
  return esWords.test(text) ? 'es' : 'en';
}

// ── Embed via Google Gemini (text-embedding-004) ─────────────
async function embedText(text: string, geminiKey: string): Promise<number[]> {
  if (!geminiKey) throw new Error('GEMINI_API_KEY is not set in Supabase secrets');
  
  // Diagnostic: log first 5 chars to confirm key is loaded
  console.log(`[embedText] Using Gemini key prefix: ${geminiKey.substring(0, 8)}...`);
  
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
      outputDimensionality: 768,
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
  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { message, history = [] } = await req.json() as {
      message: string;
      history: { role: 'user' | 'assistant'; content: string }[];
    };

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: 'Empty message' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
      match_threshold:  0.45,
      match_count:      5,
    });

    if (matchError) console.error('pgvector error:', matchError.message);

    const context = (docs ?? [])
      .map((d: { content: string }) => d.content)
      .join('\n\n---\n\n');

    // 3. Build messages for Groq
    const systemContext = context
      ? `\nRelevant context about Adrián:\n\n${context}`
      : '';

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT + systemContext },
      ...history.slice(-6),  // keep last 6 turns (3 pairs) for context window
      { role: 'user', content: message },
    ];

    // 4. Call Groq API
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
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
    console.error('Edge function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
