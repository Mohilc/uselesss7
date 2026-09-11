import React from 'react';

/**
 * AvatarCostumes — Ultra-Immersive Dynamic Accessories & Outfits for MoodCore
 * 
 * Adapts to every climate and emotional state:
 *  - RAIN / RAINY: Bright yellow raincoat & canopy umbrella with bouncing raindrops
 *  - STORM: Cyber storm umbrella with lightning rod, mini storm cloud & slicker
 *  - COLD / FREEZE: Cozy knitted winter beanie with pompom & fluttering woolen scarf
 *  - HOT / FIRE: Flaming martial arts headband, cooling hand fan & steam vents
 *  - WARM / STRESSED: Classic medical ice pack, whirring mini desk fan & sweat beads
 *  - SUNNY / HAPPY: Cool aviator sunglasses & tropical coconut drink with umbrella
 *  - EXCITED: Cyber flight goggles & dual rocket thrusters with plasma jet flames
 *  - NEUTRAL: Neon DJ headphones with pulsing EQ frequency visualizers & zen halo
 */
const AvatarCostumes = ({
  climate = 'SUNNY',
  moodKey = 'HAPPY',
  isSpecialAction = false,
  onTriggerSpecialAction,
}) => {
  // Normalize climate string
  const normalizedClimate = (climate || '').toUpperCase();
  const isRain = normalizedClimate === 'RAIN' || normalizedClimate === 'RAINY' || moodKey === 'SAD';
  const isStorm = normalizedClimate === 'STORM' || moodKey === 'LONELY';
  const isCold = normalizedClimate === 'COLD' || normalizedClimate === 'FREEZING' || moodKey === 'COLD';
  const isHot = normalizedClimate === 'HOT' || normalizedClimate === 'FIRE' || moodKey === 'ANGRY';
  const isStressed = normalizedClimate === 'WARM' || moodKey === 'STRESSED';
  const isExcited = moodKey === 'EXCITED';
  const isSunny = !isRain && !isStorm && !isCold && !isHot && !isStressed && !isExcited && (normalizedClimate === 'SUNNY' || moodKey === 'HAPPY');
  const isNeutral = !isRain && !isStorm && !isCold && !isHot && !isStressed && !isExcited && !isSunny;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none overflow-visible">
      {/* ─────────────────────────────────────────────────────────────
          1. RAIN / RAINY: Yellow Raincoat, Canopy Umbrella & Splashes
          ───────────────────────────────────────────────────────────── */}
      {isRain && (
        <>
          {/* Canopy Umbrella (Floating overhead) */}
          <div
            onClick={onTriggerSpecialAction}
            className={`absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 w-48 sm:w-56 h-28 pointer-events-auto cursor-pointer transition-transform ${
              isSpecialAction ? 'animate-umbrella-twirl' : 'animate-umbrella-sway'
            }`}
            style={{ transformOrigin: '50% 90%' }}
            title="Click to twirl raincoat umbrella!"
          >
            {/* Top Umbrella Canopy SVG */}
            <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-2xl overflow-visible">
              <defs>
                <linearGradient id="umbrella-yellow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="30%" stopColor="#facc15" />
                  <stop offset="85%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>
                <linearGradient id="umbrella-rib" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fde047" />
                  <stop offset="100%" stopColor="#a16207" />
                </linearGradient>
                <linearGradient id="metallic-shaft" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="50%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
              </defs>

              {/* Raindrops splashing off canopy apex */}
              <g className="animate-rain-splash" style={{ transformOrigin: '100px 10px' }}>
                <circle cx="85" cy="12" r="2.5" fill="#38bdf8" opacity="0.9" />
                <circle cx="100" cy="5" r="3" fill="#bae6fd" opacity="0.95" />
                <circle cx="115" cy="14" r="2.5" fill="#38bdf8" opacity="0.9" />
              </g>

              {/* Umbrella Center Tip / Ferrule */}
              <path d="M 98,12 L 100,2 L 102,12 Z" fill="url(#metallic-shaft)" stroke="#475569" strokeWidth="0.8" />
              <circle cx="100" cy="2" r="2.5" fill="#e2e8f0" />

              {/* Arched Umbrella Canopy Segments */}
              <path
                d="M 12,58 Q 55,8 100,10 Q 145,8 188,58 Q 166,50 144,56 Q 122,50 100,56 Q 78,50 56,56 Q 34,50 12,58 Z"
                fill="url(#umbrella-yellow)"
                stroke="#ca8a04"
                strokeWidth="1.5"
                style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.4))' }}
              />

              {/* Rib Highlights */}
              <path d="M 100,10 Q 75,32 56,56" fill="none" stroke="url(#umbrella-rib)" strokeWidth="1.2" opacity="0.75" />
              <path d="M 100,10 Q 100,34 100,56" fill="none" stroke="url(#umbrella-rib)" strokeWidth="1.2" opacity="0.75" />
              <path d="M 100,10 Q 125,32 144,56" fill="none" stroke="url(#umbrella-rib)" strokeWidth="1.2" opacity="0.75" />

              {/* Scallop edge accents */}
              <circle cx="12" cy="58" r="2" fill="#ca8a04" />
              <circle cx="56" cy="56" r="2" fill="#ca8a04" />
              <circle cx="100" cy="56" r="2" fill="#ca8a04" />
              <circle cx="144" cy="56" r="2" fill="#ca8a04" />
              <circle cx="188" cy="58" r="2" fill="#ca8a04" />

              {/* Umbrella Shaft */}
              <line x1="100" y1="56" x2="100" y2="102" stroke="url(#metallic-shaft)" strokeWidth="3" strokeLinecap="round" />

              {/* Curved J-Hook Handle */}
              <path
                d="M 100,102 C 100,114 114,114 114,106 C 114,102 109,102 109,105"
                fill="none"
                stroke="#ca8a04"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Yellow Raincoat Collar & Slicker Drapery (Wrapped around lower sphere) */}
          <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 w-36 sm:w-44 h-16 pointer-events-none z-30">
            <svg viewBox="0 0 160 65" className="w-full h-full drop-shadow-xl overflow-visible">
              <defs>
                <linearGradient id="raincoat-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="40%" stopColor="#facc15" />
                  <stop offset="100%" stopColor="#ca8a04" />
                </linearGradient>
              </defs>

              {/* Slicker Collar Wings */}
              <path
                d="M 22,12 C 45,26 65,30 80,30 C 95,30 115,26 138,12 C 130,42 105,58 80,58 C 55,58 30,42 22,12 Z"
                fill="url(#raincoat-grad)"
                stroke="#b45309"
                strokeWidth="1.8"
              />

              {/* Collar Fold Lapels */}
              <path d="M 50,18 L 80,32 L 68,44 Z" fill="#fde047" opacity="0.8" stroke="#b45309" strokeWidth="1" />
              <path d="M 110,18 L 80,32 L 92,44 Z" fill="#fde047" opacity="0.8" stroke="#b45309" strokeWidth="1" />

              {/* Front Center Placket & Wooden Toggle Buttons */}
              <line x1="80" y1="32" x2="80" y2="56" stroke="#b45309" strokeWidth="1.5" />
              
              {/* Toggle Button 1 */}
              <rect x="75" y="36" width="10" height="3" rx="1.5" fill="#78350f" stroke="#fde047" strokeWidth="0.8" />
              <circle cx="80" cy="37.5" r="1" fill="#fef08a" />

              {/* Toggle Button 2 */}
              <rect x="75" y="47" width="10" height="3" rx="1.5" fill="#78350f" stroke="#fde047" strokeWidth="0.8" />
              <circle cx="80" cy="48.5" r="1" fill="#fef08a" />
            </svg>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. STORM: Storm-Buster Umbrella with Lightning Rod & Poncho
          ───────────────────────────────────────────────────────────── */}
      {isStorm && (
        <>
          {/* Hovering Mini Storm Thundercloud */}
          <div className="absolute -top-20 sm:-top-24 left-1/2 -translate-x-1/2 w-40 h-14 pointer-events-none animate-mini-cloud z-40">
            <svg viewBox="0 0 140 50" className="w-full h-full drop-shadow-[0_0_15px_rgba(147,51,234,0.5)]">
              <path
                d="M 25,35 C 10,35 0,25 5,14 C 10,2 28,0 38,6 C 46,-2 68,-2 78,6 C 88,0 110,2 115,14 C 125,22 120,35 105,35 Z"
                fill="#1e1b4b"
                stroke="#6366f1"
                strokeWidth="1.5"
                opacity="0.95"
              />
              {/* Miniature Raindrops */}
              <line x1="45" y1="38" x2="42" y2="48" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="70" y1="38" x2="67" y2="48" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
              <line x1="95" y1="38" x2="92" y2="48" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>
          </div>

          {/* High-Tech Storm Umbrella */}
          <div
            onClick={onTriggerSpecialAction}
            className={`absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 w-48 sm:w-56 h-28 pointer-events-auto cursor-pointer transition-transform ${
              isSpecialAction ? 'animate-umbrella-twirl' : 'animate-umbrella-sway'
            }`}
            style={{ transformOrigin: '50% 90%' }}
            title="Click to activate storm lightning rod!"
          >
            <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-[0_0_20px_rgba(99,102,241,0.6)] overflow-visible">
              <defs>
                <linearGradient id="storm-canopy" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4c1d95" />
                  <stop offset="50%" stopColor="#2e1065" />
                  <stop offset="100%" stopColor="#1e1b4b" />
                </linearGradient>
              </defs>

              {/* Lightning Rod Tip with Electric Sparks */}
              <g className="animate-lightning-zap">
                <line x1="100" y1="4" x2="94" y2="-8" stroke="#38bdf8" strokeWidth="1.5" />
                <line x1="94" y1="-8" x2="104" y2="-6" stroke="#c084fc" strokeWidth="1.5" />
                <line x1="104" y1="-6" x2="100" y2="-16" stroke="#38bdf8" strokeWidth="2" />
                <circle cx="100" cy="-16" r="3" fill="#ffffff" filter="drop-shadow(0 0 6px #38bdf8)" />
              </g>

              {/* Lightning Rod Shaft */}
              <line x1="100" y1="12" x2="100" y2="-2" stroke="#a855f7" strokeWidth="2.5" />
              <circle cx="100" cy="-2" r="3" fill="#06b6d4" />

              {/* Storm Canopy */}
              <path
                d="M 12,58 Q 55,6 100,10 Q 145,6 188,58 Q 166,48 144,55 Q 122,48 100,55 Q 78,48 56,55 Q 34,48 12,58 Z"
                fill="url(#storm-canopy)"
                stroke="#8b5cf6"
                strokeWidth="1.8"
              />

              {/* Glowing Neon Cyber Ribs */}
              <path d="M 100,10 Q 75,30 56,55" fill="none" stroke="#06b6d4" strokeWidth="1.4" opacity="0.9" />
              <path d="M 100,10 Q 100,32 100,55" fill="none" stroke="#c084fc" strokeWidth="1.4" opacity="0.9" />
              <path d="M 100,10 Q 125,30 144,55" fill="none" stroke="#06b6d4" strokeWidth="1.4" opacity="0.9" />

              {/* Metallic Shaft */}
              <line x1="100" y1="55" x2="100" y2="102" stroke="#cbd5e1" strokeWidth="3" />
              <path
                d="M 100,102 C 100,114 114,114 114,106 C 114,102 109,102 109,105"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Cyber Storm Poncho */}
          <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 w-36 sm:w-44 h-16 pointer-events-none z-30">
            <svg viewBox="0 0 160 65" className="w-full h-full drop-shadow-xl overflow-visible">
              <path
                d="M 22,12 C 45,26 65,30 80,30 C 95,30 115,26 138,12 C 130,42 105,58 80,58 C 55,58 30,42 22,12 Z"
                fill="#2e1065"
                stroke="#8b5cf6"
                strokeWidth="1.8"
              />
              {/* Reflective Cyber Trim */}
              <path d="M 32,32 Q 80,48 128,32" fill="none" stroke="#06b6d4" strokeWidth="2" opacity="0.85" strokeDasharray="6 3" />
            </svg>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. COLD: Knitted Winter Beanie, Scarf, Pompom & Frost Breath
          ───────────────────────────────────────────────────────────── */}
      {isCold && (
        <>
          {/* Knitted Winter Beanie with Fluffy Pompom */}
          <div
            onClick={onTriggerSpecialAction}
            className="absolute -top-11 sm:-top-13 left-1/2 -translate-x-1/2 w-36 sm:w-40 h-24 pointer-events-auto cursor-pointer z-30 drop-shadow-[0_4px_12px_rgba(56,189,248,0.4)]"
            title="Click to bounce winter pompom!"
          >
            <svg viewBox="0 0 160 100" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="beanie-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
              </defs>

              {/* Bouncing Fluffy Pompom */}
              <g className="animate-pompom-bob" style={{ transformOrigin: '80px 22px' }}>
                <circle cx="80" cy="20" r="14" fill="#ffffff" stroke="#bae6fd" strokeWidth="2" />
                {/* Fluff spikes */}
                <circle cx="74" cy="14" r="4" fill="#e0f2fe" />
                <circle cx="86" cy="14" r="4" fill="#e0f2fe" />
                <circle cx="73" cy="24" r="3.5" fill="#e0f2fe" />
                <circle cx="87" cy="24" r="3.5" fill="#e0f2fe" />
              </g>

              {/* Beanie Main Dome */}
              <path
                d="M 30,75 C 30,35 60,25 80,25 C 100,25 130,35 130,75 Z"
                fill="url(#beanie-grad)"
                stroke="#bae6fd"
                strokeWidth="1.8"
              />

              {/* Knitted Nordic Snowflake Pattern Stripe */}
              <path d="M 40,54 Q 80,48 120,54" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 3" />

              {/* Ribbed Foldover Brim */}
              <rect x="25" y="70" width="110" height="15" rx="6" fill="#0284c7" stroke="#ffffff" strokeWidth="1.6" />
              <line x1="45" y1="70" x2="45" y2="85" stroke="#bae6fd" strokeWidth="1.2" />
              <line x1="65" y1="70" x2="65" y2="85" stroke="#bae6fd" strokeWidth="1.2" />
              <line x1="80" y1="70" x2="80" y2="85" stroke="#bae6fd" strokeWidth="1.2" />
              <line x1="95" y1="70" x2="95" y2="85" stroke="#bae6fd" strokeWidth="1.2" />
              <line x1="115" y1="70" x2="115" y2="85" stroke="#bae6fd" strokeWidth="1.2" />
            </svg>
          </div>

          {/* Frost Breath Cloud Puff */}
          <div className="absolute top-16 -right-6 sm:-right-8 pointer-events-none animate-steam-puff z-30">
            <span className="text-xl opacity-80 select-none">💨</span>
          </div>

          {/* Wrapped Knitted Winter Scarf */}
          <div className="absolute -bottom-4 sm:-bottom-5 left-1/2 -translate-x-1/2 w-40 sm:w-48 h-20 pointer-events-none z-30">
            <svg viewBox="0 0 180 75" className="w-full h-full drop-shadow-xl overflow-visible">
              <defs>
                <linearGradient id="scarf-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="50%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
              </defs>

              {/* Main Neck Wrap */}
              <ellipse cx="90" cy="22" rx="62" ry="16" fill="url(#scarf-grad)" stroke="#bae6fd" strokeWidth="1.8" />
              {/* Texture rib lines */}
              <path d="M 50,16 Q 90,26 130,16" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />
              <path d="M 55,24 Q 90,32 125,24" fill="none" stroke="#ffffff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.8" />

              {/* Hanging Scarf Tail with Flutter */}
              <g className="animate-scarf-flutter" style={{ transformOrigin: '55px 24px' }}>
                <path
                  d="M 45,22 C 40,42 36,60 38,68 C 48,70 56,68 58,66 C 56,58 58,40 55,22 Z"
                  fill="#0284c7"
                  stroke="#bae6fd"
                  strokeWidth="1.5"
                />
                {/* Fringe Tassels */}
                <line x1="39" y1="68" x2="38" y2="76" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" />
                <line x1="44" y1="69" x2="43" y2="77" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <line x1="50" y1="69" x2="49" y2="77" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" />
                <line x1="56" y1="67" x2="56" y2="75" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              </g>
            </svg>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. HOT / FIRE: Flaming Martial Arts Headband & Cooling Hand Fan
          ───────────────────────────────────────────────────────────── */}
      {isHot && (
        <>
          {/* Steam Vents from sides */}
          <div className="absolute top-6 -left-6 pointer-events-none animate-steam-puff z-30">
            <span className="text-xl select-none">♨️</span>
          </div>
          <div className="absolute top-6 -right-6 pointer-events-none animate-steam-puff z-30" style={{ animationDelay: '0.9s' }}>
            <span className="text-xl select-none">♨️</span>
          </div>

          {/* Sweating cartoon drops */}
          <div className="absolute top-12 right-6 pointer-events-none animate-sweat-drop z-30">
            <span className="text-sm select-none">💧</span>
          </div>

          {/* Fiery Martial Arts Headband across forehead */}
          <div className="absolute top-6 sm:top-7 left-1/2 -translate-x-1/2 w-44 sm:w-52 h-14 pointer-events-none z-30 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]">
            <svg viewBox="0 0 180 50" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="headband-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="50%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#b91c1c" />
                </linearGradient>
              </defs>

              {/* Headband Front Strip */}
              <path
                d="M 22,20 Q 90,30 158,20 L 158,28 Q 90,38 22,28 Z"
                fill="url(#headband-grad)"
                stroke="#fef08a"
                strokeWidth="1.2"
              />

              {/* Golden Sun Emblem in center */}
              <circle cx="90" cy="27" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />

              {/* Streaming Ribbon Tails flapping on the right */}
              <g className="animate-scarf-flutter" style={{ transformOrigin: '158px 24px' }}>
                <path d="M 158,22 Q 175,18 190,14 Q 185,24 160,26 Z" fill="#ef4444" stroke="#fef08a" strokeWidth="1" />
                <path d="M 158,25 Q 172,32 188,38 Q 178,34 159,28 Z" fill="#dc2626" stroke="#fef08a" strokeWidth="1" />
              </g>
            </svg>
          </div>

          {/* Cooling Folding Hand Fan on the right side */}
          <div
            onClick={onTriggerSpecialAction}
            className="absolute top-16 -right-10 sm:-right-14 w-20 sm:w-24 h-20 pointer-events-auto cursor-pointer animate-fan-flutter z-30 drop-shadow-lg"
            style={{ transformOrigin: '15% 85%' }}
            title="Click to flap cooling fan!"
          >
            <svg viewBox="0 0 90 90" className="w-full h-full overflow-visible">
              {/* Fan Blades Arc */}
              <path
                d="M 15,75 L 20,20 C 45,15 75,25 85,50 L 15,75 Z"
                fill="#f59e0b"
                stroke="#dc2626"
                strokeWidth="1.5"
              />
              <path
                d="M 15,75 L 35,17 C 55,20 75,32 80,45 L 15,75 Z"
                fill="#fbbf24"
                opacity="0.75"
              />
              {/* Fan handle pivot */}
              <circle cx="15" cy="75" r="3.5" fill="#b91c1c" stroke="#fef08a" strokeWidth="1.5" />
            </svg>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. WARM / STRESSED: Classic Ice Pack, USB Mini Desk Fan & Sweat
          ───────────────────────────────────────────────────────────── */}
      {isStressed && (
        <>
          {/* Medical Ice Pack tied on head */}
          <div
            onClick={onTriggerSpecialAction}
            className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 w-28 sm:w-32 h-18 pointer-events-auto cursor-pointer z-30 drop-shadow-md"
            title="Click to cool down with ice pack!"
          >
            <svg viewBox="0 0 120 70" className="w-full h-full overflow-visible">
              {/* Ice Pack Body */}
              <ellipse cx="60" cy="42" rx="34" ry="18" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.8" />
              {/* Polka Dots */}
              <circle cx="48" cy="38" r="2.5" fill="#0284c7" />
              <circle cx="62" cy="36" r="2.5" fill="#0284c7" />
              <circle cx="74" cy="40" r="2.5" fill="#0284c7" />
              <circle cx="56" cy="46" r="2.5" fill="#0284c7" />

              {/* Tied cloth knot & band on top */}
              <rect x="54" y="16" width="12" height="10" rx="3" fill="#0369a1" stroke="#ffffff" strokeWidth="1" />
              <path d="M 52,16 Q 44,8 48,4 Q 56,10 56,16 Z" fill="#38bdf8" />
              <path d="M 68,16 Q 76,8 72,4 Q 64,10 64,16 Z" fill="#38bdf8" />

              {/* Cool Ice Cube Sparkles */}
              <text x="75" y="24" fontSize="14">❄️</text>
            </svg>
          </div>

          {/* Sweating cartoon drop dripping down forehead */}
          <div className="absolute top-10 right-8 pointer-events-none animate-sweat-drop z-30">
            <span className="text-base select-none">💧</span>
          </div>

          {/* Whirring Mini USB Desk Fan on Left */}
          <div
            onClick={onTriggerSpecialAction}
            className="absolute top-14 -left-11 sm:-left-14 w-18 sm:w-20 h-22 pointer-events-auto cursor-pointer z-30"
            title="Click to accelerate desk fan!"
          >
            <svg viewBox="0 0 80 90" className="w-full h-full overflow-visible drop-shadow-md">
              {/* Stand base */}
              <ellipse cx="40" cy="82" rx="18" ry="5" fill="#334155" stroke="#94a3b8" strokeWidth="1.2" />
              <line x1="40" y1="52" x2="40" y2="82" stroke="#64748b" strokeWidth="3" />

              {/* Fan Guard Ring */}
              <circle cx="40" cy="40" r="22" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />

              {/* Spinning 3-Blade Propeller */}
              <g className="animate-prop-whirl" style={{ transformOrigin: '40px 40px' }}>
                <circle cx="40" cy="40" r="4" fill="#38bdf8" />
                <path d="M 40,40 Q 30,22 40,18 Q 48,26 40,40 Z" fill="#67e8f9" opacity="0.9" />
                <path d="M 40,40 Q 56,38 60,46 Q 48,52 40,40 Z" fill="#67e8f9" opacity="0.9" />
                <path d="M 40,40 Q 32,58 24,54 Q 30,44 40,40 Z" fill="#67e8f9" opacity="0.9" />
              </g>

              {/* Breeze wind lines */}
              <path d="M 64,30 Q 75,28 85,32" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
              <path d="M 66,42 Q 78,40 88,44" fill="none" stroke="#67e8f9" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
            </svg>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. SUNNY: Cool Sunglasses, Sun Visor & Tropical Drink
          ───────────────────────────────────────────────────────────── */}
      {isSunny && (
        <>
          {/* Aviator Sunglasses resting over eyes */}
          <div
            onClick={onTriggerSpecialAction}
            className={`absolute top-11 sm:top-14 left-1/2 -translate-x-1/2 w-36 sm:w-42 h-14 pointer-events-auto cursor-pointer z-30 transition-transform ${
              isSpecialAction ? 'animate-shades-wink' : ''
            }`}
            title="Click to toggle sunglasses wink!"
          >
            <svg viewBox="0 0 160 55" className="w-full h-full overflow-visible drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              <defs>
                <linearGradient id="shades-lens" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="40%" stopColor="#0f172a" />
                  <stop offset="75%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
              </defs>

              {/* Top Frame Bar */}
              <line x1="25" y1="18" x2="135" y2="18" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
              {/* Bridge */}
              <path d="M 72,18 Q 80,14 88,18" fill="none" stroke="#f59e0b" strokeWidth="2.5" />

              {/* Left Lens */}
              <path
                d="M 30,18 C 30,38 48,46 68,46 C 75,46 76,38 76,18 Z"
                fill="url(#shades-lens)"
                stroke="#f59e0b"
                strokeWidth="2"
              />
              {/* Left Lens Polarized Specular Shine */}
              <line x1="38" y1="22" x2="52" y2="38" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />

              {/* Right Lens */}
              <path
                d="M 84,18 C 84,38 85,46 92,46 C 112,46 130,38 130,18 Z"
                fill="url(#shades-lens)"
                stroke="#f59e0b"
                strokeWidth="2"
              />
              {/* Right Lens Polarized Specular Shine */}
              <line x1="92" y1="22" x2="106" y2="38" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>

          {/* Tropical Drink with Striped Straw & Cocktail Umbrella on the right */}
          <div
            onClick={onTriggerSpecialAction}
            className="absolute -bottom-2 -right-8 sm:-right-10 w-16 h-18 pointer-events-auto cursor-pointer z-30 drop-shadow-lg transition-transform hover:scale-110"
            title="Click to sip tropical coconut drink!"
          >
            <svg viewBox="0 0 70 80" className="w-full h-full overflow-visible">
              {/* Coconut Shell Body */}
              <ellipse cx="35" cy="52" rx="20" ry="18" fill="#451a03" stroke="#78350f" strokeWidth="2" />
              {/* White Coconut Rim */}
              <ellipse cx="35" cy="40" rx="16" ry="6" fill="#f8fafc" stroke="#b45309" strokeWidth="1" />

              {/* Striped Straw */}
              <line x1="32" y1="40" x2="22" y2="12" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
              <line x1="30" y1="36" x2="28" y2="30" stroke="#ffffff" strokeWidth="3" />
              <line x1="26" y1="24" x2="24" y2="18" stroke="#ffffff" strokeWidth="3" />

              {/* Tiny Cocktail Umbrella */}
              <path d="M 40,36 L 56,18 L 38,28 Z" fill="#ec4899" stroke="#f43f5e" strokeWidth="1" />
              <line x1="40" y1="38" x2="48" y2="24" stroke="#ca8a04" strokeWidth="1.5" />
            </svg>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. EXCITED: Cyber Aviator Goggles & Dual Rocket Thrusters
          ───────────────────────────────────────────────────────────── */}
      {isExcited && (
        <>
          {/* Cyber Aviator Flight Goggles */}
          <div
            onClick={onTriggerSpecialAction}
            className="absolute top-5 sm:top-6 left-1/2 -translate-x-1/2 w-36 sm:w-44 h-16 pointer-events-auto cursor-pointer z-30 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]"
            title="Click to calibrate flight goggles!"
          >
            <svg viewBox="0 0 160 55" className="w-full h-full overflow-visible">
              {/* Strap */}
              <path d="M 12,25 Q 80,18 148,25" fill="none" stroke="#334155" strokeWidth="5" />
              {/* Bridge */}
              <rect x="74" y="20" width="12" height="6" rx="2" fill="#d97706" stroke="#fef08a" strokeWidth="1" />

              {/* Left Lens Rim */}
              <circle cx="52" cy="24" r="18" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="3.5" />
              <circle cx="52" cy="24" r="14" fill="#06b6d4" opacity="0.85" />
              <circle cx="48" cy="20" r="4" fill="#ffffff" opacity="0.8" />

              {/* Right Lens Rim */}
              <circle cx="108" cy="24" r="18" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="3.5" />
              <circle cx="108" cy="24" r="14" fill="#ec4899" opacity="0.85" />
              <circle cx="104" cy="20" r="4" fill="#ffffff" opacity="0.8" />
            </svg>
          </div>

          {/* Dual Rocket Thruster Flames Underneath */}
          <div className="absolute -bottom-7 sm:-bottom-9 left-1/2 -translate-x-1/2 w-36 sm:w-44 h-16 pointer-events-none z-10 flex justify-between px-6">
            {/* Left Rocket Jet */}
            <div className="flex flex-col items-center animate-thruster-jet">
              <div className="w-4 h-3 bg-slate-700 border border-slate-500 rounded-t-sm" />
              <div className="w-5 h-9 rounded-b-full bg-gradient-to-b from-amber-400 via-orange-500 to-transparent" />
            </div>

            {/* Right Rocket Jet */}
            <div className="flex flex-col items-center animate-thruster-jet" style={{ animationDelay: '0.08s' }}>
              <div className="w-4 h-3 bg-slate-700 border border-slate-500 rounded-t-sm" />
              <div className="w-5 h-9 rounded-b-full bg-gradient-to-b from-pink-400 via-purple-600 to-transparent" />
            </div>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. NEUTRAL: Cyber DJ Studio Headphones & Floating Zen Halo
          ───────────────────────────────────────────────────────────── */}
      {isNeutral && (
        <>
          {/* Floating Zen Halo */}
          <div className="absolute -top-10 sm:-top-12 left-1/2 -translate-x-1/2 w-32 sm:w-36 h-8 pointer-events-none animate-float z-30">
            <svg viewBox="0 0 120 30" className="w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(99,102,241,0.8)]">
              <ellipse cx="60" cy="15" rx="46" ry="9" fill="none" stroke="#818cf8" strokeWidth="2.5" />
              <ellipse cx="60" cy="15" rx="40" ry="6" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 4" />
            </svg>
          </div>

          {/* Cyber DJ Studio Headphones */}
          <div
            onClick={onTriggerSpecialAction}
            className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 w-48 sm:w-56 h-36 pointer-events-auto cursor-pointer z-30 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            title="Click to sync DJ bitstream audio!"
          >
            <svg viewBox="0 0 200 130" className="w-full h-full overflow-visible">
              {/* Overhead Padded Headband Arch */}
              <path
                d="M 28,68 C 26,10 174,10 172,68"
                fill="none"
                stroke="#1e293b"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 38,62 C 40,16 160,16 162,62"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeDasharray="8 4"
              />

              {/* Left Earcup with Pulsing EQ */}
              <g transform="translate(14, 56)">
                <rect x="0" y="0" width="22" height="34" rx="10" fill="#0f172a" stroke="#818cf8" strokeWidth="2" />
                <rect x="5" y="7" width="2.5" height="18" rx="1" fill="#06b6d4" className="animate-eq-1" />
                <rect x="10" y="7" width="2.5" height="18" rx="1" fill="#818cf8" className="animate-eq-2" />
                <rect x="15" y="7" width="2.5" height="18" rx="1" fill="#a855f7" className="animate-eq-3" />
              </g>

              {/* Right Earcup with Pulsing EQ */}
              <g transform="translate(164, 56)">
                <rect x="0" y="0" width="22" height="34" rx="10" fill="#0f172a" stroke="#818cf8" strokeWidth="2" />
                <rect x="5" y="7" width="2.5" height="18" rx="1" fill="#a855f7" className="animate-eq-3" />
                <rect x="10" y="7" width="2.5" height="18" rx="1" fill="#818cf8" className="animate-eq-2" />
                <rect x="15" y="7" width="2.5" height="18" rx="1" fill="#06b6d4" className="animate-eq-1" />
              </g>
            </svg>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(AvatarCostumes);
