import { useRef, useState, useCallback, useEffect } from 'react';

interface UseDragOptions {
  initialPosition: { x: number; y: number };
  onDragEnd?: (pos: { x: number; y: number }) => void;
  disabled?: boolean;
}

export function useDrag({ initialPosition, onDragEnd, disabled }: UseDragOptions) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  const clampToViewport = useCallback((x: number, y: number, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const titlebarMin = 60; // al menos 60px del titlebar visible

    return {
      x: Math.max(-rect.width + 100, Math.min(vw - 100, x)),
      y: Math.max(-rect.height + titlebarMin, Math.min(vh - titlebarMin, y)),
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
  }, [disabled, position]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    dragStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      posX: position.x,
      posY: position.y,
    };
    setIsDragging(true);
  }, [disabled, position]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      const newPos = {
        x: dragStart.current.posX + dx,
        y: dragStart.current.posY + dy,
      };
      setPosition(newPos);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const dx = touch.clientX - dragStart.current.x;
      const dy = touch.clientY - dragStart.current.y;
      const newPos = {
        x: dragStart.current.posX + dx,
        y: dragStart.current.posY + dy,
      };
      setPosition(newPos);
    };

    const handleUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      if (dragRef.current) {
        const clamped = clampToViewport(position.x, position.y, dragRef.current);
        setPosition(clamped);
        onDragEnd?.(clamped);
      } else {
        onDragEnd?.(position);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, position, clampToViewport, onDragEnd]);

  return { dragRef, position, isDragging, handleMouseDown, handleTouchStart };
}
