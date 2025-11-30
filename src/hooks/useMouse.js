import { useEffect, useRef } from "react";

export function useMouse() {
  // pos = posición actual suavizada
  const pos = useRef({ x: innerWidth / 2, y: innerHeight / 2 });
  const target = useRef({ x: innerWidth / 2, y: innerHeight / 2 });

  useEffect(() => {
    const onMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  function update() {
    const ease = 0.1; // mismo easing que en tu render
    pos.current.x += (target.current.x - pos.current.x) * ease;
    pos.current.y += (target.current.y - pos.current.y) * ease;
    return pos.current;
  }

  return { update };
}
