import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  Flame,
  Snowflake,
  CloudRain,
  Zap,
  Sun,
  ShieldAlert,
  Volume2,
  Sparkles,
  Radio,
} from 'lucide-react';
import { setSimulation } from '../services/api';
import audioSynthesizer from '../services/audioSynthesizer';
import voiceSynthesizer from '../services/voiceSynthesizer';

const presets = [
  {
    name: 'Overheating Gaming',
    temp: 88,
    wifi: 95,
    connected: true,
    climate: 'HOT',
    icon: Flame,
    color: 'hover:border-rose-500/50 hover:bg-rose-500/10',
    tag: 'ANGRY / FIRE',
  },
  {
    name: 'Heavy Video Render',
    temp: 72,
    wifi: 80,
    connected: true,
    climate: 'HOT',
    icon: ShieldAlert,
    color: 'hover:border-orange-500/50 hover:bg-orange-500/10',
    tag: 'STRESSED / WARM',
  },
  {
    name: 'Winter Freeze',
    temp: 32,
    wifi: 85,
    connected: true,
    climate: 'COLD',
    icon: Snowflake,
    color: 'hover:border-cyan-500/50 hover:bg-cyan-500/10',
    tag: 'COLD / FROST',
  },
  {
    name: 'Total Disconnect',
    temp: 50,
    wifi: 0,
    connected: false,
    climate: 'STORM',
    icon: Zap,
    color: 'hover:border-purple-500/50 hover:bg-purple-500/10',
    tag: 'LONELY / STORM',
  },
  {
    name: 'Laggy Coffee Shop',
    temp: 52,
    wifi: 22,
    connected: true,
    climate: 'RAINY',
    icon: CloudRain,
    color: 'hover:border-slate-500/50 hover:bg-slate-500/10',
    tag: 'SAD / RAINY',
  },
  {
    name: 'Balanced Nirvana',
    temp: 46,
    wifi: 96,
    connected: true,
    climate: 'SUNNY',
    icon: Sun,
    color: 'hover:border-emerald-500/50 hover:bg-emerald-500/10',
    tag: 'HAPPY / SUNNY',
  },
];

const climates = [
  { id: 'SUNNY', name: 'Sunny Meadow', icon: Sun, color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { id: 'RAINY', name: 'Rainy City', icon: CloudRain, color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
  { id: 'STORM', name: 'Thunderstorm', icon: Zap, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { id: 'HOT', name: 'Inferno Heat', icon: Flame, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  { id: 'COLD', name: 'Arctic Frost', icon: Snowflake, color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
];

const SimulationDrawer = ({ isSimulated, currentTemp, currentWifi, isConnected, onSync }) => {
  const [active, setActive] = useState(isSimulated);
  const [temp, setTemp] = useState(currentTemp || 50);
  const [wifi, setWifi] = useState(currentWifi || 80);
  const [connected, setConnected] = useState(isConnected !== false);
  const [isOpen, setIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    if (currentTemp !== undefined) setTemp(Math.round(currentTemp));
  }, [currentTemp]);

  useEffect(() => {
    if (currentWifi !== undefined) setWifi(currentWifi);
  }, [currentWifi]);

  useEffect(() => {
    if (isConnected !== undefined) setConnected(isConnected);
  }, [isConnected]);

  useEffect(() => {
    setActive(isSimulated);
  }, [isSimulated]);

  const applySimulation = async (simActive, newTemp, newWifi, newConn) => {
    setIsApplying(true);
    try {
      await setSimulation({
        enabled: simActive,
        temperature: newTemp,
        wifiSignal: newWifi,
        wifiConnected: newConn,
      });
      setActive(simActive);
      if (onSync) onSync();
    } catch (err) {
      console.error('Failed to update simulation:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplyPreset = (p) => {
    setTemp(p.temp);
    setWifi(p.wifi);
    setConnected(p.connected);
    audioSynthesizer.playMoodTransition(p.climate);
    applySimulation(true, p.temp, p.wifi, p.connected);
  };

  const handleTestClimateSound = (climateId) => {
    audioSynthesizer.setMuted(false);
    audioSynthesizer.playClimateChangeSound(climateId);
  };

  const handlePreviewVoice = () => {
    voiceSynthesizer.previewVoice(temp);
  };

  const handleResetHardware = () => {
    applySimulation(false, 50, 80, true);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Simulation & Sound FX Studio</h3>
              <span
                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                  active
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {active ? 'Simulation Active' : 'Live Hardware Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {active
                ? 'Manual overrides active. Testing mood, wallpaper, voice pitch, and climate sound effects.'
                : 'Listening to laptop system hardware telemetry.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {active && (
            <button
              onClick={handleResetHardware}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all"
              title="Return to real-time laptop hardware sensors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Return to Real Sensors
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5" />
            {isOpen ? 'Collapse Controls' : 'Open Climate & Voice Studio'}
          </button>
        </div>
      </div>

      {/* Expandable Controls Area */}
      {isOpen && (
        <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
          {/* Quick Presets Bar */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
              Quick Mood & Climate Scenarios
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {presets.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.name}
                    onClick={() => handleApplyPreset(p)}
                    className={`p-2.5 rounded-2xl bg-white/5 border border-white/5 transition-all text-left flex flex-col justify-between ${p.color}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="w-4 h-4 text-slate-300" />
                      <span className="text-[10px] font-bold text-slate-400">{p.temp}°C</span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 truncate">{p.name}</div>
                      <div className="text-[10px] text-indigo-300 font-semibold">{p.tag}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dedicated Climate Sound FX Test Bar */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" /> Climate Change Sound FX Previews
              </span>
              <span className="text-[11px] text-slate-400">Click any climate to audition its sound effect</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {climates.map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleTestClimateSound(c.id)}
                    className={`px-3 py-2 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all hover:scale-105 ${c.color}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/50 p-5 rounded-2xl border border-white/5">
            {/* Temperature Slider with Voice Pitch Feedback */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" /> Target Temperature & Voice Modulation
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviewVoice}
                    className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold hover:bg-rose-500/30 transition-all flex items-center gap-1"
                    title="Test voice at this temperature"
                  >
                    <Volume2 className="w-3 h-3" /> Test Voice
                  </button>
                  <span className="text-sm font-black text-rose-400 font-mono">{temp} °C</span>
                </div>
              </div>
              <input
                type="range"
                min="25"
                max="100"
                value={temp}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTemp(val);
                  voiceSynthesizer.setTemperature(val);
                  applySimulation(true, val, wifi, connected);
                }}
                className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Freezing (Shiver & Slow)</span>
                <span>Balanced (46–62°C)</span>
                <span>Critical Panic (&gt;85°C)</span>
              </div>
            </div>

            {/* Wi-Fi Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-sky-400" /> Wi-Fi Signal Strength
                </label>
                <span className="text-sm font-black text-sky-400 font-mono">
                  {connected ? `${wifi} %` : 'Disconnected'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={connected ? wifi : 0}
                disabled={!connected}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setWifi(val);
                  applySimulation(true, temp, val, true);
                }}
                className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-700 rounded-lg disabled:opacity-40"
              />
              <div className="flex justify-between items-center mt-2">
                <div className="flex justify-between text-[10px] text-slate-400 gap-4">
                  <span>0% (Dead)</span>
                  <span>50%</span>
                  <span>100% (Gigabit)</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                  <input
                    type="checkbox"
                    checked={connected}
                    onChange={(e) => {
                      const isConn = e.target.checked;
                      setConnected(isConn);
                      applySimulation(true, temp, wifi, isConn);
                    }}
                    className="rounded accent-indigo-500 cursor-pointer"
                  />
                  Connected
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimulationDrawer;
