import { useState, useCallback } from 'react';

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  type: 'project' | 'profile';
  projectId?: string;
}

export const WINDOW_DEFAULTS = {
  project: { width: 720, height: 520 },
  profile: { width: 560, height: 380 },
};

const MAX_WINDOWS = 5;

let _zCounter = 0;

function randomOffset() {
  return (Math.random() - 0.5) * 40; // -20 to +20
}

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([]);

  const openWindow = useCallback((id: string, type: 'project' | 'profile', title: string, projectId?: string) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        // Si está minimizada, restaurar; si está abierta, traer al frente
        if (existing.isMinimized) {
          return prev.map(w =>
            w.id === id ? { ...w, isMinimized: false, zIndex: ++_zCounter } : w
          );
        }
        return prev.map(w =>
          w.id === id ? { ...w, zIndex: ++_zCounter } : w
        );
      }

      const size = type === 'profile' ? WINDOW_DEFAULTS.profile : WINDOW_DEFAULTS.project;
      const centerX = Math.max(0, (window.innerWidth - size.width) / 2 + randomOffset());
      const centerY = Math.max(0, (window.innerHeight - size.height) / 2 + randomOffset());

      const newWindow: WindowState = {
        id,
        title,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        position: { x: centerX, y: centerY },
        size,
        zIndex: ++_zCounter,
        type,
        projectId,
      };

      // Si hay >= MAX_WINDOWS, minimizar la de zIndex más bajo
      let updated = [...prev, newWindow];
      if (updated.filter(w => w.isOpen && !w.isMinimized).length > MAX_WINDOWS) {
        const lowest = [...updated]
          .filter(w => w.isOpen && !w.isMinimized && w.id !== id)
          .sort((a, b) => a.zIndex - b.zIndex);
        if (lowest.length > 0) {
          updated = updated.map(w =>
            w.id === lowest[0].id ? { ...w, isMinimized: true } : w
          );
        }
      }

      return updated;
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => w.id === id ? { ...w, isMinimized: true } : w)
    );
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
      )
    );
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: ++_zCounter } : w)
    );
  }, []);

  const bringToFront = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => w.id === id ? { ...w, zIndex: ++_zCounter } : w)
    );
  }, []);

  const updatePosition = useCallback((id: string, pos: { x: number; y: number }) => {
    setWindows(prev =>
      prev.map(w => w.id === id ? { ...w, position: pos } : w)
    );
  }, []);

  const minimizedWindows = windows.filter(w => w.isMinimized);

  return {
    windows,
    minimizedWindows,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    bringToFront,
    updatePosition,
  };
}
