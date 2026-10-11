import { useEffect, useRef } from 'react';

/**
 * Subtle network/particle overlay that sits ABOVE the aurora background,
 * but BELOW all page content. GPU-composited canvas; pauses when tab is hidden;
 * respects prefers-reduced-motion (renders a single still frame).
 */
export default function NetworkFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    resize();

    // Node count: tuned for ~60 nodes on a 1920px screen, fewer on smaller
    const NODE_BASE = 40;
    const MAX_LINK_DIST = 180 * dpr;
    const NODE_RADIUS = 1.4 * dpr;
    const SPEED = 0.12;

    type Node = { x: number; y: number; vx: number; vy: number };
    const nodes: Node[] = [];
    const build = () => {
      nodes.length = 0;
      const count = Math.max(20, Math.min(NODE_BASE, Math.floor(window.innerWidth / 48)));
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * SPEED,
          vy: (Math.random() - 0.5) * SPEED,
        });
      }
    };
    build();

    const draw = (t: number) => {
      const dark = document.documentElement.classList.contains('dark');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodeColor = dark ? 'rgba(140, 160, 220, 0.55)' : 'rgba(70, 100, 200, 0.35)';
      const linkColor = dark ? 'rgba(120, 140, 220,' : 'rgba(80, 110, 210,';

      // Update positions (unless reduced motion)
      if (!reduce) {
        for (const n of nodes) {
          n.x += n.vx * dpr;
          n.y += n.vy * dpr;
          if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
          if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        }
      }

      // Draw links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_LINK_DIST) {
            const alpha = (1 - d / MAX_LINK_DIST) * 0.35;
            ctx.strokeStyle = linkColor + alpha + ')';
            ctx.lineWidth = 0.7 * dpr;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      ctx.fillStyle = nodeColor;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      if (!visibleRef.current) {
        rafRef.current = null;
        return;
      }
      draw(t);
      rafRef.current = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      visibleRef.current = !document.hidden;
      if (visibleRef.current && rafRef.current === null && !reduce) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    const onResize = () => { resize(); build(); if (reduce) draw(0); };

    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);

    if (reduce) {
      draw(0);
    } else {
      rafRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="nx-network-fx"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -9,
        pointerEvents: 'none',
        opacity: 0.55,
      }}
    />
  );
}
