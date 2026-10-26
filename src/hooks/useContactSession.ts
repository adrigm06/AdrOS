import { useRef, useState } from 'react';
import { actions, isInputError } from 'astro:actions';
import { composeContactMessage, CONTACT_MESSAGE_MAX, emptyContactDraft, type ContactDraft } from '@/lib/contact';

export function useContactSession() {
  const [draft, setDraft] = useState<ContactDraft>(emptyContactDraft);
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const request = useRef(0);
  const inFlight = useRef(false);

  const reset = () => {
    request.current += 1;
    inFlight.current = false;
    setDraft(emptyContactDraft()); setPending(false); setSuccess(false); setError(null); setFieldErrors({});
  };
  const update = (field: keyof ContactDraft, value: string) => setDraft(previous => ({ ...previous, [field]: value }));
  const submit = async (honeypot: string) => {
    if (inFlight.current) return;
    const message = composeContactMessage(draft);
    if (message.length > CONTACT_MESSAGE_MAX) { setError('too_long'); return; }
    const id = ++request.current;
    inFlight.current = true;
    setPending(true); setError(null); setFieldErrors({});
    const data = new FormData();
    data.set('name', draft.name.trim()); data.set('contactInfo', draft.contactInfo.trim());
    data.set('message', message); data.set('website_hp', honeypot);
    try {
      const response = await actions.submitContact(data);
      if (id !== request.current) return;
      if (response.error) {
        if (isInputError(response.error)) {
          setFieldErrors(Object.fromEntries(Object.entries(response.error.fields).map(([field, errors]) => [field, errors?.[0] ?? 'Invalid field'])));
        } else setError('generic');
      } else if (response.data?.success) { setSuccess(true); setDraft(emptyContactDraft()); }
      else setError(response.data?.errorId ?? 'generic');
    } catch { if (id === request.current) setError('generic'); }
    finally { if (id === request.current) { inFlight.current = false; setPending(false); } }
  };
  return { draft, update, pending, success, error, fieldErrors, submit, reset };
}
export type ContactSession = ReturnType<typeof useContactSession>;
