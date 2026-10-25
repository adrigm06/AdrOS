export const SYSTEM_PROMPT = `
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
export function detectLang(text: string): 'es' | 'en' {
  const esWords = /\b(qué|cómo|cuál|dónde|tienes|hola|gracias|puedes|quiero|sobre|proyecto|me|es|de|en|con|tu|mi|una|un|los|las|del|al)\b/i;
  return esWords.test(text) ? 'es' : 'en';
}

export const MAX_MESSAGE_LENGTH = 4000;
export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}
export interface ChatInput {
  message: string;
  history: HistoryMessage[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validContent(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_MESSAGE_LENGTH;
}

export function validateChatInput(value: unknown): ChatInput {
  if (!isRecord(value) || !validContent(value.message)) {
    throw new Error('Message must be a non-empty string of at most 4000 characters');
  }
  const history = value.history === undefined ? [] : value.history;
  if (!Array.isArray(history)) throw new Error('History must be an array');
  const validated = history.map((entry: unknown): HistoryMessage => {
    if (!isRecord(entry) || (entry.role !== 'user' && entry.role !== 'assistant') || !validContent(entry.content)) {
      throw new Error('History requires user/assistant roles and non-empty content of at most 4000 characters');
    }
    return { role: entry.role, content: entry.content };
  });
  return { message: value.message, history: validated };
}

export function buildMessages(message: string, history: HistoryMessage[], docs: { content: string }[]) {
  const context = docs.map((doc) => doc.content).join('\n\n---\n\n');
  const systemContext = context ? `\nRelevant context about Adrián:\n\n${context}` : '';
  return [
    { role: 'system' as const, content: SYSTEM_PROMPT + systemContext },
    ...history.slice(-6),
    { role: 'user' as const, content: message },
  ];
}
