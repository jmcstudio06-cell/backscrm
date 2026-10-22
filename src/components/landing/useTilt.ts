import { useRef, type MouseEvent } from "react";

/**
 * Presentation-only 3D tilt that follows the pointer.
 * Returns props to spread on the element that should tilt.
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(maxDeg = 8) {
  const ref = useRef<T>(null);

  const onMouseMove = (event: MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1100px) rotateX(${(-y * maxDeg).toFixed(2)}deg) rotateY(${(x * maxDeg).toFixed(2)}deg)`;
  };

  const onMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return { ref, onMouseMove, onMouseLeave };
}
