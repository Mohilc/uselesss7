import React, { useEffect, useRef } from 'react';

/**
 * ClimateEffect — Ultra-Immersive Interactive Weather & Climate Physics Engine
 * 
 * Features:
 *  - SUNNY:  Dynamic sunbeam god-rays, chromatic caustics, floating golden pollen,
 *            bioluminescent fireflies that organically flutter toward cursor, click dust burst.
 *  - RAINY:  3D multi-layered depth rain, physics splashes with gravity, perspective ground ripples,
 *            realistic glass condensation droplets, interactive click water ripples.
 *  - STORM:  Heavy deluge squall, high-voltage forked branching lightning bolts, chromatic screen rumble,
 *            flying glowing cyber debris, interactive click lightning strikes & spark arcs!
 *  - HOT:    Turbulent incandescent fire embers with micro-spark bursts, animated sine heat shimmer waves,
 *            bottom furnace magma radiance, swirling mouse vortex interaction.
 *  - COLD:   3D tumbling geometric hexagonal snowflakes, creeping needle frost crystalline vignette,
 *            multi-spectrum waving Aurora Borealis curtain bands, interactive frost flurry.
 *  - INTERACTIVE MOUSE PHYSICS: Cursor wake vectors stir atmospheric particles in real time.
 */

function createGlowSprite(r, innerColor, midColor, outerColor) {
  const c = document.createElement('canvas');
  const d = r * 2;
  c.width = d;
  c.height = d;
  const cx = c.getContext('2d');
  const g = cx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, innerColor);
  g.addColorStop(0.38, midColor);
  g.addColorStop(1, outerColor);
  cx.fillStyle = g;
  cx.beginPath();
  cx.arc(r, r, r, 0, Math.PI * 2);
  cx.fill();
  return c;
}

const ClimateEffect = ({ climate = 'SUNNY', perfMode = 'balanced' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setupCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    setupCanvasSize();

    const handleResize = () => {
      setupCanvasSize();
    };
    window.addEventListener('resize', handleResize);

    // High-performance GPU sprite textures for zero-allocation rendering
    const fireflySprite = createGlowSprite(36, 'rgba(255, 250, 160, 1)', 'rgba(255, 215, 60, 0.45)', 'rgba(255, 200, 30, 0)');
    const sunMoteSprite = createGlowSprite(32, 'rgba(255, 235, 140, 0.95)', 'rgba(245, 190, 70, 0.35)', 'rgba(240, 160, 30, 0)');
    const emberSprite = createGlowSprite(36, 'rgba(255, 220, 120, 1)', 'rgba(255, 80, 20, 0.65)', 'rgba(200, 20, 0, 0)');
    const sparkSprite = createGlowSprite(24, 'rgba(255, 255, 255, 1)', 'rgba(180, 220, 255, 0.6)', 'rgba(100, 180, 255, 0)');

    // Mouse pointer physics tracker
    const pointer = {
      x: -500,
      y: -500,
      prevX: -500,
      prevY: -500,
      vx: 0,
      vy: 0,
      active: false,
    };

    const handlePointerMove = (e) => {
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.vx = (pointer.x - pointer.prevX) * 0.4;
      pointer.vy = (pointer.y - pointer.prevY) * 0.4;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.x = -500;
      pointer.y = -500;
      pointer.vx = 0;
      pointer.vy = 0;
    };

    // Pools & Simulation State
    let particles = [];
    let ripples = [];
    let splashes = [];
    let lightningBolts = [];
    let windStreaks = [];
    let fogWisps = [];
    let smokeTendrils = [];
    let glassDrops = [];
    let interactiveSparks = [];

    const handlePointerDown = (e) => {
      const px = e.clientX;
      const py = e.clientY;

      if (climate === 'RAINY' || climate === 'STORM') {
        ripples.push({
          x: px,
          y: py,
          r: 2,
          maxR: 35 + Math.random() * 20,
          alpha: 0.85,
        });
        // Splash burst on click
        for (let s = 0; s < 6; s++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 1.5 + Math.random() * 3.5;
          splashes.push({
            x: px,
            y: py,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd - 1,
            alpha: 0.85,
            size: 1.2 + Math.random() * 1.6,
          });
        }
      }

      if (climate === 'STORM') {
        // Trigger manual lightning towards cursor
        lightningBolts.push({
          segments: generateLightningBolt(px + (Math.random() - 0.5) * 80, 0, px, py),
          alpha: 1.0,
          thickness: 4.0,
        });
        for (let i = 0; i < 12; i++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 2 + Math.random() * 5;
          interactiveSparks.push({
            x: px,
            y: py,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            life: 1.0,
            decay: 0.04 + Math.random() * 0.04,
            size: 1.5 + Math.random() * 2,
            color: 'rgba(190, 225, 255, 1)',
          });
        }
      }

      if (climate === 'HOT') {
        // Burst of glowing embers
        for (let i = 0; i < 14; i++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 1.8 + Math.random() * 4.5;
          particles.push({
            x: px,
            y: py,
            size: Math.random() * 3.5 + 1.5,
            speedY: Math.sin(a) * spd - 1.5,
            speedX: Math.cos(a) * spd,
            alpha: 1.0,
            hue: 20 + Math.random() * 25,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.02,
            glow: true,
            isSpark: Math.random() > 0.4,
            turbulence: 0.05,
          });
        }
      }

      if (climate === 'COLD') {
        // Ice crystal burst
        for (let i = 0; i < 10; i++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 1.2 + Math.random() * 3.5;
          interactiveSparks.push({
            x: px,
            y: py,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd,
            life: 1.0,
            decay: 0.03 + Math.random() * 0.03,
            size: 2 + Math.random() * 2,
            color: 'rgba(215, 245, 255, 0.95)',
          });
        }
      }

      if (climate === 'SUNNY') {
        // Golden pollen burst
        for (let i = 0; i < 12; i++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 1.0 + Math.random() * 3.0;
          particles.push({
            x: px,
            y: py,
            size: Math.random() * 5 + 2,
            speedY: Math.sin(a) * spd - 0.5,
            speedX: Math.cos(a) * spd,
            alpha: 0.9,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.03,
            hue: 45,
            isFirefly: false,
            glowRadius: 15,
          });
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('pointerdown', handlePointerDown);

    const perfMultiplier = perfMode === 'eco' ? 0.35 : perfMode === 'ultra' ? 1.3 : 0.88;
    const basePCount = {
      SUNNY: 75,
      RAINY: 190,
      STORM: 260,
      HOT: 130,
      COLD: 150,
    }[climate] || 75;
    const pCount = Math.round(basePCount * perfMultiplier);

    // Main particle generator
    function createParticle(type, w, h, randomY = false) {
      switch (type) {
        case 'RAINY':
        case 'STORM': {
          const isStorm = type === 'STORM';
          const layer = Math.random();
          let speed, len, thickness, alpha;
          if (layer < 0.32) {
            speed = (isStorm ? 15 : 10) + Math.random() * 6;
            len = 12 + Math.random() * 12;
            thickness = 0.9;
            alpha = 0.16 + Math.random() * 0.16;
          } else if (layer < 0.72) {
            speed = (isStorm ? 22 : 15) + Math.random() * 9;
            len = 20 + Math.random() * 18;
            thickness = 1.3 + Math.random() * 0.5;
            alpha = 0.38 + Math.random() * 0.25;
          } else {
            speed = (isStorm ? 28 : 19) + Math.random() * 11;
            len = 30 + Math.random() * 24;
            thickness = (isStorm ? 2.4 : 1.8) + Math.random() * 0.8;
            alpha = 0.6 + Math.random() * 0.35;
          }
          return {
            x: Math.random() * (w + 260) - 130,
            y: randomY ? Math.random() * h : -30 - Math.random() * 120,
            speed,
            windX: isStorm ? 3.8 + Math.random() * 4.8 : 0.7 + Math.random() * 0.9,
            len,
            thickness,
            alpha,
            layer,
            splashChance: isStorm ? 0.7 : 0.4,
          };
        }

        case 'HOT': {
          const isSpark = Math.random() > 0.8;
          return {
            x: Math.random() * w,
            y: randomY ? Math.random() * h : h + 15 + Math.random() * 40,
            size: isSpark ? Math.random() * 2.0 + 0.8 : Math.random() * 5.0 + 1.4,
            speedY: -(Math.random() * (isSpark ? 4.0 : 2.6) + 0.9),
            speedX: (Math.random() - 0.5) * (isSpark ? 3.4 : 1.9),
            alpha: Math.random() * 0.85 + 0.25,
            hue: Math.random() > 0.25 ? 18 + Math.random() * 30 : 2 + Math.random() * 16,
            life: 1.0,
            decay: isSpark ? 0.006 + Math.random() * 0.009 : 0.0028 + Math.random() * 0.0036,
            glow: Math.random() > 0.55,
            isSpark,
            turbulence: Math.random() * 0.05 + 0.02,
          };
        }

        case 'COLD': {
          const isCrystal = Math.random() > 0.52;
          const size = isCrystal ? Math.random() * 3.8 + 1.8 : Math.random() * 4.8 + 1.0;
          return {
            x: Math.random() * w,
            y: randomY ? Math.random() * h : -20 - Math.random() * 50,
            size,
            speedY: Math.random() * 1.5 + 0.45,
            swing: 2.0 + Math.random() * 3.0,
            swingSpeed: 0.01 + Math.random() * 0.02,
            alpha: Math.random() * 0.75 + 0.25,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.04,
            isCrystal,
            sparkle: Math.random() * Math.PI * 2,
          };
        }

        default:
          // SUNNY
          const isFirefly = Math.random() > 0.7;
          return {
            x: Math.random() * w,
            y: randomY ? Math.random() * h : h + 20,
            size: isFirefly ? Math.random() * 4 + 2 : Math.random() * 7 + 2,
            speedY: -(Math.random() * (isFirefly ? 0.85 : 0.52) + 0.16),
            speedX: (Math.random() - 0.5) * (isFirefly ? 0.75 : 0.38),
            alpha: Math.random() * 0.48 + 0.15,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.02 + Math.random() * 0.025,
            hue: 40 + Math.random() * 22,
            isFirefly,
            glowRadius: Math.random() * 16 + 10,
          };
      }
    }

    for (let i = 0; i < pCount; i++) {
      particles.push(createParticle(climate, width, height, true));
    }

    // Glass drops for RAIN / STORM
    if (climate === 'RAINY' || climate === 'STORM') {
      const dropCount = Math.round((climate === 'STORM' ? 24 : 16) * perfMultiplier);
      for (let i = 0; i < dropCount; i++) {
        glassDrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 1.5 + Math.random() * 3.5,
          speed: 0.1 + Math.random() * 0.4,
          trail: [],
          trailLength: 6 + Math.floor(Math.random() * 8),
          nextSlide: 50 + Math.floor(Math.random() * 200),
          sliding: false,
          slideSpeed: 2.2 + Math.random() * 3,
        });
      }
    }

    // Fog wisps for COLD / STORM
    if (climate === 'COLD' || climate === 'STORM') {
      for (let i = 0; i < 9; i++) {
        fogWisps.push({
          x: Math.random() * width,
          y: height * (0.25 + Math.random() * 0.75),
          w: 260 + Math.random() * 380,
          h: 45 + Math.random() * 80,
          speedX: (Math.random() - (climate === 'STORM' ? 0.2 : 0.4)) * 0.95,
          alpha: 0.035 + Math.random() * 0.065,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    // Wind streaks for STORM
    function createWindStreak(w, h) {
      return {
        x: -90 + Math.random() * (w + 160),
        y: Math.random() * h,
        len: 70 + Math.random() * 140,
        speed: 12 + Math.random() * 18,
        thickness: 0.9 + Math.random() * 1.3,
        alpha: 0.07 + Math.random() * 0.12,
        life: 1.0,
        debris: Math.random() > 0.55 ? { size: 1.8 + Math.random() * 2.2, rot: 0, rotSpeed: 0.12 } : null,
      };
    }

    if (climate === 'STORM') {
      for (let i = 0; i < 24; i++) {
        windStreaks.push(createWindStreak(width, height));
      }
    }

    // Smoke tendrils for HOT
    if (climate === 'HOT') {
      for (let i = 0; i < 14; i++) {
        smokeTendrils.push({
          x: Math.random() * width,
          y: height + 20 + Math.random() * 40,
          size: 28 + Math.random() * 60,
          speedY: -(0.45 + Math.random() * 0.75),
          speedX: (Math.random() - 0.5) * 0.55,
          alpha: 0.032 + Math.random() * 0.055,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    // Procedural Lightning Bolt
    function generateLightningBolt(startX, startY, endX, endY) {
      const segments = [];
      const steps = 10 + Math.floor(Math.random() * 7);
      let cx = startX, cy = startY;
      const dx = (endX - startX) / steps;
      const dy = (endY - startY) / steps;

      segments.push({ x: cx, y: cy });
      for (let i = 1; i < steps; i++) {
        cx += dx + (Math.random() - 0.5) * 95;
        cy += dy + (Math.random() - 0.5) * 28;
        segments.push({ x: cx, y: cy });

        if (Math.random() < 0.32) {
          const branchLen = 3 + Math.floor(Math.random() * 4);
          let bx = cx, by = cy;
          const branchSegs = [{ x: bx, y: by }];
          for (let j = 0; j < branchLen; j++) {
            bx += (Math.random() - 0.5) * 75;
            by += 20 + Math.random() * 32;
            branchSegs.push({ x: bx, y: by });
          }
          segments.push({ branch: branchSegs });
        }
      }
      segments.push({ x: endX, y: endY });
      return segments;
    }

    function drawLightningSegments(c, segments, alpha, thickness) {
      c.save();
      c.strokeStyle = `rgba(225, 235, 255, ${alpha})`;
      c.lineWidth = thickness;
      c.shadowColor = 'rgba(180, 210, 255, 0.95)';
      c.shadowBlur = 20;
      c.beginPath();

      let started = false;
      for (const seg of segments) {
        if (seg.branch) {
          c.stroke();
          c.beginPath();
          c.lineWidth = Math.max(0.7, thickness * 0.55);
          for (let i = 0; i < seg.branch.length; i++) {
            if (i === 0) c.moveTo(seg.branch[i].x, seg.branch[i].y);
            else c.lineTo(seg.branch[i].x, seg.branch[i].y);
          }
          c.stroke();
          c.beginPath();
          c.lineWidth = thickness;
          started = false;
        } else {
          if (!started) {
            c.moveTo(seg.x, seg.y);
            started = true;
          } else {
            c.lineTo(seg.x, seg.y);
          }
        }
      }
      c.stroke();
      c.restore();
    }

    // Ice crystal geometry
    function drawIceCrystal(c, x, y, size, rotation, alpha) {
      c.save();
      c.translate(x, y);
      c.rotate(rotation);
      c.strokeStyle = `rgba(215, 242, 255, ${alpha})`;
      c.lineWidth = 1.0;
      c.shadowColor = 'rgba(170, 230, 255, 0.7)';
      c.shadowBlur = 8;

      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const ex = Math.cos(angle) * size;
        const ey = Math.sin(angle) * size;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(ex, ey);
        c.stroke();

        const bx = ex * 0.62, by = ey * 0.62;
        const perp = angle + Math.PI / 4;
        const perp2 = angle - Math.PI / 4;
        const branchLen = size * 0.36;
        c.beginPath();
        c.moveTo(bx, by);
        c.lineTo(bx + Math.cos(perp) * branchLen, by + Math.sin(perp) * branchLen);
        c.moveTo(bx, by);
        c.lineTo(bx + Math.cos(perp2) * branchLen, by + Math.sin(perp2) * branchLen);
        c.stroke();
      }
      c.restore();
    }

    // God-rays & Sunbeams
    function drawSunbeams(c, w, h, frame) {
      c.save();
      const originX = w * 0.15;
      const originY = -60;
      const rayCount = 10;

      for (let i = 0; i < rayCount; i++) {
        const angle = 0.24 + (i / rayCount) * 0.88 + Math.sin(frame * 0.004 + i) * 0.05;
        const spread = 0.11 + Math.sin(frame * 0.006 + i * 2) * 0.04;
        const rayLen = Math.max(w, h) * 1.65;
        const rayAlpha = 0.035 + Math.sin(frame * 0.008 + i * 1.5) * 0.022;

        const grad = c.createRadialGradient(originX, originY, 30, originX, originY, rayLen);
        grad.addColorStop(0, `rgba(255, 245, 180, ${rayAlpha * 2.3})`);
        grad.addColorStop(0.35, `rgba(255, 225, 135, ${rayAlpha * 1.6})`);
        grad.addColorStop(0.7, `rgba(255, 205, 100, ${rayAlpha * 0.6})`);
        grad.addColorStop(1, 'transparent');

        c.fillStyle = grad;
        c.beginPath();
        c.moveTo(originX, originY);
        c.lineTo(originX + Math.cos(angle - spread) * rayLen, originY + Math.sin(angle - spread) * rayLen);
        c.lineTo(originX + Math.cos(angle + spread) * rayLen, originY + Math.sin(angle + spread) * rayLen);
        c.closePath();
        c.fill();
      }

      // Corona flare
      const coronaGrad = c.createRadialGradient(originX, originY, 0, originX, originY, 450);
      coronaGrad.addColorStop(0, 'rgba(255, 250, 220, 0.28)');
      coronaGrad.addColorStop(0.3, 'rgba(255, 225, 130, 0.14)');
      coronaGrad.addColorStop(0.65, 'rgba(255, 200, 100, 0.04)');
      coronaGrad.addColorStop(1, 'transparent');
      c.fillStyle = coronaGrad;
      c.beginPath();
      c.arc(originX, originY, 450, 0, Math.PI * 2);
      c.fill();

      c.restore();
    }

    // Heat shimmer & Magma Core
    let shimmerOffset = 0;
    function drawHeatEffects(c, w, h, frame) {
      shimmerOffset += 0.032;
      c.save();

      // Magma furnace glow at bottom
      const glowIntensity = 0.32 + Math.sin(frame * 0.026) * 0.1;
      const magmaGrad = c.createLinearGradient(0, h, 0, h - 360);
      magmaGrad.addColorStop(0, `rgba(255, 45, 10, ${glowIntensity})`);
      magmaGrad.addColorStop(0.28, `rgba(255, 85, 20, ${glowIntensity * 0.72})`);
      magmaGrad.addColorStop(0.55, `rgba(255, 130, 30, ${glowIntensity * 0.35})`);
      magmaGrad.addColorStop(1, 'transparent');
      c.fillStyle = magmaGrad;
      c.fillRect(0, h - 360, w, 360);

      // Single pass heat distortion lines
      for (let y = h * 0.32; y < h; y += 48) {
        const amplitude = 4.5 + Math.sin(y * 0.012 + frame * 0.036) * 3.2;
        const alpha = 0.02 + Math.sin(y * 0.008 + frame * 0.018) * 0.014;
        c.fillStyle = `rgba(255, 120, 40, ${Math.max(0, alpha)})`;
        c.beginPath();
        for (let x = 0; x < w; x += 8) {
          const offset = Math.sin(x * 0.022 + shimmerOffset + y * 0.012) * amplitude;
          if (x === 0) c.moveTo(x, y + offset);
          else c.lineTo(x, y + offset);
        }
        c.lineTo(w, y + 8);
        c.lineTo(0, y + 8);
        c.closePath();
        c.fill();
      }
      c.restore();
    }

    // Frost vignette & Aurora
    function drawFrostVignette(c, w, h, frame) {
      const intensity = 0.24 + Math.sin(frame * 0.01) * 0.06;
      c.save();

      // Top frost creep
      const gradTop = c.createLinearGradient(0, 0, 0, h * 0.26);
      gradTop.addColorStop(0, `rgba(205, 238, 255, ${intensity * 1.6})`);
      gradTop.addColorStop(0.5, `rgba(215, 242, 255, ${intensity * 0.55})`);
      gradTop.addColorStop(1, 'rgba(205, 238, 255, 0)');
      c.fillStyle = gradTop;
      c.fillRect(0, 0, w, h * 0.26);

      // Bottom frost creep
      const gradBot = c.createLinearGradient(0, h * 0.78, 0, h);
      gradBot.addColorStop(0, 'rgba(205, 238, 255, 0)');
      gradBot.addColorStop(0.5, `rgba(215, 242, 255, ${intensity * 0.45})`);
      gradBot.addColorStop(1, `rgba(205, 238, 255, ${intensity * 1.4})`);
      c.fillStyle = gradBot;
      c.fillRect(0, h * 0.78, w, h * 0.22);

      // Aurora borealis wave ribbons (cyan, teal, lavender)
      const auroraColors = [
        [80, 220, 255],
        [90, 255, 180],
        [165, 140, 255],
      ];

      for (let a = 0; a < auroraColors.length; a++) {
        const [r, g, b] = auroraColors[a];
        const yBase = h * 0.09 + a * 42;
        const auroraAlpha = 0.045 + Math.sin(frame * 0.006 + a * 1.5) * 0.026;

        c.beginPath();
        for (let x = 0; x <= w; x += 12) {
          const wave =
            Math.sin(x * 0.004 + frame * 0.008 + a * 0.8) * 32 +
            Math.sin(x * 0.007 + frame * 0.012 + a * 1.2) * 18 +
            Math.sin(x * 0.002 + frame * 0.005) * 42;
          const y = yBase + wave;
          if (x === 0) c.moveTo(x, y);
          else c.lineTo(x, y);
        }
        c.lineTo(w, -50);
        c.lineTo(0, -50);
        c.closePath();

        const aGrad = c.createLinearGradient(0, yBase - 60, 0, yBase + 60);
        aGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        aGrad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${auroraAlpha})`);
        aGrad.addColorStop(0.65, `rgba(${r}, ${g}, ${b}, ${auroraAlpha * 0.7})`);
        aGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        c.fillStyle = aGrad;
        c.fill();
      }

      c.restore();
    }

    // Main render loop
    let frame = 0;
    let lightningFlash = 0;
    let lightningTimer = 0;
    let screenShake = { x: 0, y: 0 };
    let lastTime = performance.now();
    let isHidden = false;

    const handleVisibility = () => {
      if (document.hidden) {
        isHidden = true;
        cancelAnimationFrame(animationFrameId);
      } else {
        isHidden = false;
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const render = (timestamp = performance.now()) => {
      if (isHidden) return;

      const elapsed = timestamp - lastTime;
      if (perfMode === 'eco' && elapsed < 31) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const dt = Math.min(Math.max(elapsed / 16.67, 0.4), 2.2);
      lastTime = timestamp;
      frame++;

      ctx.save();

      // Screen shake for lightning
      if (climate === 'STORM' && (screenShake.x !== 0 || screenShake.y !== 0)) {
        ctx.translate(screenShake.x, screenShake.y);
        screenShake.x *= 0.88;
        screenShake.y *= 0.88;
        if (Math.abs(screenShake.x) < 0.2) screenShake.x = 0;
        if (Math.abs(screenShake.y) < 0.2) screenShake.y = 0;
      }

      ctx.clearRect(-20, -20, width + 40, height + 40);

      // 1. Climate Overlays
      if (climate === 'SUNNY') {
        drawSunbeams(ctx, width, height, frame);
      } else if (climate === 'HOT') {
        drawHeatEffects(ctx, width, height, frame);
      } else if (climate === 'COLD') {
        drawFrostVignette(ctx, width, height, frame);
      } else if (climate === 'STORM') {
        lightningTimer += dt;
        if (lightningTimer > 190 + Math.random() * 240) {
          lightningTimer = 0;
          lightningFlash = 1.0;
          screenShake = {
            x: (Math.random() - 0.5) * 16,
            y: (Math.random() - 0.5) * 12,
          };
          const startX = width * (0.2 + Math.random() * 0.6);
          lightningBolts.push({
            segments: generateLightningBolt(startX, 0, startX + (Math.random() - 0.5) * 160, height * 0.85),
            alpha: 1.0,
            thickness: 3.8,
          });
        }

        if (lightningFlash > 0) {
          ctx.fillStyle = `rgba(220, 235, 255, ${lightningFlash * 0.45})`;
          ctx.fillRect(0, 0, width, height);
          lightningFlash -= 0.055 * dt;
        }

        for (let i = lightningBolts.length - 1; i >= 0; i--) {
          const bolt = lightningBolts[i];
          drawLightningSegments(ctx, bolt.segments, bolt.alpha, bolt.thickness);
          bolt.alpha -= 0.038 * dt;
          if (bolt.alpha <= 0) lightningBolts.splice(i, 1);
        }
      }

      // 2. Interactive Click Sparks
      for (let i = interactiveSparks.length - 1; i >= 0; i--) {
        const spk = interactiveSparks[i];
        spk.x += spk.vx * dt;
        spk.y += spk.vy * dt;
        spk.life -= spk.decay * dt;
        if (spk.life <= 0) {
          interactiveSparks.splice(i, 1);
        } else {
          ctx.fillStyle = spk.color;
          ctx.globalAlpha = Math.max(0, spk.life);
          ctx.drawImage(sparkSprite, spk.x - spk.size * 2, spk.y - spk.size * 2, spk.size * 4, spk.size * 4);
          ctx.globalAlpha = 1.0;
        }
      }

      // 3. Main Particles with Interactive Mouse Physics
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Cursor wake vector interaction
        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 140 && dist > 1) {
            const force = (1 - dist / 140);
            if (climate === 'SUNNY' && p.isFirefly) {
              // Fireflies gently swarm toward pointer!
              p.x -= (dx / dist) * force * 1.5 * dt;
              p.y -= (dy / dist) * force * 1.5 * dt;
            } else if (climate === 'COLD') {
              // Snowflakes gently flutter away from pointer
              p.x += (dx / dist) * force * 2.5 * dt;
              p.y += (dy / dist) * force * 2.5 * dt;
            } else if (climate === 'HOT') {
              // Embers swirl with mouse velocity
              p.x += pointer.vx * force * 0.8 * dt;
              p.y += pointer.vy * force * 0.8 * dt;
            }
          }
        }

        if (climate === 'RAINY' || climate === 'STORM') {
          p.y += p.speed * dt;
          p.x += p.windX * dt;

          const rainColor =
            climate === 'STORM'
              ? `rgba(180, 205, 255, ${p.alpha})`
              : `rgba(165, 215, 255, ${p.alpha})`;
          ctx.strokeStyle = rainColor;
          ctx.lineWidth = p.thickness;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.windX * 0.35, p.y + p.len);
          ctx.stroke();

          if (p.y > height - 20 && Math.random() < p.splashChance * dt) {
            ripples.push({
              x: p.x,
              y: height - 6 - Math.random() * 12,
              r: 1,
              maxR: 9 + Math.random() * 11,
              alpha: 0.6,
            });

            const splashDrops = 2 + Math.floor(Math.random() * 2);
            for (let s = 0; s < splashDrops; s++) {
              splashes.push({
                x: p.x,
                y: height - 10,
                vx: (Math.random() - 0.5) * 3,
                vy: -(Math.random() * 3.2 + 1.6),
                alpha: 0.75,
                size: 1 + Math.random() * 1.5,
              });
            }
          }

          if (p.y > height) {
            particles[i] = createParticle(climate, width, height, false);
          }

        } else if (climate === 'HOT') {
          p.y += p.speedY * dt;
          p.x += (p.speedX + Math.sin(frame * p.turbulence + i * 0.4) * 0.85) * dt;
          p.life -= p.decay * dt;

          if (p.glow) {
            ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 0.95));
            const diameter = p.size * 7.5;
            ctx.drawImage(emberSprite, p.x - diameter * 0.5, p.y - diameter * 0.5, diameter, diameter);
            ctx.globalAlpha = 1.0;
          } else {
            ctx.fillStyle = `hsla(${p.hue}, 95%, 60%, ${Math.max(0, p.life * p.alpha)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }

          if (p.y < -25 || p.life <= 0) {
            particles[i] = createParticle('HOT', width, height, false);
          }

        } else if (climate === 'COLD') {
          p.y += p.speedY * dt;
          p.x += Math.sin(frame * p.swingSpeed + i) * p.swing;
          p.rotation += p.rotSpeed * dt;
          p.sparkle += 0.045 * dt;

          if (p.isCrystal) {
            drawIceCrystal(ctx, p.x, p.y, p.size * 2.8, p.rotation, p.alpha * 0.9);
          } else {
            const sparkleAlpha = p.alpha + Math.sin(p.sparkle) * 0.18;
            ctx.fillStyle = `rgba(225, 245, 255, ${Math.max(0, sparkleAlpha)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }

          if (p.y > height + 15) {
            particles[i] = createParticle('COLD', width, height, false);
          }

        } else {
          // SUNNY
          p.y += p.speedY * dt;
          p.x += (p.speedX + Math.sin(frame * 0.012 + i) * 0.24) * dt;
          p.pulse += p.pulseSpeed * dt;
          const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.15;

          if (p.isFirefly) {
            const blink = Math.max(0, Math.sin(p.pulse * 2.2) * 0.6 + 0.4);
            ctx.globalAlpha = blink;
            ctx.drawImage(fireflySprite, p.x - p.glowRadius, p.y - p.glowRadius, p.glowRadius * 2, p.glowRadius * 2);
            ctx.globalAlpha = 1.0;
          } else {
            ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));
            const diameter = p.size * 5.8;
            ctx.drawImage(sunMoteSprite, p.x - diameter * 0.5, p.y - diameter * 0.5, diameter, diameter);
            ctx.globalAlpha = 1.0;
          }

          if (p.y < -25) {
            particles[i] = createParticle('SUNNY', width, height, false);
          }
        }
      }

      // 4. Splashes
      for (let i = splashes.length - 1; i >= 0; i--) {
        const sp = splashes[i];
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        sp.vy += 0.26 * dt;
        sp.alpha -= 0.035 * dt;

        if (sp.alpha <= 0 || sp.y > height) {
          splashes.splice(i, 1);
        } else {
          ctx.fillStyle = `rgba(195, 228, 255, ${sp.alpha})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 1.35 * dt;
        r.alpha -= 0.024 * dt;
        if (r.alpha <= 0 || r.r >= r.maxR) {
          ripples.splice(i, 1);
        } else {
          ctx.strokeStyle = `rgba(195, 228, 255, ${r.alpha})`;
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.r, r.r * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // 6. Glass Drops
      for (const gd of glassDrops) {
        gd.nextSlide -= dt;
        if (gd.nextSlide <= 0) {
          gd.sliding = true;
          if (Math.random() < 0.15) {
            gd.nextSlide = 100 + Math.floor(Math.random() * 300);
            gd.sliding = false;
          }
        }

        if (gd.sliding) {
          gd.y += gd.slideSpeed * dt;
          gd.trail.push({ x: gd.x, y: gd.y, r: gd.radius * 0.5, alpha: 0.35 });
          if (gd.trail.length > gd.trailLength) gd.trail.shift();
        }

        ctx.fillStyle = 'rgba(215, 238, 255, 0.42)';
        ctx.beginPath();
        ctx.arc(gd.x, gd.y, gd.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(gd.x - gd.radius * 0.35, gd.y - gd.radius * 0.35, gd.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        for (const t of gd.trail) {
          t.alpha -= 0.005 * dt;
          if (t.alpha > 0) {
            ctx.fillStyle = `rgba(205, 235, 255, ${t.alpha})`;
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        if (gd.y > height + 20) {
          gd.y = -10;
          gd.x = Math.random() * width;
          gd.trail = [];
          gd.sliding = false;
          gd.nextSlide = 60 + Math.floor(Math.random() * 200);
        }
      }

      // 7. Wind streaks
      for (let i = windStreaks.length - 1; i >= 0; i--) {
        const ws = windStreaks[i];
        ws.x += ws.speed * dt;
        ws.life -= 0.009 * dt;

        ctx.strokeStyle = `rgba(195, 215, 255, ${ws.life * ws.alpha})`;
        ctx.lineWidth = ws.thickness;
        ctx.beginPath();
        ctx.moveTo(ws.x, ws.y);
        ctx.lineTo(ws.x + ws.len, ws.y + 2.5);
        ctx.stroke();

        if (ws.debris) {
          ws.debris.rot += ws.debris.rotSpeed * dt;
          ctx.save();
          ctx.translate(ws.x + ws.len * 0.5, ws.y);
          ctx.rotate(ws.debris.rot);
          ctx.fillStyle = `rgba(145, 165, 195, ${ws.life * 0.6})`;
          ctx.fillRect(-ws.debris.size / 2, -ws.debris.size / 2, ws.debris.size, ws.debris.size);
          ctx.restore();
        }

        if (ws.x > width + 120 || ws.life <= 0) {
          windStreaks[i] = createWindStreak(width, height);
        }
      }

      // 8. Fog wisps
      for (const fog of fogWisps) {
        fog.x += fog.speedX * dt;
        fog.phase += 0.006 * dt;
        const dynamicAlpha = fog.alpha + Math.sin(fog.phase) * 0.02;

        const grad = ctx.createRadialGradient(
          fog.x + fog.w / 2, fog.y, 0,
          fog.x + fog.w / 2, fog.y, fog.w / 2
        );
        const fogColor = climate === 'COLD' ? '215, 235, 255' : '165, 185, 215';
        grad.addColorStop(0, `rgba(${fogColor}, ${Math.max(0, dynamicAlpha)})`);
        grad.addColorStop(1, `rgba(${fogColor}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(fog.x, fog.y - fog.h / 2, fog.w, fog.h);

        if (fog.x > width + fog.w) fog.x = -fog.w;
        if (fog.x < -fog.w * 2) fog.x = width;
      }

      // 9. Smoke tendrils
      for (const smoke of smokeTendrils) {
        smoke.y += smoke.speedY * dt;
        smoke.x += (smoke.speedX + Math.sin(frame * 0.012 + smoke.phase) * 0.6) * dt;
        smoke.phase += 0.022 * dt;

        const grad = ctx.createRadialGradient(smoke.x, smoke.y, 0, smoke.x, smoke.y, smoke.size);
        grad.addColorStop(0, `rgba(95, 48, 22, ${smoke.alpha})`);
        grad.addColorStop(0.5, `rgba(75, 38, 16, ${smoke.alpha * 0.5})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(smoke.x, smoke.y, smoke.size, 0, Math.PI * 2);
        ctx.fill();

        if (smoke.y < -smoke.size) {
          smoke.y = height + 25;
          smoke.x = Math.random() * width;
        }
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [climate, perfMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-10 w-full h-full transition-opacity duration-1000"
    />
  );
};

export default React.memo(ClimateEffect);
