import { describe, expect, it } from 'vitest';
import { composeContactMessage, CONTACT_MESSAGE_MAX, emptyContactDraft } from '../src/lib/contact.js';

describe('contact composer', () => {
  it('creates a clean session draft without durable storage', () => {
    const first = emptyContactDraft();
    first.name = 'Visitor';
    expect(emptyContactDraft().name).toBe('');
  });
  it('includes subject without changing the contact persistence contract', () => {
    expect(composeContactMessage({ subject: ' Role ', message: 'Hello' })).toBe('Subject: Role\n\nHello');
    expect(composeContactMessage({ subject: '', message: 'Hello' })).toBe('Hello');
  });
  it('counts subject overhead against the existing server message limit', () => {
    expect(composeContactMessage({ subject: 'Role', message: 'a'.repeat(1985) }).length).toBe(CONTACT_MESSAGE_MAX);
    expect(composeContactMessage({ subject: 'Role', message: 'a'.repeat(1986) }).length).toBeGreaterThan(CONTACT_MESSAGE_MAX);
  });
});
