import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Lang } from '@/hooks/useLanguage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWindowProps {
  lang: Lang;
}

const SUPABASE_URL  = import.meta.env.PUBLIC_SUPABASE_URL ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const EDGE_FN_URL   = `${SUPABASE_URL}/functions/v1/chat`;

const WELCOME: Record<Lang, string> = {
  es: '¡Hola! Soy AdrBOT, el asistente de Adrián impulsado por IA. Pregúntame sobre sus proyectos, stack tecnológico o experiencia profesional.',
  en: "Hi! I'm AdrBOT, Adrián's AI-powered assistant. Ask me about his projects, tech stack, or professional background.",
};

const I18N = {
  es: {
    placeholder: 'Escribe una pregunta para AdrBOT...',
    thinking:    'Pensando...',
    error:       'Algo salió mal al conectar con el servidor. Inténtalo de nuevo.',
    send:        'Enviar',
  },
  en: {
    placeholder: 'Ask AdrBOT anything about Adrián...',
    thinking:    'Thinking...',
    error:       'Something went wrong connecting to the server. Please try again.',
    send:        'Send',
  },
} as const;

function SiriThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-2 h-2 rounded-full"
          style={{
            background: i === 0 ? 'var(--os-blue)' : i === 1 ? 'var(--os-violet)' : '#ec4899',
          }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <img
          src="/icons/siri.webp"
          alt="Siri"
          className="w-6 h-6 object-contain mr-2 mt-0.5 flex-shrink-0"
        />
      )}
      <div
        className={`max-w-[85%] sm:max-w-[78%] rounded-[16px] px-4 py-2.5 text-[13px] leading-relaxed font-sans whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-[var(--os-blue)] text-white shadow-sm rounded-br-[4px]'
            : 'bg-white/10 text-white/90 border border-white/10 rounded-bl-[4px] backdrop-blur-md'
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatWindow({ lang }: ChatWindowProps) {
  const t = I18N[lang];
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME[lang] },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    try {
      if (!SUPABASE_URL || !SUPABASE_ANON) {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: lang === 'es'
              ? 'El servicio de IA no está configurado (falta PUBLIC_SUPABASE_URL o PUBLIC_SUPABASE_ANON_KEY en las variables de entorno).'
              : 'AI service is not configured (missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY in environment variables).',
          },
        ]);
        return;
      }

      const history = messages
        .filter(m => m.role !== 'assistant' || m.content !== WELCOME[lang])
        .slice(-6);

      const res = await fetch(EDGE_FN_URL, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON}`,
          'apikey':        SUPABASE_ANON,
        },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) {
        let errorMsg: string = t.error;
        try {
          const errData = await res.json();
          if (errData?.error) {
            errorMsg = `${t.error} (${String(errData.error)})`;
          }
        } catch {
          // ignore json parse error
        }
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: errorMsg },
        ]);
        return;
      }

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          role:    'assistant',
          content: data.answer ?? t.error,
        },
      ]);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : t.error;
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `${t.error} [${errMsg}]` },
      ]);
    } finally {
      setThinking(false);
    }
  }, [input, thinking, messages, lang, t.error]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[rgba(16,18,26,0.85)] overflow-hidden">
      {/* Siri Header */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/5 bg-white/[0.02] flex-shrink-0">
        <div className="relative">
          <img src="/icons/siri.webp" alt="Siri" className="w-5 h-5 object-contain" />
          <div className="absolute -inset-0.5 rounded-full bg-[var(--os-blue)]/30 blur-[4px] -z-10" />
        </div>
        <div className="flex flex-col">
          <span className="font-sans text-xs font-semibold text-white tracking-tight">AdrBOT</span>
          <span className="font-sans text-[10px] text-white/50">
            {lang === 'es' ? 'Asistente de Inteligencia Artificial' : 'Artificial Intelligence Assistant'}
          </span>
        </div>
      </div>

      {/* Messages list */}
      <div
        className="flex-1 overflow-y-auto p-4 sm:p-5"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
      >
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {thinking && (
          <div className="flex items-center gap-2 mb-3">
            <img src="/icons/siri.webp" alt="Siri" className="w-6 h-6 object-contain flex-shrink-0" />
            <div className="rounded-[16px] rounded-bl-[4px] bg-white/10 border border-white/10 backdrop-blur-md">
              <SiriThinkingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input container (Spotlight / Siri style prompt) */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-[rgba(22,25,36,0.6)] flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-[14px] bg-white/10 border border-white/15 focus-within:border-[var(--os-blue)] transition-all">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={t.placeholder}
            disabled={thinking}
            className="flex-1 bg-transparent outline-none font-sans text-xs text-white placeholder-white/40"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || thinking}
            aria-label={t.send}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              input.trim() && !thinking
                ? 'bg-[var(--os-blue)] text-white shadow-md hover:scale-105 active:scale-95'
                : 'bg-white/10 text-white/30 cursor-default'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a.75.75 0 0 1 .75.75v10.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V1.75A.75.75 0 0 1 8 1z" transform="rotate(180 8 8)"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
