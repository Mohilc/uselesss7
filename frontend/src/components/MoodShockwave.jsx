import React, { useEffect, useState } from 'react';

/**
 * MoodShockwave — Cinematic Atmospheric Energy Resonator
 *
 * Emits an expanding energy shockwave ring, chromatic flash, and aura resonance
 * whenever the laptop's emotion or climate changes state.
 */
const MOOD_COLORS = {
  HAPPY: { glow: '#10b981', ring: 'rgba(16, 185, 129, 0.7)', flash: 'rgba(16, 185, 129, 0.15)' },
  ANGRY: { glow: '#ef4444', ring: 'rgba(239, 68, 68, 0.8)', flash: 'rgba(239, 68, 68, 0.25)' },
  STRESSED: { glow: '#f59e0b', ring: 'rgba(245, 158, 11, 0.75)', flash: 'rgba(245, 158, 11, 0.2)' },
  COLD: { glow: '#38bdf8', ring: 'rgba(56, 189, 248, 0.8)', flash: 'rgba(56, 189, 248, 0.2)' },
  EXCITED: { glow: '#ec4899', ring: 'rgba(236, 72, 153, 0.85)', flash: 'rgba(236, 72, 153, 0.22)' },
  NEUTRAL: { glow: '#6366f1', ring: 'rgba(99, 102, 241, 0.7)', flash: 'rgba(99, 102, 241, 0.15)' },
  SAD: { glow: '#64748b', ring: 'rgba(100, 116, 139, 0.6)', flash: 'rgba(100, 116, 139, 0.12)' },
  LONELY: { glow: '#8b5cf6', ring: 'rgba(139, 92, 246, 0.75)', flash: 'rgba(139, 92, 246, 0.18)' },
};

const MoodShockwave = ({ moodKey, timestamp }) => {
  const [active, setActive] = useState(false);
  const [keyId, setKeyId] = useState(0);

  useEffect(() => {
    if (!moodKey) return;
    setActive(true);
    setKeyId((prev) => prev + 1);

    const timer = setTimeout(() => {
      setActive(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [moodKey, timestamp]);

  if (!active) return null;

  const colorConfig = MOOD_COLORS[moodKey] || MOOD_COLORS.HAPPY;

  return (
    <div
      key={keyId}
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center"
    >
      {/* Full-screen subtle chromatic flash */}
      <div
        className="absolute inset-0 animate-shockwave-flash"
        style={{ backgroundColor: colorConfig.flash }}
      />

      {/* Primary Expanding Energy Wave Ring */}
      <div
        className="w-24 h-24 rounded-full border-2 animate-shockwave-ring"
        style={{
          borderColor: colorConfig.ring,
          boxShadow: `0 0 40px ${colorConfig.glow}, inset 0 0 20px ${colorConfig.glow}`,
        }}
      />

      {/* Secondary Outer Ripple */}
      <div
        className="w-24 h-24 rounded-full border border-dashed animate-shockwave-ring-delayed"
        style={{
          borderColor: colorConfig.glow,
          boxShadow: `0 0 25px ${colorConfig.glow}`,
        }}
      />
    </div>
  );
};

export default React.memo(MoodShockwave);
