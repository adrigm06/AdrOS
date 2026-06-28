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
  type: 'project' | 'profile' | 'contact';
  projectId?: string;
}

/** Default sizes clamped to viewport so windows fit any screen. */
function defaultSize(type: 'project' | 'profile' | 'contact') {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;

  if (type === 'profile') {
    return {
      width: Math.min(560, vw * 0.88),
      height: Math.min(420, vh * 0.72),
    };
  }
  if (type === 'contact') {
    return {
      width: Math.min(480, vw * 0.88),
      height: Math.min(460, vh * 0.82),
    };
  }
  return {
    width: Math.min(720, vw * 0.92),
    height: Math.min(560, vh * 0.82),
  };
}

export const WINDOW_MIN = { width: 280, height: 240 };

const MAX_WINDOWS = 5;

let _zCounter = 0;

function randomOffset() {
  return (Math.random() - 0.5) * 40;
}

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowState[]>([]);

  const openWindow = useCallback((id: string, type: 'project' | 'profile' | 'contact', title: string, projectId?: string) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        if (existing.isMinimized) {
          return prev.map(w =>
            w.id === id ? { ...w, isMinimized: false, zIndex: ++_zCounter } : w
          );
        }
        return prev.map(w =>
          w.id === id ? { ...w, zIndex: ++_zCounter } : w
        );
      }

      const size = defaultSize(type);
      const centerX = Math.max(0, (window.innerWidth - size.width) / 2 + randomOffset());
      const centerY = Math.max(0, (window.innerHeight - size.height) / 2 + randomOffset() - 20);

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

  const updateSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === id
          ? {
              ...w,
              size: {
                width: Math.max(WINDOW_MIN.width, Math.min(size.width, window.innerWidth - 20)),
                height: Math.max(WINDOW_MIN.height, Math.min(size.height, window.innerHeight - 40)),
              },
            }
          : w
      )
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
    updateSize,
  };
}
