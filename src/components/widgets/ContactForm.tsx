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
    subject: 'Nuevo mensaje',
    labelName: 'Nombre',
    placeholderName: 'Tu nombre',
    labelContact: 'Email / Contacto',
    placeholderContact: 'tu@email.com o @usuario',
    labelMessage: 'Mensaje',
    placeholderMessage: 'Cuéntame sobre tu proyecto o consulta...',
    optional: '(opcional)',
    rateLimitError: 'Demasiadas solicitudes. Por favor, inténtalo más tarde.',
    genericError: 'Algo salió mal. Por favor, inténtalo de nuevo.',
    buttonSending: 'Enviando...',
    buttonSend: 'Enviar mensaje',
    toRecipient: 'Para: adriglc6@gmail.com',
    successTitle: 'Mensaje enviado con éxito',
    successSubtitle: 'Me pondré en contacto contigo pronto.',
  },
  en: {
    subject: 'New Message',
    labelName: 'Name',
    placeholderName: 'Your name',
    labelContact: 'Email / Contact',
    placeholderContact: 'your@email.com',
    labelMessage: 'Message',
    placeholderMessage: 'Tell me about your project or inquiry...',
    optional: '(optional)',
    rateLimitError: 'Too many submissions. Please try again later.',
    genericError: 'Something went wrong. Please try again.',
    buttonSending: 'Sending...',
    buttonSend: 'Send Message',
    toRecipient: 'To: adriglc6@gmail.com',
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

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
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
    `w-full bg-white/5 border ${hasError ? 'border-[var(--os-danger)] focus:border-[var(--os-danger)]' : 'border-white/10 focus:border-[var(--os-blue)]'} rounded-[8px] px-3 py-2 text-xs font-sans text-white placeholder:text-white/30 focus:outline-none transition-colors duration-150`;

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
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--os-ok)] shadow-[0_0_16px_rgba(40,200,64,0.4)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label={t.successTitle}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="font-sans text-sm text-white font-semibold">
            {t.successTitle}
          </p>
          <p className="font-sans text-xs text-white/60">
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
          className="flex flex-col gap-3.5 p-5 h-full overflow-y-auto"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <img src="/icons/mail.webp" alt="Mail" className="w-5 h-5 object-contain" />
              <h2 className="font-sans text-xs text-white/90 font-medium">
                {t.subject}
              </h2>
            </div>
            <span className="text-[11px] font-sans text-white/40">
              {t.toRecipient}
            </span>
          </div>

          {/* Honeypot - invisible to humans */}
          <div className="absolute opacity-0 -z-50 w-0 h-0 overflow-hidden pointer-events-none">
            <label htmlFor="website_hp">Website</label>
            <input type="text" id="website_hp" name="website_hp" tabIndex={-1} autoComplete="off" />
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="font-sans text-[11px] font-medium text-white/70 select-none">
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
              <span className="font-sans text-[10px] text-[var(--os-danger)]">
                {getFieldError('name')}
              </span>
            )}
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-1">
            <label htmlFor="contactInfo" className="font-sans text-[11px] font-medium text-white/70 select-none">
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
              <span className="font-sans text-[10px] text-[var(--os-danger)]">
                {getFieldError('contactInfo')}
              </span>
            )}
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1 flex-1">
            <label htmlFor="message" className="font-sans text-[11px] font-medium text-white/70 select-none">
              {t.labelMessage} <span className="text-white/40">{t.optional}</span>
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
            <div className="p-2.5 rounded-[8px] border text-xs font-sans border-[var(--os-danger)]/40 bg-[var(--os-danger)]/10 text-[var(--os-danger)]">
              {t.rateLimitError}
            </div>
          )}
          {errorId === 'generic' && (
            <div className="p-2.5 rounded-[8px] border text-xs font-sans border-[var(--os-danger)]/40 bg-[var(--os-danger)]/10 text-[var(--os-danger)]">
              {t.genericError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-[8px] font-sans text-xs font-semibold text-white transition-all duration-150 flex items-center justify-center hover:brightness-110 active:scale-[0.98] shadow-sm"
            style={{
              backgroundColor: isPending ? 'rgba(255,255,255,0.1)' : 'var(--os-blue)',
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
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
