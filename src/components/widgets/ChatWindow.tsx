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
  es: '¡Hola! Soy AdrBOT, el asistente de Adrián. Pregúntame sobre sus proyectos o perfil profesional.',
  en: "Hi! I'm AdrBOT, Adrián's assistant. Ask me about his projects or professional background.",
};

const I18N = {
  es: {
    placeholder: 'Pregúntame sobre Adrián o sus proyectos...',
    thinking:    'Pensando...',
    error:       'Algo salió mal. Inténtalo de nuevo.',
    send:        'Enviar',
  },
  en: {
    placeholder: 'Ask me about Adrián or his projects...',
    thinking:    'Thinking...',
    error:       'Something went wrong. Please try again.',
    send:        'Send',
  },
} as const;

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: 'var(--os-accent)' }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className="max-w-[80%] rounded-xl px-4 py-2.5 text-xs leading-relaxed font-mono whitespace-pre-wrap"
        style={
          isUser
            ? { background: 'var(--os-accent)', color: '#0a0c12' }
            : {
                background: 'var(--os-surface-3)',
                color:      'var(--os-text-dim)',
                border:     '1px solid var(--os-border)',
              }
        }
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

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          role:    'assistant',
          content: data.answer ?? t.error,
        },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: t.error },
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
    <div className="flex flex-col h-full bg-[var(--os-surface)] overflow-hidden">
      {/* Messages list */}
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--os-border) transparent' }}
      >
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {thinking && (
          <div className="flex justify-start mb-3">
            <div
              className="rounded-xl"
              style={{ background: 'var(--os-surface-3)', border: '1px solid var(--os-border)' }}
            >
              <ThinkingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input container */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid var(--os-border)', background: 'var(--os-surface-2)' }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t.placeholder}
          disabled={thinking}
          className="flex-1 bg-transparent outline-none font-mono text-xs"
          style={{
            color:      'var(--os-text)',
            caretColor: 'var(--os-accent)',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || thinking}
          aria-label={t.send}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all flex-shrink-0"
          style={{
            background: input.trim() && !thinking ? 'var(--os-accent)' : 'var(--os-surface-3)',
            color:      input.trim() && !thinking ? '#0a0c12' : 'var(--os-muted)',
            border:     '1px solid var(--os-border)',
            cursor:     input.trim() && !thinking ? 'pointer' : 'default',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
