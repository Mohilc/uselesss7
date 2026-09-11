import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Maximize2,
  Minimize2,
  Check,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';

const QUICK_EMOTIONS = [
  { key: 'HAPPY', label: 'Joy', emoji: '😊', temp: 45, wifi: 90, color: 'text-emerald-300 hover:border-emerald-400' },
  { key: 'ANGRY', label: 'Blaze', emoji: '😡', temp: 88, wifi: 65, color: 'text-rose-300 hover:border-rose-400' },
  { key: 'COLD', label: 'Frost', emoji: '🥶', temp: 34, wifi: 75, color: 'text-cyan-300 hover:border-cyan-400' },
  { key: 'STRESSED', label: 'Redline', emoji: '🥵', temp: 74, wifi: 60, color: 'text-amber-300 hover:border-amber-400' },
  { key: 'EXCITED', label: 'Turbo', emoji: '🤩', temp: 48, wifi: 98, color: 'text-pink-300 hover:border-pink-400' },
  { key: 'NEUTRAL', label: 'Zen', emoji: '😐', temp: 48, wifi: 50, color: 'text-indigo-300 hover:border-indigo-400' },
  { key: 'SAD', label: 'Rain', emoji: '😔', temp: 50, wifi: 20, color: 'text-slate-300 hover:border-slate-400' },
  { key: 'LONELY', label: 'Void', emoji: '😭', temp: 50, wifi: 0, color: 'text-purple-300 hover:border-purple-400' },
];

const PERSONALITIES = ['Sarcastic', 'Dramatic', 'Zen', 'Gamer', 'Tsundere'];

const CyberDock = ({
  currentMoodKey = 'HAPPY',
  personality = 'Sarcastic',
  onPersonalityChange,
  onApplyQuickMood,
  soundEnabled = false,
  onToggleSound,
  volume = 35,
  onVolumeChange,
  voiceEnabled = true,
  onToggleVoice,
  zenMode = false,
  onToggleZenMode,
  isSimulated = false,
  onResetHardware,
  onSetSimulationValues,
  currentTemp = 45,
  currentWifi = 80,
}) => {
  const [showSimSliders, setShowSimSliders] = useState(false);
  const [tempSlider, setTempSlider] = useState(currentTemp);
  const [wifiSlider, setWifiSlider] = useState(currentWifi);

  const handleApplySliders = () => {
    if (onSetSimulationValues) {
      onSetSimulationValues({
        temperature: Number(tempSlider),
        wifiSignal: Number(wifiSlider),
        connected: Number(wifiSlider) > 0,
      });
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none relative z-30">
      {/* Expandable Mini Hardware Simulator Slider Popover */}
      {showSimSliders && (
        <div className="mb-3 w-full max-w-md glass-panel rounded-2xl p-4 border border-white/15 shadow-2xl animate-fade-in backdrop-blur-xl relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-200">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Hardware Simulation Studio</span>
            </div>
            <button
              onClick={() => setShowSimSliders(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between text-slate-300 font-mono mb-1 text-[11px]">
                <span>Simulated CPU Temp:</span>
                <strong className="text-emerald-300">{tempSlider}°C</strong>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                value={tempSlider}
                onChange={(e) => {
                  setTempSlider(e.target.value);
                  if (onSetSimulationValues) {
                    onSetSimulationValues({
                      temperature: Number(e.target.value),
                      wifiSignal: Number(wifiSlider),
                      connected: Number(wifiSlider) > 0,
                    });
                  }
                }}
                className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Wi-Fi Signal Slider */}
            <div>
              <div className="flex justify-between text-slate-300 font-mono mb-1 text-[11px]">
                <span>Simulated Wi-Fi Strength:</span>
                <strong className="text-sky-300">{wifiSlider}%</strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={wifiSlider}
                onChange={(e) => {
                  setWifiSlider(e.target.value);
                  if (onSetSimulationValues) {
                    onSetSimulationValues({
                      temperature: Number(tempSlider),
                      wifiSignal: Number(e.target.value),
                      connected: Number(e.target.value) > 0,
                    });
                  }
                }}
                className="w-full accent-sky-400 h-1.5 bg-white/10 rounded-lg cursor-pointer"
              />
            </div>

            {/* Reset to Hardware button */}
            {isSimulated && (
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    if (onResetHardware) onResetHardware();
                    setShowSimSliders(false);
                  }}
                  className="px-3 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Return to Live Hardware</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Floating Glassmorphic Dock */}
      <div className="glass-panel rounded-full px-3 py-2 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 sm:gap-4 shadow-2xl border border-white/15 max-w-4xl w-full">
        {/* Emotion Preset Chips */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
          <div className="hidden md:flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mood:</span>
          </div>
          {QUICK_EMOTIONS.map((item) => {
            const isSelected = currentMoodKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onApplyQuickMood(item)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 shrink-0 ${
                  isSelected
                    ? 'bg-indigo-600/50 border-indigo-400 text-white shadow-md shadow-indigo-500/30 scale-105'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/25'
                } ${item.color}`}
                title={`Feel ${item.label} (${item.temp}°C, ${item.wifi}% Wi-Fi)`}
              >
                <span>{item.emoji}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
          {/* Persona selector pill */}
          <select
            value={personality}
            onChange={(e) => onPersonalityChange(e.target.value)}
            className="bg-white/5 border border-white/10 text-slate-200 text-xs rounded-full px-2.5 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer"
            title="Switch Laptop Persona"
          >
            {PERSONALITIES.map((p) => (
              <option key={p} value={p} className="bg-slate-900 text-white">
                {p}
              </option>
            ))}
          </select>

          {/* Sound Synthesizer & Volume */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
            <button
              onClick={onToggleSound}
              className="text-slate-300 hover:text-white transition-colors"
              title={soundEnabled ? 'Mute Ambient Audio' : 'Play Generative Weather Audio'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            {soundEnabled && (
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={onVolumeChange}
                className="w-12 sm:w-16 accent-emerald-400 h-1 bg-white/20 rounded-lg cursor-pointer"
                title={`Volume: ${volume}%`}
              />
            )}
          </div>

          {/* Voice Commentary Toggle */}
          <button
            onClick={onToggleVoice}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${
              voiceEnabled
                ? 'bg-indigo-600/30 border-indigo-400/50 text-indigo-200'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
            title="Toggle Voice Speech Synthesis"
          >
            <Radio className="w-3 h-3" />
            <span className="hidden sm:inline">Voice</span>
          </button>

          {/* Hardware Sliders Toggle */}
          <button
            onClick={() => setShowSimSliders(!showSimSliders)}
            className={`p-1.5 rounded-full border transition-all ${
              showSimSliders || isSimulated
                ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
            title="Hardware Simulation Sliders"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Zen View Mode Toggle */}
          <button
            onClick={onToggleZenMode}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${
              zenMode
                ? 'bg-purple-600/40 border-purple-400/60 text-purple-200 shadow-sm'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
            title="Toggle Zen Companion Mode (Hide HUD for pure companion view)"
          >
            <span>{zenMode ? 'Exit Zen' : 'Zen'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CyberDock);
