import React from 'react';
import {
  Thermometer,
  Wifi,
  Maximize2,
  Minus,
  X,
  Sparkles,
  GripHorizontal,
} from 'lucide-react';

const ScreenWidget = ({
  telemetry,
  onExpandDashboard,
  onMinimize,
  onClose,
}) => {
  const mood = telemetry?.mood;
  const temp = telemetry?.temperature;
  const wifi = telemetry?.wifi;

  const tempColor =
    (temp?.temperature ?? 0) >= 80
      ? 'text-rose-400'
      : (temp?.temperature ?? 0) >= 65
      ? 'text-amber-400'
      : 'text-emerald-400';

  const wifiColor =
    !wifi?.connected
      ? 'text-red-400'
      : (wifi?.signalStrength ?? 0) < 30
      ? 'text-amber-400'
      : 'text-cyan-400';

  return (
    <div className="w-full h-full bg-slate-950/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl flex flex-col justify-between p-3 select-none overflow-hidden text-slate-100 relative group">
      {/* Dynamic mood ambient glow in background */}
      <div
        className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
        style={{
          background:
            mood?.moodKey === 'ANGRY'
              ? '#ef4444'
              : mood?.moodKey === 'COLD'
              ? '#38bdf8'
              : mood?.moodKey === 'SAD'
              ? '#818cf8'
              : mood?.moodKey === 'LONELY'
              ? '#a855f7'
              : '#10b981',
        }}
      />

      {/* Top Bar: Drag region & Controls */}
      <div
        className="w-full flex items-center justify-between cursor-move"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-semibold tracking-wider uppercase">
          <GripHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>MoodOS Screen Widget</span>
        </div>

        <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
          <button
            onClick={onExpandDashboard}
            className="p-1 text-slate-400 hover:text-emerald-400 hover:bg-white/10 rounded transition-colors"
            title="Open Full Dashboard"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          <button
            onClick={onMinimize}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded transition-colors"
            title="Minimize"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded transition-colors"
            title="Close"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Middle: Mood Avatar + Real-time Telemetry Stats */}
      <div className="flex items-center justify-between gap-3 my-1" style={{ WebkitAppRegion: 'drag' }}>
        {/* Mood Avatar */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-inner relative z-10 animate-bounce-slight">
              {mood?.emoji || '😊'}
            </div>
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight text-white flex items-center gap-1">
              <span>{mood?.name || 'Happy'}</span>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              {mood?.climateEffect ? `${mood.climateEffect.toUpperCase()} VIBE` : 'NORMAL'}
            </div>
          </div>
        </div>

        {/* Telemetry Pills */}
        <div className="flex flex-col gap-1.5 items-end">
          {/* Temperature Pill */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
            <Thermometer className={`w-3.5 h-3.5 ${tempColor}`} />
            <span className={`font-mono font-bold text-xs ${tempColor}`}>
              {temp?.temperature != null ? `${temp.temperature}°C` : '--'}
            </span>
            <span className="text-[9px] text-slate-400 uppercase">
              {temp?.status || 'Normal'}
            </span>
          </div>

          {/* Wi-Fi Pill */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10">
            <Wifi className={`w-3.5 h-3.5 ${wifiColor}`} />
            <span className={`font-mono font-bold text-xs ${wifiColor}`}>
              {wifi?.connected ? `${wifi.signalStrength}%` : 'OFFLINE'}
            </span>
            <span className="text-[9px] text-slate-400 truncate max-w-[70px]">
              {wifi?.ssid || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom: Voice line / Thought bubble */}
      <div
        className="w-full px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300 truncate flex items-center justify-between gap-1"
        style={{ WebkitAppRegion: 'drag' }}
      >
        <span className="truncate italic">
          "{mood?.voiceLine || 'System operating smoothly in standard conditions.'}"
        </span>
        <span className="text-slate-500 font-mono text-[9px] shrink-0">
          {mood?.personality || 'Balanced'}
        </span>
      </div>
    </div>
  );
};

export default ScreenWidget;
