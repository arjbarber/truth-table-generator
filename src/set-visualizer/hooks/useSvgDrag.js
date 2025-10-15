import { useCallback, useRef } from 'react';

// Handles pointer-based dragging within SVGs, normalizing the coordinates to the viewBox.
const useSvgDrag = () => {
  const svgRef = useRef(null);

  const getPoint = useCallback((event) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 180;
    const y = ((event.clientY - rect.top) / rect.height) * 120;
    return { x, y };
  }, []);

  const createDragHandler = useCallback(
    (onMove) => (event) => {
      event.preventDefault();
      const target = event.currentTarget;
      const pointerId = event.pointerId;

      const handleMove = (moveEvent) => {
        onMove(getPoint(moveEvent));
      };

      const endDrag = () => {
        target.removeEventListener('pointermove', handleMove);
        target.removeEventListener('pointerup', endDrag);
        target.removeEventListener('pointercancel', endDrag);
        try {
          target.releasePointerCapture(pointerId);
        } catch (error) {
          // ignore release errors
        }
      };

      try {
        target.setPointerCapture(pointerId);
      } catch (error) {
        // ignore capture errors
      }

      target.addEventListener('pointermove', handleMove);
      target.addEventListener('pointerup', endDrag);
      target.addEventListener('pointercancel', endDrag);
    },
    [getPoint],
  );

  return { svgRef, createDragHandler };
};

export default useSvgDrag;
