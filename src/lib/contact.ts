export interface ContactDraft { name: string; contactInfo: string; subject: string; message: string }
export const emptyContactDraft = (): ContactDraft => ({ name: '', contactInfo: '', subject: '', message: '' });
export const CONTACT_MESSAGE_MAX = 2000;

export function composeContactMessage(draft: Pick<ContactDraft, 'subject' | 'message'>): string {
  const subject = draft.subject.trim();
  return subject ? `Subject: ${subject}\n\n${draft.message}` : draft.message;
}
