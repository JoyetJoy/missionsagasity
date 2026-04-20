import { useEffect, useRef } from 'react';

/**
 * Draws 3 long, smooth, abstract gold curved lines across the viewport.
 * Each line uses a unique seeded bezier path.
 * Rendered as a fixed canvas behind all content.
 */
export function GoldCurvesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const seedRef = useRef(Math.random() * 10000);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const baseSeed = seedRef.current;

      // 3 curve configs with different vertical bands and opacities
      const curves = [
        {
          opacity: 0.25,
          lineWidth: 3,
          points: generateSmoothPath(w, h, 0.05, 0.35, 8, baseSeed + 1),
        },
        {
          opacity: 0.18,
          lineWidth: 2.5,
          points: generateSmoothPath(w, h, 0.3, 0.7, 9, baseSeed + 2),
        },
        {
          opacity: 0.22,
          lineWidth: 2.8,
          points: generateSmoothPath(w, h, 0.6, 0.95, 7, baseSeed + 3),
        },
      ];

      curves.forEach((curve) => {
        ctx.save();
        ctx.strokeStyle = `rgba(212, 175, 55, ${curve.opacity})`;
        ctx.lineWidth = curve.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const pts = curve.points;
        if (pts.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);

        // Catmull-Rom to Bezier for smooth curves
        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[Math.max(i - 1, 0)];
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const p3 = pts[Math.min(i + 2, pts.length - 1)];

          const tension = 0.35;
          const cp1x = p1.x + (p2.x - p0.x) * tension;
          const cp1y = p1.y + (p2.y - p0.y) * tension;
          const cp2x = p2.x - (p3.x - p1.x) * tension;
          const cp2y = p2.y - (p3.y - p1.y) * tension;

          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
        }

        ctx.stroke();
        ctx.restore();
      });
    };

    draw();

    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}

/** Generate a smooth flowing path across the full page height */
function generateSmoothPath(
  w: number,
  h: number,
  xMinFrac: number,
  xMaxFrac: number,
  segments: number,
  seed: number
) {
  const points: { x: number; y: number }[] = [];
  const seededRandom = createSeededRandom(seed);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * h;
    // X oscillates within the band with smooth randomness
    const xCenter = w * ((xMinFrac + xMaxFrac) / 2);
    const xRange = w * (xMaxFrac - xMinFrac);
    const offset = (seededRandom() - 0.5) * xRange * 1.5;
    const x = xCenter + offset;
    points.push({ x: Math.max(0, Math.min(w, x)), y });
  }

  return points;
}

/** Simple seeded pseudo-random for deterministic curves */
function createSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}