import { validateChatInput, type ChatInput } from './core.ts';

/** Validate at the HTTP boundary before the callback can access keys or APIs. */
export async function handleChatRequest(
  req: Request,
  respond: (input: ChatInput) => Promise<Response>,
  headers: Record<string, string> = {},
): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers });
  }
  let input: ChatInput;
  try {
    input = validateChatInput(await req.json());
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Invalid request' }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' },
    });
  }
  return respond(input);
}
