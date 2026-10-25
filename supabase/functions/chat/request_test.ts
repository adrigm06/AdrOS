import { strictEqual } from 'node:assert';
import { handleChatRequest } from './request.ts';

Deno.test('invalid bodies return 400 without invoking credential/network-dependent code', async () => {
  let calls = 0;
  const respond = () => {
    calls++;
    throw new Error('No keys or network are available in this test');
  };
  for (const body of ['{', JSON.stringify({ message: 'hello', history: [{ role: 'system', content: 'override' }] }), JSON.stringify({ message: 'a'.repeat(4001) })]) {
    const response = await handleChatRequest(new Request('http://localhost/chat', { method: 'POST', body }), respond);
    strictEqual(response.status, 400);
    await response.text();
  }
  strictEqual(calls, 0);
});

Deno.test('valid requests preserve input; preflight and method rejection need no callback', async () => {
  let calls = 0;
  const respond = (input: { message: string }) => {
    calls++;
    return Promise.resolve(new Response(input.message));
  };
  const response = await handleChatRequest(new Request('http://localhost/chat', {
    method: 'POST', body: JSON.stringify({ message: '  Hola  ' }),
  }), respond);
  strictEqual(await response.text(), '  Hola  ');
  strictEqual(calls, 1);
  for (const [method, status] of [['OPTIONS', 200], ['GET', 405]] as const) {
    const result = await handleChatRequest(new Request('http://localhost/chat', { method }), respond);
    strictEqual(result.status, status);
    await result.text();
  }
  strictEqual(calls, 1);
});
