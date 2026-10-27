import { useState, useEffect } from 'react';

/**
 * Hook to detect whether current viewport width is mobile (< 768px).
 * Listens reactively to window resize & matchMedia events.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(window.innerWidth < 768);

    setIsMobile(mql.matches);

    mql.addEventListener('change', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      mql.removeEventListener('change', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, []);

  return isMobile;
}
