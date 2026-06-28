import { useState, useTransition } from 'react';
import { actions, isInputError } from 'astro:actions';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lang } from '@/hooks/useLanguage';

interface ContactFormProps {
  lang: Lang;
  onClose: () => void;
}

const TEXTS = {
  es: {
    subject: '$ contacto --tema consulta',
    labelName: 'Nombre',
    placeholderName: 'Tu nombre',
    labelContact: 'Email / Contacto',
    placeholderContact: 'tu@email.com o @usuario',
    labelMessage: 'Mensaje',
    placeholderMessage: 'Cuéntame sobre tu proyecto...',
    optional: '(opcional)',
    rateLimitError: 'Demasiadas solicitudes. Por favor, inténtalo más tarde.',
    genericError: 'Algo salió mal. Por favor, inténtalo de nuevo.',
    buttonSending: 'Enviando...',
    buttonSend: '$ enviar_mensaje',
    successTitle: 'Mensaje enviado con éxito',
    successSubtitle: 'Me pondré en contacto contigo pronto.',
  },
  en: {
    subject: '$ contact --subject inquiry',
    labelName: 'Name',
    placeholderName: 'Your name',
    labelContact: 'Email / Contact',
    placeholderContact: 'your@email.com',
    labelMessage: 'Message',
    placeholderMessage: 'Tell me about your project...',
    optional: '(optional)',
    rateLimitError: 'Too many submissions. Please try again later.',
    genericError: 'Something went wrong. Please try again.',
    buttonSending: 'Sending...',
    buttonSend: '$ send_message',
    successTitle: 'Message sent successfully',
    successSubtitle: 'I will get back to you soon.',
  },
};

export default function ContactForm({ lang, onClose }: ContactFormProps) {
  const t = TEXTS[lang];
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const [errorId, setErrorId] = useState<string | null>(null);

  const getFieldError = (fieldName: string) =>
    errors.find(e => e.field === fieldName)?.message;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    setErrorId(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const response = await actions.submitContact(formData);

        if (response.error) {
          if (isInputError(response.error)) {
            const fieldErrors = Object.entries(response.error.fields).map(([field, msgs]) => ({
              field,
              message: (msgs as string[])?.[0] || 'Invalid field',
            }));
            setErrors(fieldErrors);
          } else {
            setErrorId('generic');
          }
          return;
        }

        if (response.data?.success) {
          setSuccess(true);
          setTimeout(() => onClose(), 2500);
        } else {
          setErrorId(response.data?.errorId || 'generic');
        }
      } catch {
        setErrorId('generic');
      }
    });
  };

  const inputClass = (hasError?: boolean) =>
    `w-full bg-[var(--os-bg)] border ${hasError ? 'border-[var(--os-danger)] focus:border-[var(--os-danger)]' : 'border-[var(--os-border)] focus:border-[var(--os-accent)]'} rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-sans text-[var(--os-text)] placeholder:text-[var(--os-muted)] focus:outline-none transition-colors duration-150`;

  return (
    <AnimatePresence mode="wait">
      {success ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center select-none"
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--os-ok)] shadow-[0_0_12px_rgba(40,200,64,0.3)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0a0c12" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label={t.successTitle}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="font-mono text-sm text-[var(--os-accent)] font-semibold">
            {t.successTitle}
          </p>
          <p className="font-sans text-xs text-[var(--os-text-dim)]">
            {t.successSubtitle}
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4 p-5 h-full overflow-y-auto"
        >
          <h2 className="font-mono text-sm text-[var(--os-accent)] font-medium">
            {t.subject}
          </h2>

          {/* Honeypot - invisible to humans */}
          <div className="absolute opacity-0 -z-50 w-0 h-0 overflow-hidden pointer-events-none">
            <label htmlFor="website_hp">Website</label>
            <input type="text" id="website_hp" name="website_hp" tabIndex={-1} autoComplete="off" />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="font-mono text-[10px] uppercase tracking-wider text-[var(--os-muted)] select-none">
              {t.labelName}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              disabled={isPending}
              placeholder={t.placeholderName}
              className={inputClass(!!getFieldError('name'))}
            />
            {getFieldError('name') && (
              <span className="font-mono text-[10px] text-[var(--os-danger)]">
                {getFieldError('name')}
              </span>
            )}
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="contactInfo" className="font-mono text-[10px] uppercase tracking-wider text-[var(--os-muted)] select-none">
              {t.labelContact}
            </label>
            <input
              type="text"
              id="contactInfo"
              name="contactInfo"
              required
              disabled={isPending}
              placeholder={t.placeholderContact}
              className={inputClass(!!getFieldError('contactInfo'))}
            />
            {getFieldError('contactInfo') && (
              <span className="font-mono text-[10px] text-[var(--os-danger)]">
                {getFieldError('contactInfo')}
              </span>
            )}
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1.5 flex-1">
            <label htmlFor="message" className="font-mono text-[10px] uppercase tracking-wider text-[var(--os-muted)] select-none">
              {t.labelMessage} <span className="normal-case font-normal text-[var(--os-muted)]">{t.optional}</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              disabled={isPending}
              placeholder={t.placeholderMessage}
              className={`${inputClass()} resize-none flex-1 min-h-[90px] leading-relaxed`}
            />
          </div>

          {/* Error banners */}
          {errorId === 'rate_limit' && (
            <div className="p-3 rounded-[var(--radius-md)] border text-xs font-mono border-[var(--os-danger)] bg-[rgba(255,95,87,0.08)] text-[var(--os-danger)]">
              {t.rateLimitError}
            </div>
          )}
          {errorId === 'generic' && (
            <div className="p-3 rounded-[var(--radius-md)] border text-xs font-mono border-[var(--os-danger)] bg-[rgba(255,95,87,0.08)] text-[var(--os-danger)]">
              {t.genericError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 rounded-[var(--radius-md)] font-mono text-xs font-semibold transition-all duration-150 flex items-center justify-center hover:brightness-110 active:scale-[0.98]"
            style={{
              backgroundColor: isPending ? 'var(--os-surface-2)' : 'var(--os-accent)',
              color: isPending ? 'var(--os-muted)' : 'var(--os-bg)',
              border: isPending ? '1px solid var(--os-border)' : '1px solid var(--os-accent)',
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-[var(--os-muted)] border-t-transparent rounded-full animate-spin" />
                {t.buttonSending}
              </span>
            ) : (
              t.buttonSend
            )}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
