import { deepStrictEqual, strictEqual, throws } from 'node:assert';
import { buildMessages, detectLang, MAX_MESSAGE_LENGTH, SYSTEM_PROMPT, validateChatInput } from './core.ts';

Deno.test('valid input preserves text and defaults missing history', () => {
  deepStrictEqual(validateChatInput({ message: '  Hola  ' }), { message: '  Hola  ', history: [] });
});

Deno.test('message and history content enforce inclusive 4000-character limits', () => {
  const content = 'a'.repeat(MAX_MESSAGE_LENGTH);
  strictEqual(validateChatInput({ message: content, history: [{ role: 'assistant', content }] }).message.length, 4000);
  for (const message of [null, 12, '', '  ', 'a'.repeat(4001)]) {
    throws(() => validateChatInput({ message }));
  }
  for (const content of [null, 12, '', '  ', 'a'.repeat(4001)]) {
    throws(() => validateChatInput({ message: 'hello', history: [{ role: 'user', content }] }));
  }
});

Deno.test('all entries must have user/assistant roles, including history outside the last six', () => {
  for (const role of ['system', 'developer', 'tool', '', null, 1]) {
    const history = [{ role, content: 'bad' }, ...Array.from({ length: 7 }, () => ({ role: 'user', content: 'ok' }))];
    throws(() => validateChatInput({ message: 'hello', history }));
  }
  for (const history of [null, {}, 'history', [null], [1], [{ role: 'user' }]]) {
    throws(() => validateChatInput({ message: 'hello', history }));
  }
  for (const body of [null, [], 'hello', 1]) throws(() => validateChatInput(body));
});

Deno.test('prompt order, context separators, last six messages and language remain unchanged', () => {
  const history = Array.from({ length: 8 }, (_, i) => ({ role: 'user' as const, content: `turn ${i}` }));
  const messages = buildMessages('question', history, [{ content: 'first' }, { content: 'second' }]);
  deepStrictEqual(messages, [
    { role: 'system', content: `${SYSTEM_PROMPT}\nRelevant context about Adrián:\n\nfirst\n\n---\n\nsecond` },
    ...history.slice(2),
    { role: 'user', content: 'question' },
  ]);
  strictEqual(buildMessages('question', [], [])[0].content, SYSTEM_PROMPT);
  strictEqual(history.length, 8);
  strictEqual(detectLang('hola, puedes explicar este proyecto'), 'es');
  strictEqual(detectLang('Tell us about your work'), 'en');
});
