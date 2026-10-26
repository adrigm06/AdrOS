import { useState } from 'react';
import type { Lang } from '@/hooks/useLanguage';
import type { ContactSession } from '@/hooks/useContactSession';
import { PERSONAL } from '@/data/personal';
import { composeContactMessage, CONTACT_MESSAGE_MAX, type ContactDraft } from '@/lib/contact';
import { appCopy } from '@/i18n/apps';

interface Props { lang: Lang; onClose: () => void; session: ContactSession }

export default function ContactForm({ lang, onClose, session }: Props) {
  const t = appCopy(lang);
  const [copyStatus, setCopyStatus] = useState('');
  const { draft, pending, success, error, fieldErrors, update, submit, reset } = session;
  const length = composeContactMessage(draft).length;
  const copyEmail = async () => {
    try { await navigator.clipboard.writeText(PERSONAL.email); setCopyStatus(t.copied); }
    catch { setCopyStatus(t.copyFailed); }
  };
  if (success) return <div className="mail-composer justify-center p-6 gap-4" role="status">
    <h2 className="text-xl font-semibold">✓ {t.saved}</h2><p>{t.savedDetail}</p><button className="browser-tool self-start" onClick={onClose}>{t.close}</button>
  </div>;
  const field = (key: keyof ContactDraft, label: string, type = 'text', maxLength = 200) => <div className="mail-field">
    <label htmlFor={`contact-${key}`}>{label}</label>
    <input id={`contact-${key}`} name={key} type={type} required={key === 'name' || key === 'contactInfo'} maxLength={maxLength}
      autoComplete={key === 'name' ? 'name' : key === 'contactInfo' ? 'email' : 'off'} value={draft[key]} onChange={e => update(key, e.target.value)}
      disabled={pending} aria-invalid={!!fieldErrors[key]} aria-describedby={fieldErrors[key] ? `error-${key}` : undefined} />
    {fieldErrors[key] && <span className="mail-error" id={`error-${key}`}>{fieldErrors[key]}</span>}
  </div>;
  return <form className="mail-composer" onSubmit={event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void submit(String(data.get('website_hp') ?? ''));
  }}>
    <header className="mail-heading"><h2>{t.newMessage}</h2><span className="text-xs text-[var(--os-muted)]">AdrOS Mail</span></header>
    <div className="mail-fields">
    <div className="mail-field flex-wrap">
      <span>{t.to}</span><span className="select-text text-sm">{PERSONAL.email}</span>
      <button type="button" className="browser-tool ml-auto" onClick={copyEmail}>{t.copy}</button>
      <span className="w-full text-xs" role="status">{copyStatus}</span>
    </div>
    <div className="absolute opacity-0 -z-50 w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <label htmlFor="website_hp">Website</label><input id="website_hp" type="text" name="website_hp" tabIndex={-1} autoComplete="off" />
    </div>
    {field('name', t.name)}
    {field('contactInfo', t.email, 'email', 254)}
    {field('subject', t.subject, 'text', 160)}
    <label className="sr-only" htmlFor="contact-message">{t.message}</label>
    <textarea id="contact-message" name="message" className="mail-body" placeholder={t.message} value={draft.message} maxLength={CONTACT_MESSAGE_MAX}
      onChange={event => update('message', event.target.value)} disabled={pending} aria-invalid={length > CONTACT_MESSAGE_MAX || !!fieldErrors.message}
      aria-describedby="contact-message-status" />
    </div>
    <footer className="mail-footer">
    <div id="contact-message-status" className="px-5 text-xs" aria-live="polite">
      <span className={length > CONTACT_MESSAGE_MAX ? 'mail-error' : 'text-[var(--os-muted)]'}>{length}/{CONTACT_MESSAGE_MAX}</span>
      {fieldErrors.message && <p className="mail-error">{fieldErrors.message}</p>}
      {error && <p className="mail-error" role="alert">{error === 'too_long' ? t.tooLong : error === 'rate_limit' ? t.rateLimit : t.error}</p>}
    </div>
      <div className="flex justify-between gap-3"><button className="browser-tool browser-primary" type="submit" disabled={pending || length > CONTACT_MESSAGE_MAX}>{pending ? t.sending : t.send} →</button>
        <button className="browser-tool" type="button" disabled={pending} onClick={reset}>{t.discard}</button></div>
      <p className="text-[11px] text-[var(--os-muted)] mt-3">{t.privacy}</p>
    </footer>
  </form>;
}
