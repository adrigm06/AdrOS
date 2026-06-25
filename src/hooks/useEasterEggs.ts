import { useEffect, useRef, useState, useCallback } from 'react';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export interface EasterEgg {
  id: number;
  x: number;
  y: number;
}

export function useKonamiCode() {
  const [eggs, setEggs] = useState<EasterEgg[]>([]);
  const sequenceRef = useRef<string[]>([]);
  const idCounter = useRef(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target !== document.body && (e.target as HTMLElement).tagName === 'INPUT') return;
      sequenceRef.current.push(e.key);
      sequenceRef.current = sequenceRef.current.slice(-KONAMI_CODE.length);

      const isMatch = sequenceRef.current.length === KONAMI_CODE.length &&
        sequenceRef.current.every((k, i) => k.toLowerCase() === KONAMI_CODE[i].toLowerCase());

      if (isMatch) {
        sequenceRef.current = [];
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const id = ++idCounter.current;
        setEggs((prev) => [
          ...prev,
          { id, x: vw / 2 + (Math.random() - 0.5) * 160, y: vh / 2 + (Math.random() - 0.5) * 120 },
        ]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const updateEgg = useCallback((id: number, x: number, y: number) => {
    setEggs((prev) => prev.map((e) => (e.id === id ? { ...e, x, y } : e)));
  }, []);

  return { eggs, updateEgg };
}

export function useLsCommand() {
  const bufferRef = useRef<string[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target !== document.body && (e.target as HTMLElement).tagName !== 'BODY') return;
      bufferRef.current.push(e.key.toLowerCase());
      bufferRef.current = bufferRef.current.slice(-2);

      if (bufferRef.current.join('') === 'ls') {
        showNotification('$ ls projects/\nandrobox  betterprompt  android-skill-pkg  komea  petconnect  lovepage  vantagesystems  smart-lead-qualification');
        bufferRef.current = [];
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}

function showNotification(text: string) {
  const existing = document.getElementById('adros-notification');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'adros-notification';
  el.style.cssText = `
    position: fixed;
    bottom: 56px;
    right: 16px;
    z-index: 99999;
    background: var(--os-surface-2, #1e2433);
    border: 1px solid var(--os-border, #2a2f3d);
    border-radius: var(--radius-md, 8px);
    padding: 12px 16px;
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 12px;
    color: var(--os-accent, #00d4aa);
    white-space: pre-wrap;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    animation: slideIn 0.3s ease-out;
    max-width: 360px;
  `;
  el.textContent = text;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    el.style.opacity = '0';
    el.style.transform = 'translateX(100px)';
    setTimeout(() => { el.remove(); style.remove(); }, 300);
  }, 4000);
}
