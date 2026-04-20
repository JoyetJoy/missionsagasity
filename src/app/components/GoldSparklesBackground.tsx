import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export function GoldSparklesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animFrameRef = useRef<number>(0);
  const dimRef = useRef({ w: 0, h: 0 });

  const PARTICLE_COUNT = 120;
  const REPEL_RADIUS = 130;
  const REPEL_FORCE = 8;
  const RETURN_SPEED = 0.03;
  const FRICTION = 0.92;

  const initParticles = useCallback((w: number, h: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: 0,
        vy: 0,
        size: 1.5 + Math.random() * 3,
        opacity: 0.15 + Math.random() * 0.45,
        baseOpacity: 0.15 + Math.random() * 0.45,
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (dimRef.current.w === 0) {
        initParticles(w, h);
      }
      dimRef.current = { w, h };
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    // Listen on window so we capture mouse position even over other elements
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', (e: MouseEvent) => {
      if (!e.relatedTarget) handleMouseLeave();
    });

    const animate = () => {
      const { w, h } = dimRef.current;
      ctx.clearRect(0, 0, w, h);
      const time = performance.now() / 1000;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (const p of particlesRef.current) {
        // Repel from mouse
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 0) {
          const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Spring back to base position
        p.vx += (p.baseX - p.x) * RETURN_SPEED;
        p.vy += (p.baseY - p.y) * RETURN_SPEED;

        // Apply friction
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Twinkle effect
        const twinkle = Math.sin(time * p.twinkleSpeed + p.twinkleOffset);
        p.opacity = p.baseOpacity * (0.5 + 0.5 * twinkle);

        // Draw sparkle
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        glow.addColorStop(0, `rgba(245, 215, 128, ${p.opacity})`);
        glow.addColorStop(0.4, `rgba(212, 175, 55, ${p.opacity * 0.6})`);
        glow.addColorStop(1, `rgba(212, 175, 55, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Draw bright center dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 245, 210, ${p.opacity * 1.2})`;
        ctx.fill();

        // Draw cross sparkle for larger particles
        if (p.size > 2.5) {
          const armLen = p.size * 1.8;
          const armOpacity = p.opacity * 0.4;
          ctx.strokeStyle = `rgba(245, 215, 128, ${armOpacity})`;
          ctx.lineWidth = 0.5;

          ctx.beginPath();
          ctx.moveTo(p.x - armLen, p.y);
          ctx.lineTo(p.x + armLen, p.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(p.x, p.y - armLen);
          ctx.lineTo(p.x, p.y + armLen);
          ctx.stroke();
        }
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}