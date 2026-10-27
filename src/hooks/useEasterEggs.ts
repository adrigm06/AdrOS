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
