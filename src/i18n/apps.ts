import type { Lang } from '@/hooks/useLanguage';

export const mailEnglish = {
  newMessage: 'New message', to: 'To', copy: 'Copy email', copied: 'Email copied', copyFailed: 'Could not copy. Select the email address.',
  name: 'Your name', email: 'Your email', subject: 'Subject', message: 'Message', send: 'Send message', sending: 'Sending…',
  saved: 'Message received', savedDetail: 'Your message was saved for Adrian to review. This form does not send email through Gmail.',
  close: 'Close', discard: 'Discard draft', tooLong: 'Subject and message must fit within 2,000 characters.',
  rateLimit: 'Too many submissions. Please try again later.', error: 'Your message could not be saved. Your draft is still here.',
  privacy: 'Portfolio contact form, not a Google service. Drafts stay only in this browser session.',
};

export const mailSpanish = {
  newMessage: 'Nuevo mensaje', to: 'Para', copy: 'Copiar correo', copied: 'Correo copiado', copyFailed: 'No se pudo copiar. Selecciona la dirección de correo.',
  name: 'Tu nombre', email: 'Tu correo', subject: 'Asunto', message: 'Mensaje', send: 'Enviar mensaje', sending: 'Enviando…',
  saved: 'Mensaje recibido', savedDetail: 'Tu mensaje se ha guardado para que Adrián lo revise. Este formulario no envía correos a través de Gmail.',
  close: 'Cerrar', discard: 'Descartar borrador', tooLong: 'El asunto y el mensaje deben ocupar como máximo 2.000 caracteres.',
  rateLimit: 'Demasiadas solicitudes. Inténtalo más tarde.', error: 'No se ha podido guardar el mensaje. Tu borrador sigue aquí.',
  privacy: 'Formulario del portafolio, no es un servicio de Google. El borrador solo se conserva durante esta sesión del navegador.',
};

const copy = { en: mailEnglish, es: mailSpanish };
export const appCopy = (lang: Lang) => copy[lang];
