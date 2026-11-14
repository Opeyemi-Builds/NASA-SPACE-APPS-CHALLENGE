import { useEffect, useRef } from 'react';

interface Planet {
  name: string;
  color: string;
  size: number; // px at base scale
  orbit: number; // fraction of maxRadius
  speed: number; // radians per second
  angle: number; // starting angle
  ring?: boolean;
  glow?: string;
}

const PLANETS: Planet[] = [
  { name: 'Mercury', color: '#b8a99a', size: 2.5, orbit: 0.13, speed: 0.5, angle: 0.6 },
  { name: 'Venus', color: '#e8c07a', size: 4.5, orbit: 0.19, speed: 0.38, angle: 2.4 },
  { name: 'Earth', color: '#5aa9ff', size: 5, orbit: 0.26, speed: 0.3, angle: 4.2, glow: 'rgba(90,169,255,0.6)' },
  { name: 'Mars', color: '#ff7a59', size: 4, orbit: 0.33, speed: 0.24, angle: 1.2 },
  { name: 'Jupiter', color: '#e0b48c', size: 12, orbit: 0.47, speed: 0.13, angle: 5.3 },
  { name: 'Saturn', color: '#ecd9a8', size: 10, orbit: 0.62, speed: 0.1, angle: 2.9, ring: true },
  { name: 'Uranus', color: '#9be3e0', size: 7, orbit: 0.76, speed: 0.07, angle: 0.2 },
  { name: 'Neptune', color: '#7a8fff', size: 7, orbit: 0.9, speed: 0.055, angle: 3.6 },
];

interface Star {
  x: number; // 0..1
  y: number; // 0..1
  r: number;
  phase: number;
  speed: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

/**
 * Lightweight animated solar system rendered on a 2D canvas.
 * Cheap enough for phones: single canvas, DPR capped, pauses off-screen.
 */
export default function SolarSystem({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.75);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let last = performance.now();
    let nextMeteor = 2500;

    const stars: Star[] = Array.from({ length: 150 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.6,
    }));
    const meteors: Meteor[] = [];

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect || rect.width === 0) return;
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const onVis = () => {
      running = !document.hidden;
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    const io = new IntersectionObserver(([e]) => {
      const visible = e.isIntersecting && !document.hidden;
      if (visible && !running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!visible && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, w, h);

      // deep-space base
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, '#04060f');
      bg.addColorStop(0.55, '#070b1a');
      bg.addColorStop(1, '#0a1030');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // nebula blobs
      const neb = (x: number, y: number, r: number, c: string) => {
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, c);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      };
      neb(w * 0.15, h * 0.75, Math.max(w, h) * 0.35, 'rgba(76,60,229,0.14)');
      neb(w * 0.85, h * 0.2, Math.max(w, h) * 0.3, 'rgba(56,130,255,0.10)');

      // stars
      for (const s of stars) {
        const a = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(s.phase + t * 0.001 * s.speed));
        ctx.globalAlpha = a;
        ctx.fillStyle = '#dbe4ff';
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // solar system layout — sun offset so hero text stays readable
      const wide = w >= 768;
      const cx = w * (wide ? 0.7 : 0.5);
      const cy = h * (wide ? 0.46 : 0.32);
      const maxR = Math.min(w * (wide ? 0.34 : 0.52), h * 0.5);
      const squash = 0.52; // elliptical orbits, fits the hero band
      const sunR = wide ? 24 : 16;

      // orbit rings
      ctx.strokeStyle = 'rgba(148,163,255,0.16)';
      ctx.lineWidth = 1;
      for (const p of PLANETS) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, p.orbit * maxR, p.orbit * maxR * squash, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // sun + flickering glow
      const flicker = 1 + 0.04 * Math.sin(t * 0.003) + 0.02 * Math.sin(t * 0.011);
      const sunGlow = ctx.createRadialGradient(cx, cy, sunR * 0.4, cx, cy, sunR * 5);
      sunGlow.addColorStop(0, 'rgba(255,190,90,0.55)');
      sunGlow.addColorStop(0.35, 'rgba(255,150,60,0.18)');
      sunGlow.addColorStop(1, 'rgba(255,150,60,0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(cx - sunR * 5, cy - sunR * 5, sunR * 10, sunR * 10);
      const sunBody = ctx.createRadialGradient(cx - sunR * 0.3, cy - sunR * 0.3, 1, cx, cy, sunR * flicker);
      sunBody.addColorStop(0, '#fff7e0');
      sunBody.addColorStop(0.55, '#ffd27a');
      sunBody.addColorStop(1, '#ff9a3c');
      ctx.fillStyle = sunBody;
      ctx.beginPath();
      ctx.arc(cx, cy, sunR * flicker, 0, Math.PI * 2);
      ctx.fill();

      // planets
      const labelPx = wide ? 11 : 9;
      ctx.font = `600 ${labelPx}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      for (const p of PLANETS) {
        const a = p.angle + (t * 0.001 * p.speed);
        const px = cx + Math.cos(a) * p.orbit * maxR;
        const py = cy + Math.sin(a) * p.orbit * maxR * squash;
        const depth = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(a)); // fake light/shade
        const size = p.size * (wide ? 1 : 0.85);

        if (p.glow) {
          const g = ctx.createRadialGradient(px, py, size * 0.5, px, py, size * 2.6);
          g.addColorStop(0, p.glow);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g;
          ctx.fillRect(px - size * 2.6, py - size * 2.6, size * 5.2, size * 5.2);
        }
        const pg = ctx.createRadialGradient(px - size * 0.35, py - size * 0.35, size * 0.1, px, py, size);
        pg.addColorStop(0, '#ffffff');
        pg.addColorStop(0.25, p.color);
        pg.addColorStop(1, shade(p.color, depth * 0.55));
        ctx.fillStyle = pg;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();

        if (p.ring) {
          ctx.strokeStyle = 'rgba(236,217,168,0.65)';
          ctx.lineWidth = Math.max(1, size * 0.12);
          ctx.beginPath();
          ctx.ellipse(px, py, size * 1.7, size * 0.55, -0.35, 0, Math.PI * 2);
          ctx.stroke();
        }

        // tiny moon around Earth
        if (p.name === 'Earth') {
          const ma = t * 0.002;
          ctx.fillStyle = '#e6ecf7';
          ctx.beginPath();
          ctx.arc(px + Math.cos(ma) * (size + 6), py + Math.sin(ma) * (size + 6) * 0.6, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }

        if (p.orbit * maxR > 46) {
          ctx.fillStyle = 'rgba(219,228,255,0.6)';
          ctx.fillText(p.name, px, py + size + labelPx + 3);
        }
      }

      // meteors
      nextMeteor -= dt;
      if (nextMeteor <= 0 && meteors.length < 2) {
        nextMeteor = 4000 + Math.random() * 5000;
        const sx = w * (0.2 + Math.random() * 0.7);
        meteors.push({ x: sx, y: -10, vx: -140 - Math.random() * 120, vy: 200 + Math.random() * 140, life: 0, maxLife: 900 + Math.random() * 500 });
      }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life += dt;
        m.x += (m.vx * dt) / 1000;
        m.y += (m.vy * dt) / 1000;
        const k = 1 - m.life / m.maxLife;
        if (k <= 0) {
          meteors.splice(i, 1);
          continue;
        }
        const tx = m.x - (m.vx * 0.35 * k);
        const ty = m.y - (m.vy * 0.35 * k);
        const grad = ctx.createLinearGradient(m.x, m.y, tx, ty);
        grad.addColorStop(0, `rgba(255,255,255,${0.9 * k})`);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }

      // vignette
      const v = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.3, cx, cy, Math.max(w, h) * 0.75);
      v.addColorStop(0, 'rgba(3,6,18,0)');
      v.addColorStop(1, 'rgba(3,6,18,0.55)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);
    };

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(now - last, 100);
      last = now;
      draw(now, dt);
      if (!reduced) raf = requestAnimationFrame(frame);
    };

    if (reduced) {
      draw(1200, 0); // one static frame
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
}

/** Darken a hex color by factor f (0..1). */
function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * f);
  const g = Math.round(((n >> 8) & 255) * f);
  const b = Math.round((n & 255) * f);
  return `rgb(${r},${g},${b})`;
}
