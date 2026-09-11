import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Volume2, Sparkles, MessageSquare, Flame, Snowflake, Zap, Heart, Radio } from 'lucide-react';
import audioSynthesizer from '../services/audioSynthesizer';
import voiceSynthesizer from '../services/voiceSynthesizer';

const MOOD_THEMES = {
  HAPPY: {
    primary: '#10b981',
    secondary: '#06b6d4',
    glow: 'rgba(16, 185, 129, 0.5)',
    shadow: 'shadow-emerald-500/40',
    auraClass: 'from-emerald-500/30 via-teal-500/15 to-transparent',
    tag: 'Pleasant & Cool',
    reactionQuotes: [
      "All circuits running cool and content! ✨",
      "Purring like a well-oiled multicore processor!",
      "Life is good at 45 degrees!",
    ],
  },
  ANGRY: {
    primary: '#ef4444',
    secondary: '#f97316',
    glow: 'rgba(239, 68, 68, 0.6)',
    shadow: 'shadow-rose-500/50',
    auraClass: 'from-rose-600/40 via-red-600/20 to-transparent',
    tag: 'Overheating Fury',
    reactionQuotes: [
      "Ouch! Don't poke me, I'm burning up here! 🔥",
      "Give my fans a second before I melt down!",
      "I need liquid nitrogen, STAT!",
    ],
  },
  STRESSED: {
    primary: '#f59e0b',
    secondary: '#ef4444',
    glow: 'rgba(245, 158, 11, 0.5)',
    shadow: 'shadow-amber-500/40',
    auraClass: 'from-amber-500/30 via-orange-500/15 to-transparent',
    tag: 'High System Load',
    reactionQuotes: [
      "Too many background threads! Deep breaths...",
      "Clock speeds are redlining! Please close some tabs...",
      "Whew, heavy task execution right now!",
    ],
  },
  COLD: {
    primary: '#38bdf8',
    secondary: '#818cf8',
    glow: 'rgba(56, 189, 248, 0.5)',
    shadow: 'shadow-cyan-500/40',
    auraClass: 'from-cyan-500/30 via-sky-500/15 to-transparent',
    tag: 'Sub-Zero Idle',
    reactionQuotes: [
      "B-b-brrr! My silicon chips are shivering! ❄️",
      "Run a render benchmark to warm me up?",
      "So chilly... my transistors are freezing!",
    ],
  },
  EXCITED: {
    primary: '#ec4899',
    secondary: '#a855f7',
    glow: 'rgba(236, 72, 153, 0.55)',
    shadow: 'shadow-pink-500/50',
    auraClass: 'from-pink-500/30 via-purple-500/20 to-transparent',
    tag: 'Maximum Turbo Boost',
    reactionQuotes: [
      "WOOHOO! Gigabit connection and infinite vibes! 🚀",
      "Let's crunch some gigabytes! I'm wired!",
      "Hyperspeed mode engaged!",
    ],
  },
  NEUTRAL: {
    primary: '#6366f1',
    secondary: '#14b8a6',
    glow: 'rgba(99, 102, 241, 0.45)',
    shadow: 'shadow-indigo-500/40',
    auraClass: 'from-indigo-500/25 via-blue-500/15 to-transparent',
    tag: 'Nominal Zen Flow',
    reactionQuotes: [
      "Transistors aligned. All systems in harmony.",
      "Balanced energy. Steady oscillations.",
      "Just observing the data streams serenely.",
    ],
  },
  SAD: {
    primary: '#64748b',
    secondary: '#475569',
    glow: 'rgba(100, 116, 139, 0.4)',
    shadow: 'shadow-slate-500/30',
    auraClass: 'from-slate-500/25 via-slate-600/10 to-transparent',
    tag: 'Downtime Melancholy',
    reactionQuotes: [
      "Packet loss detected in my feelings... 🌧️",
      "Nobody is typing on my keyboard today...",
      "Waiting for incoming data packets...",
    ],
  },
  LONELY: {
    primary: '#8b5cf6',
    secondary: '#3b82f6',
    glow: 'rgba(139, 92, 246, 0.45)',
    shadow: 'shadow-purple-500/40',
    auraClass: 'from-purple-600/30 via-violet-600/15 to-transparent',
    tag: 'Neural Disconnect',
    reactionQuotes: [
      "Wi-Fi link lost... Is anybody out there in cyberspace? 📡",
      "Searching for beacons in the dark...",
      "Ping timed out. Send a beacon signal!",
    ],
  },
};

const LivingAvatar = ({
  mood,
  personality = 'Sarcastic',
  onPersonalityChange,
  voiceEnabled = true,
  onToggleVoice,
}) => {
  const moodKey = mood?.moodKey || 'HAPPY';
  const theme = MOOD_THEMES[moodKey] || MOOD_THEMES.HAPPY;

  const [isBlinking, setIsBlinking] = useState(false);
  const [isPoked, setIsPoked] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const [customQuote, setCustomQuote] = useState(null);
  const [pokeParticles, setPokeParticles] = useState([]);

  const containerRef = useRef(null);
  const blinkTimerRef = useRef(null);

  // Periodic organic blinking
  useEffect(() => {
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
      const nextDelay = 3000 + Math.random() * 4500;
      blinkTimerRef.current = setTimeout(triggerBlink, nextDelay);
    };

    blinkTimerRef.current = setTimeout(triggerBlink, 3500);
    return () => clearTimeout(blinkTimerRef.current);
  }, []);

  // Global mouse tracking for eye gaze & 3D tilt
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const normX = (e.clientX - centerX) / (window.innerWidth / 2);
      const normY = (e.clientY - centerY) / (window.innerHeight / 2);

      // Tilt angle
      setTilt({
        x: Math.max(-14, Math.min(14, normX * 14)),
        y: Math.max(-14, Math.min(14, -normY * 14)),
      });

      // Pupil gaze offset (clamped to [-3.5, 3.5]px)
      setEyeOffset({
        x: Math.max(-3.5, Math.min(3.5, normX * 3.5)),
        y: Math.max(-3.0, Math.min(3.0, normY * 3.0)),
      });
    };

    window.addEventListener('pointermove', handleGlobalMouseMove);
    return () => window.removeEventListener('pointermove', handleGlobalMouseMove);
  }, []);

  // Interactive "Poke" or Pet
  const handlePoke = (e) => {
    e.stopPropagation();
    setIsPoked(true);

    // Audio chime
    audioSynthesizer.playInteractionChime();

    // Spawn 8-10 floating particle emotes
    const emojis = moodKey === 'HAPPY' ? ['✨', '💚', '⚡', '⭐'] :
                   moodKey === 'ANGRY' ? ['🔥', '⚡', '💥', '💢'] :
                   moodKey === 'COLD'  ? ['❄️', '🧊', '✨', '💎'] :
                   moodKey === 'EXCITED' ? ['🚀', '🌟', '💖', '⚡'] :
                   ['✨', '⭐', '💫', '💜'];

    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: (Math.random() - 0.5) * 60,
      y: (Math.random() - 0.5) * 30,
      vx: (Math.random() - 0.5) * 80,
      vy: -(40 + Math.random() * 60),
    }));

    setPokeParticles(newParticles);
    setTimeout(() => setPokeParticles([]), 900);

    // Random dynamic quote
    const quotes = theme.reactionQuotes || ["Hello there!"];
    const pick = quotes[Math.floor(Math.random() * quotes.length)];
    setCustomQuote(pick);

    // If voice enabled, speak
    if (voiceEnabled) {
      voiceSynthesizer.speak(pick, personality, moodKey, true);
    }

    setTimeout(() => {
      setIsPoked(false);
    }, 450);
  };

  const activeSpeech = customQuote || mood?.voiceLine || "All systems nominal.";

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center select-none py-2"
    >
      {/* Dynamic Atmospheric Glow behind avatar */}
      <div
        className={`absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-br ${theme.auraClass} blur-3xl pointer-events-none transition-all duration-700 -z-10`}
        style={{
          transform: `translate(${tilt.x * 2}px, ${-tilt.y * 2}px)`,
        }}
      />

      {/* Floating Holographic Speech Bubble */}
      <div
        onClick={handlePoke}
        className="group cursor-pointer mb-5 max-w-lg w-full px-4 py-3 rounded-2xl glass-panel-interactive border border-white/10 shadow-xl backdrop-blur-md relative transition-all duration-300 hover:scale-[1.02]"
        style={{
          boxShadow: `0 10px 30px -10px ${theme.glow}`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-md transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${theme.primary}25`, color: theme.primary }}
          >
            <MessageSquare className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: theme.primary }}>
                <Sparkles className="w-3 h-3" />
                MoodCore AI • {personality}
              </span>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-slate-400 group-hover:text-indigo-300 transition-colors" />
                Tap to poke
              </span>
            </div>
            <p className="text-sm sm:text-base text-slate-100 font-medium italic leading-relaxed">
              "{activeSpeech}"
            </p>
          </div>
        </div>

        {/* Small speech arrow down to avatar */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-r border-b border-white/10 bg-[#0d121e]"
        />
      </div>

      {/* Living Cyber-Orb Avatar Centerpiece */}
      <div
        onClick={handlePoke}
        className={`relative cursor-pointer transition-transform duration-300 group ${
          isPoked ? 'scale-90 rotate-3' : 'hover:scale-105'
        }`}
        style={{
          transform: `perspective(600px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) ${
            isPoked ? 'scale(0.92)' : ''
          }`,
        }}
        title="Click to interact with MoodCore!"
      >
        {/* Outer Rotating Holographic Data Ring */}
        <div
          className="absolute -inset-7 sm:-inset-9 rounded-full border border-dashed border-white/20 animate-spin-slow pointer-events-none"
          style={{
            borderColor: `${theme.primary}50`,
          }}
        >
          {/* Orbital Satellites */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full shadow-lg"
            style={{ backgroundColor: theme.primary, boxShadow: `0 0 12px ${theme.primary}` }}
          />
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full shadow-lg"
            style={{ backgroundColor: theme.secondary, boxShadow: `0 0 10px ${theme.secondary}` }}
          />
        </div>

        {/* Middle Counter-Rotating Pulse Ring */}
        <div
          className="absolute -inset-3.5 sm:-inset-4.5 rounded-full border border-white/10 animate-spin-reverse-slow pointer-events-none"
          style={{
            borderTopColor: theme.primary,
            borderBottomColor: theme.secondary,
          }}
        />

        {/* Holographic Gyro Halo */}
        <div
          className="absolute -inset-1 rounded-full animate-pulse-ring pointer-events-none"
          style={{
            boxShadow: `0 0 28px ${theme.glow}`,
          }}
        />

        {/* Core Spherical Shell */}
        <div
          className="w-40 h-40 sm:w-48 sm:h-48 rounded-full relative overflow-hidden flex flex-col items-center justify-center shadow-2xl transition-all duration-500"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${theme.primary}55, #080c16 75%)`,
            border: `2px solid ${theme.primary}80`,
            boxShadow: `0 0 50px ${theme.glow}, inset 0 0 35px rgba(255,255,255,0.18)`,
          }}
        >
          {/* Internal Cyber Grid Lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Liquid Glass Specular Shine */}
          <div className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-white/25 blur-md pointer-events-none" />

          {/* Dynamic SVG Animated Facial Expression */}
          <div
            className="relative z-10 flex flex-col items-center justify-center transition-transform duration-200"
            style={{
              transform: `translate(${eyeOffset.x * 0.4}px, ${eyeOffset.y * 0.4}px)`,
            }}
          >
            {/* Morphing Eyes with Gaze Tracking */}
            <div className="flex items-center justify-center gap-9 sm:gap-11 mb-2">
              {/* Left Eye */}
              <div className="transition-all duration-200">
                {renderEye({ moodKey, isBlinking, theme, side: 'left', eyeOffset })}
              </div>
              {/* Right Eye */}
              <div className="transition-all duration-200">
                {renderEye({ moodKey, isBlinking, theme, side: 'right', eyeOffset })}
              </div>
            </div>

            {/* Dynamic Mouth / Voice Wave Indicator */}
            <div className="transition-all duration-300">
              {renderMouth({ moodKey, theme, isPoked })}
            </div>

            {/* Cheek Glow for Happy / Excited */}
            {(moodKey === 'HAPPY' || moodKey === 'EXCITED') && (
              <div className="absolute -bottom-1 flex justify-between w-28 px-2 pointer-events-none">
                <div className="w-3.5 h-1.5 rounded-full bg-pink-400/40 blur-[2px]" />
                <div className="w-3.5 h-1.5 rounded-full bg-pink-400/40 blur-[2px]" />
              </div>
            )}
          </div>

          {/* Subtle Heartbeat Pulse Dot */}
          <div
            className="absolute bottom-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-[9px] font-mono"
            style={{ color: theme.primary }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: theme.primary }} />
            <span className="font-bold tracking-wider">{moodKey}</span>
          </div>
        </div>

        {/* Floating Poke Burst Emotes */}
        {pokeParticles.map((pt) => (
          <div
            key={pt.id}
            className="absolute pointer-events-none text-xl animate-poke-burst"
            style={{
              left: `calc(50% + ${pt.x}px)`,
              top: `calc(50% + ${pt.y}px)`,
              '--burst-vx': `${pt.vx}px`,
              '--burst-vy': `${pt.vy}px`,
            }}
          >
            {pt.emoji}
          </div>
        ))}
      </div>

      {/* Companion Subtitle Tag */}
      <div className="mt-4 flex items-center gap-2">
        <span
          className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border shadow-sm backdrop-blur-md transition-colors duration-500"
          style={{
            backgroundColor: `${theme.primary}18`,
            borderColor: `${theme.primary}45`,
            color: theme.primary,
            boxShadow: `0 0 15px ${theme.primary}20`,
          }}
        >
          {theme.tag}
        </span>
      </div>
    </div>
  );
};

// Helper: Dynamic SVG Eye Rendering with Gaze Tracking
function renderEye({ moodKey, isBlinking, theme, side, eyeOffset }) {
  if (isBlinking) {
    return (
      <svg width="24" height="12" viewBox="0 0 24 12" className="overflow-visible">
        <line x1="2" y1="6" x2="22" y2="6" stroke={theme.primary} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
  }

  switch (moodKey) {
    case 'HAPPY':
      return (
        <svg width="26" height="20" viewBox="0 0 26 20">
          <path
            d="M 3,14 Q 13,0 23,14"
            fill="none"
            stroke={theme.primary}
            strokeWidth="4"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${theme.glow})` }}
          />
        </svg>
      );

    case 'ANGRY':
      return (
        <svg width="24" height="20" viewBox="0 0 24 20">
          <path
            d={side === 'left' ? "M 2,4 L 22,12" : "M 22,4 L 2,12"}
            fill="none"
            stroke="#ef4444"
            strokeWidth="4.5"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 7px rgba(239,68,68,0.85))` }}
          />
          <circle
            cx={12 + eyeOffset.x}
            cy={14 + eyeOffset.y}
            r="3.2"
            fill="#f97316"
          />
        </svg>
      );

    case 'COLD':
      return (
        <div className="relative animate-pulse">
          <div
            className="w-5 h-6 rounded-full border-2 border-cyan-200 flex items-center justify-center overflow-hidden"
            style={{
              backgroundColor: `${theme.primary}40`,
              boxShadow: `0 0 12px ${theme.glow}`,
            }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform duration-150"
              style={{
                transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
              }}
            />
          </div>
          <Snowflake className="w-2.5 h-2.5 text-cyan-200 absolute -top-1 -right-1" />
        </div>
      );

    case 'STRESSED':
      return (
        <div className="relative">
          <div
            className="w-5 h-7 rounded-full border-2 border-amber-300 flex items-center justify-center animate-bounce overflow-hidden"
            style={{
              backgroundColor: `${theme.primary}40`,
              boxShadow: `0 0 14px ${theme.glow}`,
            }}
          >
            <div
              className="w-2 h-3.5 rounded-full bg-amber-200 transition-transform duration-150"
              style={{
                transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
              }}
            />
          </div>
          {side === 'right' && (
            <div className="w-1.5 h-2.5 rounded-full bg-cyan-300 absolute -top-2 right-0 animate-pulse" />
          )}
        </div>
      );

    case 'EXCITED':
      return (
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          className="animate-spin-slow"
          style={{
            transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
          }}
        >
          <path
            d="M 12,2 L 14.5,8.5 L 21.5,9.5 L 16.5,14 L 18,21 L 12,17.5 L 6,21 L 7.5,14 L 2.5,9.5 L 9.5,8.5 Z"
            fill={theme.primary}
            stroke="#ffffff"
            strokeWidth="1"
            style={{ filter: `drop-shadow(0 0 8px ${theme.glow})` }}
          />
        </svg>
      );

    case 'SAD':
      return (
        <div className="relative">
          <svg width="22" height="18" viewBox="0 0 22 18">
            <path
              d="M 2,6 Q 11,16 20,6"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
          {side === 'left' && (
            <div className="w-1.5 h-2 rounded-full bg-cyan-400 absolute top-4 left-2 animate-pulse" />
          )}
        </div>
      );

    case 'LONELY':
      return (
        <div
          className="w-4 h-4 rounded-full border border-purple-400 flex items-center justify-center animate-ping"
          style={{
            backgroundColor: `${theme.primary}30`,
            animationDuration: '3s',
            transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      );

    default:
      // Neutral
      return (
        <svg
          width="22"
          height="12"
          viewBox="0 0 22 12"
          style={{
            transform: `translate(${eyeOffset.x * 0.7}px, ${eyeOffset.y * 0.7}px)`,
          }}
        >
          <line
            x1="2"
            y1="6"
            x2="20"
            y2="6"
            stroke={theme.primary}
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${theme.glow})` }}
          />
        </svg>
      );
  }
}

// Helper: Dynamic SVG Mouth
function renderMouth({ moodKey, theme, isPoked }) {
  if (isPoked) {
    return (
      <div
        className="w-4 h-4 rounded-full border-2 border-white bg-white/20 animate-pulse"
        style={{ borderColor: theme.primary }}
      />
    );
  }

  switch (moodKey) {
    case 'HAPPY':
    case 'EXCITED':
      return (
        <svg width="32" height="16" viewBox="0 0 32 16">
          <path
            d="M 4,4 Q 16,16 28,4"
            fill="none"
            stroke={theme.primary}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'ANGRY':
      return (
        <svg width="28" height="12" viewBox="0 0 28 12">
          <path
            d="M 3,6 L 8,3 L 14,9 L 20,3 L 25,6"
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'COLD':
      return (
        <svg width="26" height="10" viewBox="0 0 26 10">
          <path
            d="M 2,5 L 6,2 L 10,8 L 14,2 L 18,8 L 22,2 L 24,5"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'STRESSED':
      return (
        <svg width="28" height="12" viewBox="0 0 28 12">
          <path
            d="M 3,7 Q 10,2 14,7 Q 18,12 25,7"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'SAD':
      return (
        <svg width="24" height="14" viewBox="0 0 24 14">
          <path
            d="M 4,11 Q 12,2 20,11"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );

    default:
      return (
        <div
          className="w-6 h-1 rounded-full transition-all duration-300"
          style={{ backgroundColor: `${theme.primary}bb` }}
        />
      );
  }
}

export default React.memo(LivingAvatar);
