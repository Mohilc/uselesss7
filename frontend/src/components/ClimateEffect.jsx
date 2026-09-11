import React, { useEffect, useRef } from 'react';

/**
 * ClimateEffect — Next-Generation Immersive Weather & Climate Engine
 * 
 * Features:
 *  - SUNNY:  Dynamic sunbeam god-rays, chromatic lens flares, golden floating pollen motes, bioluminescent fireflies
 *  - RAINY:  Multi-layered depth rain, surface splash bounces, concentric ripples, sliding glass condensation droplets
 *  - STORM:  Heavy deluge rain, violent wind squall & flying debris, branched forked lightning bolts, screen shake, electric spark arcs
 *  - HOT:    Turbulent glowing fire embers with micro-spark bursts, animated heat shimmer distortion waves, smoke tendrils, bottom furnace magma glow
 *  - COLD:   Multi-layer 3D tumbling snowflakes, 6-pointed geometric ice crystals with specular sparkles, creeping needle frost vignette, arctic blizzard fog
 */
function createGlowSprite(r, innerColor, midColor, outerColor) {
  const c = document.createElement('canvas');
  const d = r * 2;
  c.width = d;
  c.height = d;
  const cx = c.getContext('2d');
  const g = cx.createRadialGradient(r, r, 0, r, r, r);
  g.addColorStop(0, innerColor);
  g.addColorStop(0.4, midColor);
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

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Pre-rendered GPU sprite textures for zero-allocation blitting
    const fireflySprite = createGlowSprite(32, 'rgba(255, 245, 140, 1)', 'rgba(255, 210, 70, 0.45)', 'rgba(255, 200, 50, 0)');
    const sunMoteSprite = createGlowSprite(32, 'rgba(255, 230, 130, 0.95)', 'rgba(240, 185, 70, 0.35)', 'rgba(235, 160, 40, 0)');
    const emberSprite = createGlowSprite(32, 'rgba(255, 210, 110, 1)', 'rgba(245, 75, 25, 0.55)', 'rgba(180, 20, 0, 0)');

    // ——— POOLS & STATE ———
    let particles = [];
    let ripples = [];
    let splashes = [];
    let lightningBolts = [];
    let windStreaks = [];
    let fogWisps = [];
    let smokeTendrils = [];
    let glassDrops = [];

    const perfMultiplier = perfMode === 'eco' ? 0.35 : perfMode === 'ultra' ? 1.2 : 0.85;
    const basePCount = {
      SUNNY: 70,
      RAINY: 180,
      STORM: 240,
      HOT: 120,
      COLD: 140,
    }[climate] || 70;
    const pCount = Math.round(basePCount * perfMultiplier);

    // Initialize main particles
    for (let i = 0; i < pCount; i++) {
      particles.push(createParticle(climate, width, height, true));
    }

    // Glass condensation drops for RAINY and STORM
    if (climate === 'RAINY' || climate === 'STORM') {
      const dropCount = Math.round((climate === 'STORM' ? 24 : 16) * perfMultiplier);
      for (let i = 0; i < dropCount; i++) {
        glassDrops.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 1.5 + Math.random() * 3.5,
          speed: 0.1 + Math.random() * 0.4,
          trail: [],
          trailLength: 5 + Math.floor(Math.random() * 8),
          nextSlide: 50 + Math.floor(Math.random() * 200),
          sliding: false,
          slideSpeed: 2 + Math.random() * 3,
        });
      }
    }

    // Fog wisps for COLD and STORM
    if (climate === 'COLD' || climate === 'STORM') {
      for (let i = 0; i < 8; i++) {
        fogWisps.push({
          x: Math.random() * width,
          y: height * (0.3 + Math.random() * 0.7),
          w: 250 + Math.random() * 350,
          h: 40 + Math.random() * 70,
          speedX: (Math.random() - (climate === 'STORM' ? 0.2 : 0.4)) * 0.9,
          alpha: 0.03 + Math.random() * 0.06,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    // Wind streaks for STORM
    if (climate === 'STORM') {
      for (let i = 0; i < 22; i++) {
        windStreaks.push(createWindStreak(width, height));
      }
    }

    // Smoke tendrils for HOT
    if (climate === 'HOT') {
      for (let i = 0; i < 12; i++) {
        smokeTendrils.push({
          x: Math.random() * width,
          y: height + 20 + Math.random() * 40,
          size: 25 + Math.random() * 55,
          speedY: -(0.4 + Math.random() * 0.7),
          speedX: (Math.random() - 0.5) * 0.5,
          alpha: 0.03 + Math.random() * 0.05,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    // ——— PARTICLE CREATION ———

    function createParticle(type, w, h, randomY = false) {
      switch (type) {
        case 'RAINY':
        case 'STORM': {
          const isStorm = type === 'STORM';
          const layer = Math.random(); // 0-0.3: background mist, 0.3-0.7: mid, 0.7-1.0: foreground
          let speed, len, thickness, alpha;
          if (layer < 0.3) {
            speed = (isStorm ? 14 : 9) + Math.random() * 5;
            len = 10 + Math.random() * 10;
            thickness = 0.8;
            alpha = 0.15 + Math.random() * 0.15;
          } else if (layer < 0.7) {
            speed = (isStorm ? 20 : 14) + Math.random() * 8;
            len = 18 + Math.random() * 15;
            thickness = 1.2 + Math.random() * 0.5;
            alpha = 0.35 + Math.random() * 0.25;
          } else {
            speed = (isStorm ? 26 : 18) + Math.random() * 10;
            len = 28 + Math.random() * 22;
            thickness = (isStorm ? 2.2 : 1.7) + Math.random() * 0.8;
            alpha = 0.55 + Math.random() * 0.35;
          }
          return {
            x: Math.random() * (w + 250) - 120,
            y: randomY ? Math.random() * h : -25 - Math.random() * 100,
            speed,
            windX: isStorm ? 3.5 + Math.random() * 4.5 : 0.6 + Math.random() * 0.8,
            len,
            thickness,
            alpha,
            layer,
            splashChance: isStorm ? 0.65 : 0.35,
          };
        }

        case 'HOT': {
          const isSpark = Math.random() > 0.82;
          return {
            x: Math.random() * w,
            y: randomY ? Math.random() * h : h + 15 + Math.random() * 40,
            size: isSpark ? Math.random() * 1.8 + 0.8 : Math.random() * 4.8 + 1.2,
            speedY: -(Math.random() * (isSpark ? 3.8 : 2.5) + 0.8),
            speedX: (Math.random() - 0.5) * (isSpark ? 3.2 : 1.8),
            alpha: Math.random() * 0.85 + 0.2,
            hue: Math.random() > 0.25 ? 15 + Math.random() * 32 : 0 + Math.random() * 15,
            life: 1.0,
            decay: isSpark ? 0.006 + Math.random() * 0.008 : 0.0025 + Math.random() * 0.0035,
            glow: Math.random() > 0.6,
            isSpark,
            turbulence: Math.random() * 0.05 + 0.02,
            burstChance: isSpark ? 0.3 : 0.15,
          };
        }

        case 'COLD': {
          const isCrystal = Math.random() > 0.55;
          const size = isCrystal ? Math.random() * 3.5 + 1.5 : Math.random() * 4.5 + 0.8;
          return {
            x: Math.random() * w,
            y: randomY ? Math.random() * h : -15 - Math.random() * 40,
            size,
            speedY: Math.random() * 1.4 + 0.4,
            swing: 1.8 + Math.random() * 2.8,
            swingSpeed: 0.009 + Math.random() * 0.02,
            alpha: Math.random() * 0.75 + 0.25,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.035,
            isCrystal,
            sparkle: Math.random() * Math.PI * 2,
            driftZ: Math.sin(Math.random() * Math.PI),
          };
        }

        default:
          // SUNNY
          const isFirefly = Math.random() > 0.72;
          return {
            x: Math.random() * w,
            y: randomY ? Math.random() * h : h + 15,
            size: isFirefly ? Math.random() * 4 + 2 : Math.random() * 7 + 2,
            speedY: -(Math.random() * (isFirefly ? 0.8 : 0.5) + 0.15),
            speedX: (Math.random() - 0.5) * (isFirefly ? 0.7 : 0.35),
            alpha: Math.random() * 0.45 + 0.12,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: 0.018 + Math.random() * 0.025,
            hue: 38 + Math.random() * 24,
            isFirefly,
            glowRadius: Math.random() * 15 + 10,
          };
      }
    }

    function createWindStreak(w, h) {
      return {
        x: -80 + Math.random() * (w + 150),
        y: Math.random() * h,
        len: 60 + Math.random() * 120,
        speed: 10 + Math.random() * 16,
        thickness: 0.8 + Math.random() * 1.2,
        alpha: 0.06 + Math.random() * 0.1,
        life: 1.0,
        debris: Math.random() > 0.6 ? { size: 1.5 + Math.random() * 2, rot: 0, rotSpeed: 0.1 } : null,
      };
    }

    // ——— LIGHTNING GENERATOR ———

    function generateLightningBolt(startX, startY, endX, endY) {
      const segments = [];
      const steps = 9 + Math.floor(Math.random() * 7);
      let cx = startX, cy = startY;
      const dx = (endX - startX) / steps;
      const dy = (endY - startY) / steps;

      segments.push({ x: cx, y: cy });
      for (let i = 1; i < steps; i++) {
        cx += dx + (Math.random() - 0.5) * 90;
        cy += dy + (Math.random() - 0.5) * 25;
        segments.push({ x: cx, y: cy });

        if (Math.random() < 0.3) {
          const branchLen = 3 + Math.floor(Math.random() * 4);
          let bx = cx, by = cy;
          const branchSegs = [{ x: bx, y: by }];
          for (let j = 0; j < branchLen; j++) {
            bx += (Math.random() - 0.5) * 70;
            by += 18 + Math.random() * 30;
            branchSegs.push({ x: bx, y: by });
          }
          segments.push({ branch: branchSegs });
        }
      }
      segments.push({ x: endX, y: endY });
      return segments;
    }

    function drawLightningSegments(ctx, segments, alpha, thickness) {
      ctx.save();
      ctx.strokeStyle = `rgba(215, 225, 255, ${alpha})`;
      ctx.lineWidth = thickness;
      ctx.shadowColor = 'rgba(170, 195, 255, 0.9)';
      ctx.shadowBlur = 18;
      ctx.beginPath();

      let started = false;
      for (const seg of segments) {
        if (seg.branch) {
          ctx.stroke();
          ctx.beginPath();
          ctx.lineWidth = Math.max(0.6, thickness * 0.55);
          for (let i = 0; i < seg.branch.length; i++) {
            if (i === 0) ctx.moveTo(seg.branch[i].x, seg.branch[i].y);
            else ctx.lineTo(seg.branch[i].x, seg.branch[i].y);
          }
          ctx.stroke();
          ctx.beginPath();
          ctx.lineWidth = thickness;
          started = false;
        } else {
          if (!started) {
            ctx.moveTo(seg.x, seg.y);
            started = true;
          } else {
            ctx.lineTo(seg.x, seg.y);
          }
        }
      }
      ctx.stroke();
      ctx.restore();
    }

    // ——— ICE CRYSTALS ———

    function drawIceCrystal(ctx, x, y, size, rotation, alpha) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.strokeStyle = `rgba(210, 238, 255, ${alpha})`;
      ctx.lineWidth = 0.9;
      ctx.shadowColor = 'rgba(160, 220, 255, 0.6)';
      ctx.shadowBlur = 6;

      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const ex = Math.cos(angle) * size;
        const ey = Math.sin(angle) * size;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        const bx = ex * 0.62, by = ey * 0.62;
        const perp = angle + Math.PI / 4;
        const perp2 = angle - Math.PI / 4;
        const branchLen = size * 0.35;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(perp) * branchLen, by + Math.sin(perp) * branchLen);
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(perp2) * branchLen, by + Math.sin(perp2) * branchLen);
        ctx.stroke();
      }
      ctx.restore();
    }

    // ——— SUNBEAMS, GOD RAYS & LENS FLARE (SUNNY) ———

    function drawSunbeams(ctx, w, h, frame) {
      ctx.save();
      const originX = w * 0.15;
      const originY = -50;
      const rayCount = 9;

      for (let i = 0; i < rayCount; i++) {
        const angle = 0.25 + (i / rayCount) * 0.85 + Math.sin(frame * 0.004 + i) * 0.05;
        const spread = 0.1 + Math.sin(frame * 0.006 + i * 2) * 0.04;
        const rayLen = Math.max(w, h) * 1.6;
        const rayAlpha = 0.03 + Math.sin(frame * 0.008 + i * 1.5) * 0.02;

        const grad = ctx.createRadialGradient(originX, originY, 30, originX, originY, rayLen);
        grad.addColorStop(0, `rgba(255, 240, 170, ${rayAlpha * 2.2})`);
        grad.addColorStop(0.3, `rgba(255, 220, 130, ${rayAlpha * 1.5})`);
        grad.addColorStop(0.6, `rgba(255, 200, 100, ${rayAlpha * 0.6})`);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(originX + Math.cos(angle - spread) * rayLen, originY + Math.sin(angle - spread) * rayLen);
        ctx.lineTo(originX + Math.cos(angle + spread) * rayLen, originY + Math.sin(angle + spread) * rayLen);
        ctx.closePath();
        ctx.fill();
      }

      // Bright corona flare
      const coronaGrad = ctx.createRadialGradient(originX, originY, 0, originX, originY, 400);
      coronaGrad.addColorStop(0, 'rgba(255, 248, 210, 0.25)');
      coronaGrad.addColorStop(0.3, 'rgba(255, 220, 120, 0.12)');
      coronaGrad.addColorStop(0.6, 'rgba(255, 200, 100, 0.04)');
      coronaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath();
      ctx.arc(originX, originY, 400, 0, Math.PI * 2);
      ctx.fill();

      // Chromatic lens flare streak
      const flareX = w * 0.65 + Math.sin(frame * 0.005) * 40;
      const flareY = h * 0.35 + Math.cos(frame * 0.004) * 30;
      const flareAlpha = 0.04 + Math.sin(frame * 0.012) * 0.025;

      // Rainbow ring flare
      const colors = [
        [255, 100, 100], [255, 200, 80], [100, 255, 100],
        [80, 200, 255], [150, 100, 255],
      ];
      colors.forEach((c, ci) => {
        const r = 30 + ci * 18 + Math.sin(frame * 0.01 + ci) * 5;
        ctx.strokeStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${flareAlpha * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(flareX, flareY, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Soft hexagonal flare
      const hexAlpha = flareAlpha * 0.5;
      ctx.fillStyle = `rgba(255, 240, 200, ${hexAlpha})`;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 + frame * 0.002;
        const hr = 12 + Math.sin(frame * 0.015) * 4;
        const hx = flareX + Math.cos(a) * hr;
        const hy = flareY + Math.sin(a) * hr;
        if (i === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }

    // ——— HEAT SHIMMER, FURNACE GLOW & CHROMATIC DISTORTION (HOT) ———

    let shimmerOffset = 0;

    function drawHeatEffects(ctx, w, h, frame) {
      shimmerOffset += 0.03;
      ctx.save();

      // Deep magma furnace glow at bottom — taller and more intense
      const glowIntensity = 0.3 + Math.sin(frame * 0.025) * 0.1;
      const magmaGrad = ctx.createLinearGradient(0, h, 0, h - 350);
      magmaGrad.addColorStop(0, `rgba(255, 40, 10, ${glowIntensity})`);
      magmaGrad.addColorStop(0.25, `rgba(255, 80, 20, ${glowIntensity * 0.7})`);
      magmaGrad.addColorStop(0.5, `rgba(255, 120, 30, ${glowIntensity * 0.35})`);
      magmaGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = magmaGrad;
      ctx.fillRect(0, h - 350, w, 350);

      // Secondary top glow (overhead heat radiation)
      const topGlow = 0.06 + Math.sin(frame * 0.02 + 1) * 0.03;
      const topGrad = ctx.createLinearGradient(0, 0, 0, h * 0.25);
      topGrad.addColorStop(0, `rgba(255, 100, 30, ${topGlow})`);
      topGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, w, h * 0.25);

      // Heat shimmer waves — optimized single pass
      for (let y = h * 0.3; y < h; y += 50) {
        const amplitude = 4 + Math.sin(y * 0.012 + frame * 0.035) * 3;
        const alpha = 0.018 + Math.sin(y * 0.008 + frame * 0.018) * 0.014;
        ctx.fillStyle = `rgba(255, 120, 40, ${Math.max(0, alpha)})`;
        ctx.beginPath();
        for (let x = 0; x < w; x += 6) {
          const offset = Math.sin(x * 0.02 + shimmerOffset + y * 0.012) * amplitude;
          if (x === 0) ctx.moveTo(x, y + offset);
          else ctx.lineTo(x, y + offset);
        }
        ctx.lineTo(w, y + 8);
        ctx.lineTo(0, y + 8);
        ctx.closePath();
        ctx.fill();
      }

      // Pulsing heat rings from center-bottom (furnace core)
      const ringCount = 3;
      for (let r = 0; r < ringCount; r++) {
        const ringPhase = (frame * 0.008 + r * 0.33) % 1;
        const ringRadius = ringPhase * Math.max(w, h) * 0.6;
        const ringAlpha = (1 - ringPhase) * 0.04;
        if (ringAlpha > 0.005) {
          ctx.strokeStyle = `rgba(255, 80, 20, ${ringAlpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(w * 0.5, h + 50, ringRadius, Math.PI, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // ——— FROST VIGNETTE & AURORA BOREALIS (COLD) ———

    function drawFrostVignette(ctx, w, h, frame) {
      const intensity = 0.22 + Math.sin(frame * 0.01) * 0.06;
      ctx.save();

      // Top frost creep — deeper and more visible
      const gradTop = ctx.createLinearGradient(0, 0, 0, h * 0.25);
      gradTop.addColorStop(0, `rgba(200, 235, 255, ${intensity * 1.5})`);
      gradTop.addColorStop(0.5, `rgba(210, 240, 255, ${intensity * 0.5})`);
      gradTop.addColorStop(1, 'rgba(205, 235, 255, 0)');
      ctx.fillStyle = gradTop;
      ctx.fillRect(0, 0, w, h * 0.25);

      // Bottom frost creep
      const gradBot = ctx.createLinearGradient(0, h * 0.8, 0, h);
      gradBot.addColorStop(0, 'rgba(205, 235, 255, 0)');
      gradBot.addColorStop(0.5, `rgba(210, 240, 255, ${intensity * 0.4})`);
      gradBot.addColorStop(1, `rgba(200, 235, 255, ${intensity * 1.3})`);
      ctx.fillStyle = gradBot;
      ctx.fillRect(0, h * 0.8, w, h * 0.2);

      // Side frost creep
      const gradLeft = ctx.createLinearGradient(0, 0, w * 0.12, 0);
      gradLeft.addColorStop(0, `rgba(200, 235, 255, ${intensity * 0.8})`);
      gradLeft.addColorStop(1, 'transparent');
      ctx.fillStyle = gradLeft;
      ctx.fillRect(0, 0, w * 0.12, h);

      const gradRight = ctx.createLinearGradient(w, 0, w * 0.88, 0);
      gradRight.addColorStop(0, `rgba(200, 235, 255, ${intensity * 0.8})`);
      gradRight.addColorStop(1, 'transparent');
      ctx.fillStyle = gradRight;
      ctx.fillRect(w * 0.88, 0, w * 0.12, h);

      // Corner frost patches — larger radius
      const corners = [[0, 0], [w, 0], [0, h], [w, h]];
      corners.forEach(([cx, cy]) => {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 320);
        grad.addColorStop(0, `rgba(190, 230, 255, ${intensity * 0.9})`);
        grad.addColorStop(0.3, `rgba(180, 225, 255, ${intensity * 0.5})`);
        grad.addColorStop(0.6, `rgba(175, 220, 255, ${intensity * 0.15})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(cx - 320, cy - 320, 640, 640);
      });

      // Aurora borealis curtain waves across the top (3 bands)
      const auroraColors = [
        [80, 220, 255],   // Cyan
        [100, 255, 180],  // Green-teal
        [160, 140, 255],  // Lavender
      ];

      for (let a = 0; a < auroraColors.length; a++) {
        const [r, g, b] = auroraColors[a];
        const yBase = h * 0.08 + a * 40;
        const auroraAlpha = 0.04 + Math.sin(frame * 0.006 + a * 1.5) * 0.025;

        ctx.beginPath();
        for (let x = 0; x <= w; x += 10) {
          const wave = Math.sin(x * 0.004 + frame * 0.008 + a * 0.8) * 30 +
                       Math.sin(x * 0.007 + frame * 0.011 + a * 1.2) * 18 +
                       Math.sin(x * 0.002 + frame * 0.005) * 40;
          const y = yBase + wave;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(w, -50);
        ctx.lineTo(0, -50);
        ctx.closePath();

        const aGrad = ctx.createLinearGradient(0, yBase - 60, 0, yBase + 60);
        aGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        aGrad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${auroraAlpha})`);
        aGrad.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${auroraAlpha * 0.7})`);
        aGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = aGrad;
        ctx.fill();
      }

      ctx.restore();
    }

    // ——— MAIN RENDER LOOP ———

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

      const dt = Math.min(Math.max(elapsed / 16.67, 0.4), 2.5);
      lastTime = timestamp;
      frame++;

      ctx.save();

      if (climate === 'STORM' && (screenShake.x !== 0 || screenShake.y !== 0)) {
        ctx.translate(screenShake.x, screenShake.y);
        screenShake.x *= 0.88;
        screenShake.y *= 0.88;
        if (Math.abs(screenShake.x) < 0.3) screenShake.x = 0;
        if (Math.abs(screenShake.y) < 0.3) screenShake.y = 0;
      }

      ctx.clearRect(-15, -15, width + 30, height + 30);

      // === 1. CLIMATE OVERLAYS ===

      if (climate === 'SUNNY') {
        drawSunbeams(ctx, width, height, frame);
      } else if (climate === 'HOT') {
        drawHeatEffects(ctx, width, height, frame);
      } else if (climate === 'COLD') {
        drawFrostVignette(ctx, width, height, frame);
      } else if (climate === 'STORM') {
        lightningTimer += dt;
        if (lightningTimer > 180 + Math.random() * 240) {
          lightningTimer = 0;
          lightningFlash = 1.0;
          screenShake = {
            x: (Math.random() - 0.5) * 16,
            y: (Math.random() - 0.5) * 12,
          };
          const startX = width * (0.2 + Math.random() * 0.6);
          lightningBolts.push({
            segments: generateLightningBolt(startX, 0, startX + (Math.random() - 0.5) * 150, height * 0.85),
            alpha: 1.0,
            thickness: 3.5,
          });
        }

        if (lightningFlash > 0) {
          ctx.fillStyle = `rgba(215, 230, 255, ${lightningFlash * 0.42})`;
          ctx.fillRect(0, 0, width, height);
          lightningFlash -= 0.05 * dt;
        }

        for (let i = lightningBolts.length - 1; i >= 0; i--) {
          const bolt = lightningBolts[i];
          drawLightningSegments(ctx, bolt.segments, bolt.alpha, bolt.thickness);
          bolt.alpha -= 0.035 * dt;
          if (bolt.alpha <= 0) lightningBolts.splice(i, 1);
        }
      }

      // === 2. MAIN PARTICLES ===

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (climate === 'RAINY' || climate === 'STORM') {
          p.y += p.speed * dt;
          p.x += p.windX * dt;

          const rainColor = climate === 'STORM'
            ? `rgba(175, 195, 255, ${p.alpha})`
            : `rgba(160, 210, 255, ${p.alpha})`;
          ctx.strokeStyle = rainColor;
          ctx.lineWidth = p.thickness;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.windX * 0.35, p.y + p.len);
          ctx.stroke();

          if (p.y > height - 20 && Math.random() < (p.splashChance * dt)) {
            ripples.push({
              x: p.x,
              y: height - 5 - Math.random() * 12,
              r: 1,
              maxR: 9 + Math.random() * 10,
              alpha: 0.55 + Math.random() * 0.3,
            });

            const splashDrops = 2 + Math.floor(Math.random() * 2);
            for (let s = 0; s < splashDrops; s++) {
              splashes.push({
                x: p.x,
                y: height - 10,
                vx: (Math.random() - 0.5) * 3,
                vy: -(Math.random() * 3 + 1.5),
                alpha: 0.7,
                size: 1 + Math.random() * 1.5,
              });
            }
          }

          if (p.y > height) {
            particles[i] = createParticle(climate, width, height, false);
          }

        } else if (climate === 'HOT') {
          p.y += p.speedY * dt;
          p.x += (p.speedX + Math.sin(frame * p.turbulence + i * 0.4) * 0.8) * dt;
          p.life -= p.decay * dt;

          if (p.glow) {
            ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 0.9));
            const diameter = p.size * 7;
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
            drawIceCrystal(ctx, p.x, p.y, p.size * 2.8, p.rotation, p.alpha * 0.85);
          } else {
            const sparkleAlpha = p.alpha + Math.sin(p.sparkle) * 0.18;
            ctx.fillStyle = `rgba(225, 245, 255, ${Math.max(0, sparkleAlpha)})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            if (Math.sin(p.sparkle) > 0.65) {
              ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha * 0.7})`;
              ctx.beginPath();
              ctx.arc(p.x - p.size * 0.25, p.y - p.size * 0.25, p.size * 0.35, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          if (p.y > height + 15) {
            particles[i] = createParticle('COLD', width, height, false);
          }

        } else {
          // SUNNY
          p.y += p.speedY * dt;
          p.x += (p.speedX + Math.sin(frame * 0.012 + i) * 0.22) * dt;
          p.pulse += p.pulseSpeed * dt;
          const currentAlpha = p.alpha + Math.sin(p.pulse) * 0.15;

          if (p.isFirefly) {
            const blink = Math.max(0, Math.sin(p.pulse * 2.2) * 0.6 + 0.4);
            ctx.globalAlpha = blink;
            ctx.drawImage(fireflySprite, p.x - p.glowRadius, p.y - p.glowRadius, p.glowRadius * 2, p.glowRadius * 2);
            ctx.globalAlpha = 1.0;
          } else {
            ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));
            const diameter = p.size * 5.6;
            ctx.drawImage(sunMoteSprite, p.x - diameter * 0.5, p.y - diameter * 0.5, diameter, diameter);
            ctx.globalAlpha = 1.0;
          }

          if (p.y < -25) {
            particles[i] = createParticle('SUNNY', width, height, false);
          }
        }
      }

      // === 3. SPLASH BOUNCES (RAIN / STORM) ===
      for (let i = splashes.length - 1; i >= 0; i--) {
        const sp = splashes[i];
        sp.x += sp.vx * dt;
        sp.y += sp.vy * dt;
        sp.vy += 0.25 * dt;
        sp.alpha -= 0.035 * dt;

        if (sp.alpha <= 0 || sp.y > height) {
          splashes.splice(i, 1);
        } else {
          ctx.fillStyle = `rgba(190, 225, 255, ${sp.alpha})`;
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // === 4. RAIN RIPPLES ===
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.r += 1.3 * dt;
        r.alpha -= 0.024 * dt;
        if (r.alpha <= 0 || r.r >= r.maxR) {
          ripples.splice(i, 1);
        } else {
          ctx.strokeStyle = `rgba(190, 225, 255, ${r.alpha})`;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.r, r.r * 0.28, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // === 5. GLASS CONDENSATION DROPS (RAIN / STORM) ===
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
          gd.trail.push({ x: gd.x, y: gd.y, r: gd.radius * 0.5, alpha: 0.3 });
          if (gd.trail.length > gd.trailLength) gd.trail.shift();
        }

        ctx.fillStyle = 'rgba(210, 235, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(gd.x, gd.y, gd.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(gd.x - gd.radius * 0.35, gd.y - gd.radius * 0.35, gd.radius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        for (const t of gd.trail) {
          t.alpha -= 0.005 * dt;
          if (t.alpha > 0) {
            ctx.fillStyle = `rgba(200, 230, 255, ${t.alpha})`;
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

      // === 6. WIND STREAKS & DEBRIS (STORM) ===
      for (let i = windStreaks.length - 1; i >= 0; i--) {
        const ws = windStreaks[i];
        ws.x += ws.speed * dt;
        ws.life -= 0.009 * dt;

        ctx.strokeStyle = `rgba(190, 210, 255, ${ws.life * ws.alpha})`;
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
          ctx.fillStyle = `rgba(140, 160, 190, ${ws.life * 0.6})`;
          ctx.fillRect(-ws.debris.size / 2, -ws.debris.size / 2, ws.debris.size, ws.debris.size);
          ctx.restore();
        }

        if (ws.x > width + 120 || ws.life <= 0) {
          windStreaks[i] = createWindStreak(width, height);
        }
      }

      // === 7. FOG WISPS (COLD / STORM) ===
      for (const fog of fogWisps) {
        fog.x += fog.speedX * dt;
        fog.phase += 0.006 * dt;
        const dynamicAlpha = fog.alpha + Math.sin(fog.phase) * 0.02;

        const grad = ctx.createRadialGradient(
          fog.x + fog.w / 2, fog.y, 0,
          fog.x + fog.w / 2, fog.y, fog.w / 2
        );
        const fogColor = climate === 'COLD' ? '210, 230, 250' : '160, 180, 210';
        grad.addColorStop(0, `rgba(${fogColor}, ${Math.max(0, dynamicAlpha)})`);
        grad.addColorStop(1, `rgba(${fogColor}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(fog.x, fog.y - fog.h / 2, fog.w, fog.h);

        if (fog.x > width + fog.w) fog.x = -fog.w;
        if (fog.x < -fog.w * 2) fog.x = width;
      }

      // === 8. SMOKE TENDRILS (HOT) ===
      for (const smoke of smokeTendrils) {
        smoke.y += smoke.speedY * dt;
        smoke.x += (smoke.speedX + Math.sin(frame * 0.012 + smoke.phase) * 0.6) * dt;
        smoke.phase += 0.022 * dt;

        const grad = ctx.createRadialGradient(smoke.x, smoke.y, 0, smoke.x, smoke.y, smoke.size);
        grad.addColorStop(0, `rgba(90, 45, 20, ${smoke.alpha})`);
        grad.addColorStop(0.5, `rgba(70, 35, 15, ${smoke.alpha * 0.5})`);
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
