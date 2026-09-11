import React, { useEffect, useState, useRef } from 'react';

/**
 * CyberCursor — Next-Gen Ambient Cybernetic Pointer & Stardust Energy Trail
 *
 * Features:
 *  - Fluid lerped follower glow responding to current mood theme
 *  - Ethereal stardust particle wake when cursor moves
 *  - Interactive click burst ripple & energy shockwave
 *  - Automatic touch device detection & eco mode bypass
 */
const CyberCursor = ({ moodKey = 'HAPPY', perfMode = 'balanced' }) => {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const particles = useRef([]);
  const ripples = useRef([]);
  const isMoving = useRef(false);
  const moveTimer = useRef(null);

  // Theme-driven particle & glow palette
  const getPalette = (mood) => {
    switch (mood) {
      case 'ANGRY':
        return {
          glow: 'rgba(239, 68, 68, 0.45)',
          core: '#ef4444',
          trail: ['#f87171', '#fb923c', '#ef4444', '#fca5a5'],
        };
      case 'STRESSED':
        return {
          glow: 'rgba(245, 158, 11, 0.45)',
          core: '#f59e0b',
          trail: ['#fbbf24', '#f97316', '#fcd34d', '#f59e0b'],
        };
      case 'COLD':
        return {
          glow: 'rgba(56, 189, 248, 0.45)',
          core: '#38bdf8',
          trail: ['#7dd3fc', '#bae6fd', '#38bdf8', '#e0f2fe'],
        };
      case 'EXCITED':
        return {
          glow: 'rgba(236, 72, 153, 0.5)',
          core: '#ec4899',
          trail: ['#f472b6', '#c084fc', '#e879f9', '#fbcfe8'],
        };
      case 'NEUTRAL':
        return {
          glow: 'rgba(99, 102, 241, 0.4)',
          core: '#6366f1',
          trail: ['#818cf8', '#a5b4fc', '#6366f1', '#c7d2fe'],
        };
      case 'SAD':
        return {
          glow: 'rgba(100, 116, 139, 0.35)',
          core: '#94a3b8',
          trail: ['#cbd5e1', '#94a3b8', '#64748b', '#e2e8f0'],
        };
      case 'LONELY':
        return {
          glow: 'rgba(168, 85, 247, 0.45)',
          core: '#a855f7',
          trail: ['#c084fc', '#e9d5ff', '#8b5cf6', '#d8b4fe'],
        };
      default:
        // HAPPY
        return {
          glow: 'rgba(16, 185, 129, 0.45)',
          core: '#10b981',
          trail: ['#34d399', '#6ee7b7', '#10b981', '#a7f3d0'],
        };
    }
  };

  const palette = getPalette(moodKey);

  useEffect(() => {
    // Check for touch screens / pointer fine support
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch || perfMode === 'eco') {
      return;
    }
    setMounted(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handlePointerMove = (e) => {
      const prevX = mousePos.current.x;
      const prevY = mousePos.current.y;
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      isMoving.current = true;
      clearTimeout(moveTimer.current);
      moveTimer.current = setTimeout(() => {
        isMoving.current = false;
      }, 120);

      // Spawn stardust particles on movement
      const dist = Math.hypot(e.clientX - prevX, e.clientY - prevY);
      if (dist > 3) {
        const spawnCount = Math.min(3, Math.floor(dist / 8) + 1);
        const colors = palette.trail;
        for (let i = 0; i < spawnCount; i++) {
          particles.current.push({
            x: e.clientX + (Math.random() - 0.5) * 6,
            y: e.clientY + (Math.random() - 0.5) * 6,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5 - 0.4,
            size: Math.random() * 2.5 + 1.2,
            alpha: 0.85,
            color: colors[Math.floor(Math.random() * colors.length)],
            life: 1.0,
            decay: 0.035 + Math.random() * 0.03,
            spin: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const handlePointerDown = (e) => {
      // Spawn burst ripple
      ripples.current.push({
        x: e.clientX,
        y: e.clientY,
        r: 2,
        maxR: 36,
        alpha: 0.9,
      });

      // Spawn burst sparks
      const colors = palette.trail;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 + Math.random() * 0.4;
        const speed = 2 + Math.random() * 3.5;
        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 1.5,
          alpha: 1.0,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1.0,
          decay: 0.04 + Math.random() * 0.03,
          spin: Math.random() * Math.PI * 2,
        });
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerDown);

    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min(Math.max((now - lastTime) / 16.67, 0.5), 2.0);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Lerp cursor position
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.35 * dt;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.35 * dt;

      const cx = currentPos.current.x;
      const cy = currentPos.current.y;

      // Draw active ambient glow under cursor
      if (cx > 0 && cy > 0 && cx < width && cy < height) {
        const glowRad = isMoving.current ? 30 : 20;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRad);
        grad.addColorStop(0, palette.glow);
        grad.addColorStop(0.5, palette.glow.replace('0.45', '0.15').replace('0.5', '0.18'));
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // Core central luminous micro-dot
        ctx.fillStyle = palette.core;
        ctx.shadowColor = palette.core;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw & update click ripples
      for (let i = ripples.current.length - 1; i >= 0; i--) {
        const rp = ripples.current[i];
        rp.r += 2.2 * dt;
        rp.alpha -= 0.045 * dt;
        if (rp.alpha <= 0 || rp.r >= rp.maxR) {
          ripples.current.splice(i, 1);
        } else {
          ctx.strokeStyle = palette.core;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = Math.max(0, rp.alpha);
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1.0;
        }
      }

      // Draw & update stardust particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= p.decay * dt;

        if (p.life <= 0) {
          particles.current.splice(i, 1);
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.life * p.alpha);
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1.0;
        }
      }

      // Keep pool bounded
      if (particles.current.length > 90) {
        particles.current.splice(0, particles.current.length - 90);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      clearTimeout(moveTimer.current);
    };
  }, [palette, perfMode]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
};

export default React.memo(CyberCursor);
