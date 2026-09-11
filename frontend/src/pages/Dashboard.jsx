import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Laptop,
  Maximize,
  Minimize,
  Radio,
  Cpu,
  Zap,
  Leaf,
  Activity,
  Gauge,
  Image as ImageIcon,
} from 'lucide-react';
import ClimateEffect from '../components/ClimateEffect';
import LivingAvatar from '../components/LivingAvatar';
import TelemetryRings from '../components/TelemetryRings';
import CyberDock from '../components/CyberDock';
import DesktopTitleBar from '../components/DesktopTitleBar';
import ScreenWidget from '../components/ScreenWidget';
import CyberCursor from '../components/CyberCursor';
import MoodShockwave from '../components/MoodShockwave';
import {
  fetchSystemData,
  connectTelemetryStream,
  setPersonality,
  setSimulation,
  setWallpaperAutoSync,
  fetchWallpaperStatus,
  applyWindowsWallpaper,
} from '../services/api';
import audioSynthesizer from '../services/audioSynthesizer';
import voiceSynthesizer from '../services/voiceSynthesizer';

const Dashboard = () => {
  const [telemetry, setTelemetry] = useState(null);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('moodos_sound_enabled') !== 'false');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [volume, setVolume] = useState(35);
  const [zenMode, setZenMode] = useState(false);
  const [lastMoodKey, setLastMoodKey] = useState(null);
  const [isWallpaperSyncOn, setIsWallpaperSyncOn] = useState(true);
  const [currentMode, setCurrentMode] = useState('dashboard');
  const [fps, setFps] = useState(60);
  const [latencyMs, setLatencyMs] = useState(null);
  const [tempUnit, setTempUnit] = useState(() => localStorage.getItem('moodos_temp_unit') || 'C');
  const [perfMode, setPerfMode] = useState(() => localStorage.getItem('moodos_perf_mode') || 'balanced');

  const soundEnabledRef = useRef(soundEnabled);
  const voiceEnabledRef = useRef(voiceEnabled);
  const lastMoodKeyRef = useRef(lastMoodKey);
  const wsStatusRef = useRef(wsStatus);
  const perfModeRef = useRef(perfMode);

  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { voiceEnabledRef.current = voiceEnabled; }, [voiceEnabled]);
  useEffect(() => { lastMoodKeyRef.current = lastMoodKey; }, [lastMoodKey]);
  useEffect(() => { wsStatusRef.current = wsStatus; }, [wsStatus]);
  useEffect(() => { perfModeRef.current = perfMode; }, [perfMode]);

  // Real-time FPS Monitor
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId;
    const calcFps = (now) => {
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(calcFps);
    };
    animId = requestAnimationFrame(calcFps);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleToggleTempUnit = useCallback(() => {
    setTempUnit((prev) => {
      const next = prev === 'C' ? 'F' : 'C';
      localStorage.setItem('moodos_temp_unit', next);
      return next;
    });
  }, []);

  const handlePerfModeToggle = useCallback(() => {
    const modes = ['balanced', 'ultra', 'eco'];
    setPerfMode((prev) => {
      const next = modes[(modes.indexOf(prev) + 1) % modes.length];
      localStorage.setItem('moodos_perf_mode', next);
      return next;
    });
  }, []);

  // Fetch initial wallpaper auto-sync status
  useEffect(() => {
    fetchWallpaperStatus()
      .then((res) => {
        if (res?.status?.autoSync !== undefined) {
          setIsWallpaperSyncOn(Boolean(res.status.autoSync));
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleWallpaperSync = useCallback(async () => {
    try {
      const next = !isWallpaperSyncOn;
      setIsWallpaperSyncOn(next);
      await setWallpaperAutoSync(next);
      if (next && telemetry?.temperature?.temperature != null) {
        await applyWindowsWallpaper(
          telemetry?.mood?.moodKey,
          null,
          telemetry.temperature.temperature
        );
      }
    } catch (err) {
      console.error('Failed to toggle wallpaper sync:', err);
    }
  }, [isWallpaperSyncOn, telemetry]);

  // Audio state sync on mount
  useEffect(() => {
    audioSynthesizer.setMuted(!soundEnabled);
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const val = Number(e.target.value);
    setVolume(val);
    audioSynthesizer.setVolume(val / 100);
  }, []);

  const handleApplyQuickMood = useCallback(async (item) => {
    try {
      if (item.climate) {
        audioSynthesizer.playMoodTransition(item.climate, true);
      }
      await setSimulation({
        enabled: true,
        temperature: item.temp,
        wifiSignal: item.wifi,
        connected: item.wifi > 0,
      });
      refreshData();
    } catch (err) {
      console.error('Failed to apply quick mood:', err);
    }
  }, [refreshData]);

  const handleResetHardware = useCallback(async () => {
    try {
      await setSimulation({ enabled: false });
      refreshData();
    } catch (err) {
      console.error('Failed to reset hardware:', err);
    }
  }, []);

  const handleSetSimulationValues = useCallback(async (vals) => {
    try {
      await setSimulation({
        enabled: true,
        ...vals,
      });
      refreshData();
    } catch (err) {
      console.error('Failed to set simulation:', err);
    }
  }, []);

  const handleTelemetryUpdate = useCallback((data) => {
    if (data.timestamp) {
      setLatencyMs(Math.max(3, Math.round(Date.now() - data.timestamp)));
    }

    setTelemetry((prev) => ({
      ...prev,
      ...data,
    }));

    if (data.temperature?.temperature != null) {
      voiceSynthesizer.setTemperature(data.temperature.temperature);
    }
    if (data.mood?.moodKey) {
      voiceSynthesizer.setMood(data.mood.moodKey);
    }

    const newMood = data.mood?.moodKey;
    if (newMood && newMood !== lastMoodKeyRef.current) {
      lastMoodKeyRef.current = newMood;
      setLastMoodKey(newMood);
      if (soundEnabledRef.current && data.mood?.climateEffect) {
        audioSynthesizer.playMoodTransition(data.mood.climateEffect);
      }
      if (voiceEnabledRef.current && data.mood?.voiceLine) {
        voiceSynthesizer.speak(data.mood.voiceLine, data.mood.personality, data.mood.moodKey);
      }
    }

    if (data.temperature?.overheatingRisk?.level === 'CRITICAL' && soundEnabledRef.current) {
      audioSynthesizer.playOverheatingAlarm();
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const data = await fetchSystemData();
      if (data?.success) {
        setTelemetry(data);
        handleTelemetryUpdate(data);
      }
    } catch (err) {
      // Graceful offline behavior: will retry on poll/socket
    }
  }, [handleTelemetryUpdate]);

  useEffect(() => {
    refreshData();

    const pollInterval = perfMode === 'eco' ? 4000 : 2000;
    const pollTimer = setInterval(() => {
      if (wsStatusRef.current !== 'connected') {
        refreshData();
      }
    }, pollInterval);

    const disconnect = connectTelemetryStream(
      (data) => {
        handleTelemetryUpdate(data);
      },
      (status) => {
        setWsStatus(status);
      }
    );

    return () => {
      clearInterval(pollTimer);
      disconnect();
    };
  }, [handleTelemetryUpdate, refreshData, perfMode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('moodos_sound_enabled', String(next));
    audioSynthesizer.setMuted(!next);
    if (next && telemetry?.mood?.climateEffect) {
      audioSynthesizer.startAmbientLoop(telemetry.mood.climateEffect);
    }
  };

  const handleToggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    voiceSynthesizer.setEnabled(next);
    if (next && telemetry?.mood?.voiceLine) {
      voiceSynthesizer.speak(telemetry.mood.voiceLine, telemetry.mood.personality);
    }
  };

  const handlePersonalityChange = async (p) => {
    try {
      await setPersonality(p);
      refreshData();
    } catch (err) {
      console.error('Failed to change personality:', err);
    }
  };

  const handleModeChange = useCallback((mode) => {
    setCurrentMode(mode);
    if (window.electronAPI?.setWindowMode) {
      window.electronAPI.setWindowMode(mode);
    }
  }, []);

  const currentMood = telemetry?.mood || {
    moodKey: 'HAPPY',
    moodName: 'Happy',
    moodEmoji: '😊',
    climateEffect: 'SUNNY',
    climateZone: 'COOL',
    personality: 'Sarcastic',
    description: 'All cores humming pleasantly.',
    voiceLine: 'All systems nominal and running cool.',
  };

  const moodKeyLower = (currentMood.moodKey || 'happy').toLowerCase();

  // Floating Screen Widget Mode
  if (currentMode === 'widget') {
    return (
      <div className="w-screen h-screen p-1 bg-transparent flex items-center justify-center select-none overflow-hidden">
        <ScreenWidget
          telemetry={telemetry}
          onExpandDashboard={() => handleModeChange('dashboard')}
          onMinimize={() => window.electronAPI?.minimize?.()}
          onClose={() => window.electronAPI?.close?.()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden text-slate-100 flex flex-col justify-between bg-[#05070d]">
      {/* Optional Desktop Title Bar for Electron */}
      <DesktopTitleBar
        currentMode={currentMode}
        onModeChange={handleModeChange}
        isWallpaperSyncOn={isWallpaperSyncOn}
        onToggleWallpaperSync={handleToggleWallpaperSync}
        telemetry={telemetry}
      />

      {/* ============================================================
          PROCEDURAL ATMOSPHERIC BACKGROUND (0ms load, zero external assets)
         ============================================================ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden transition-all duration-1000">
        {/* Procedural CSS Aurora Mesh Gradient based on current emotion */}
        <div className={`absolute inset-0 transition-opacity duration-1000 aurora-${moodKeyLower}`} />

        {/* Temperature-Driven Climate Zone Background — only render active zone */}
        {(() => {
          const zone = (currentMood.climateZone || 'COOL').toLowerCase();
          return (
            <div
              key={zone}
              className={`climate-bg climate-${zone} active`}
            />
          );
        })()}

        {/* Global Dark Vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.85)] pointer-events-none" />
      </div>

      {/* Dynamic Climate Particle Overlay */}
      <ClimateEffect climate={currentMood.climateEffect} perfMode={perfMode} />

      {/* Atmospheric Energy Shockwave on Mood Shift */}
      <MoodShockwave moodKey={currentMood.moodKey} timestamp={telemetry?.timestamp} />

      {/* Cybernetic Glow & Stardust Energy Cursor */}
      <CyberCursor moodKey={currentMood.moodKey} perfMode={perfMode} />

      {/* ============================================================
          MAIN APPLICATION INTERFACE
         ============================================================ */}
      <div className="relative z-20 max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 flex flex-col flex-1 justify-between min-h-screen">
        {/* Sleek Top Navigation Bar */}
        <header className="glass-panel rounded-2xl px-4 py-3 flex items-center justify-between gap-3 shadow-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black tracking-tight text-white">MoodOS</h1>
                <span className="text-[10px] uppercase font-mono font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {currentMood.moodName}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Cyber-Companion Core</p>
            </div>
          </div>

          {/* Quick HUD status indicators */}
          <div className="flex items-center gap-2">
            {/* FPS counter */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-mono font-bold text-emerald-300">
              <Gauge className="w-3 h-3 text-emerald-400" />
              <span>{fps} FPS</span>
            </div>

            {/* Live streaming status */}
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${
                wsStatus === 'connected'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  wsStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{wsStatus === 'connected' ? `${latencyMs || 8}ms` : 'Connecting'}</span>
            </div>

            {/* Performance Mode Switcher */}
            <button
              onClick={handlePerfModeToggle}
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1 ${
                perfMode === 'eco'
                  ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-300'
                  : perfMode === 'ultra'
                  ? 'bg-purple-600/20 border-purple-500/30 text-purple-300'
                  : 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300'
              }`}
              title="Toggle Performance & Battery Saving Mode"
            >
              {perfMode === 'eco' ? <Leaf className="w-3 h-3 text-emerald-400" /> : <Zap className="w-3 h-3 text-amber-400" />}
              <span className="capitalize hidden sm:inline">{perfMode}</span>
            </button>

            {/* Windows Desktop Wallpaper Sync Button */}
            <button
              onClick={handleToggleWallpaperSync}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-all flex items-center gap-1.5 active:scale-95 ${
                isWallpaperSyncOn
                  ? 'bg-amber-500/15 border-amber-400/40 text-amber-300 shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
              title={`Windows Desktop Wallpaper Auto-Sync: ${isWallpaperSyncOn ? 'ACTIVE (changes with CPU temperature)' : 'OFF'}`}
            >
              <ImageIcon className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Wallpaper</span>
              {isWallpaperSyncOn && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-all"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* Center Stage: Living Cyber-Companion Mascot */}
        <main className="my-auto py-4 flex flex-col items-center justify-center">
          <LivingAvatar
            mood={currentMood}
            personality={currentMood.personality}
            onPersonalityChange={handlePersonalityChange}
            voiceEnabled={voiceEnabled}
            onToggleVoice={handleToggleVoice}
          />

          {/* Telemetry Rings (Hidden in Zen Mode) */}
          {!zenMode && (
            <div className="w-full max-w-xl mt-6 animate-fade-in">
              <TelemetryRings
                temperatureData={telemetry?.temperature}
                wifiData={telemetry?.wifi}
                tempUnit={tempUnit}
                onToggleTempUnit={handleToggleTempUnit}
              />
            </div>
          )}
        </main>

        {/* Bottom Floating Control Dock */}
        <footer className="pt-2 pb-1">
          <CyberDock
            currentMoodKey={currentMood.moodKey}
            personality={currentMood.personality}
            onPersonalityChange={handlePersonalityChange}
            onApplyQuickMood={handleApplyQuickMood}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            volume={volume}
            onVolumeChange={handleVolumeChange}
            voiceEnabled={voiceEnabled}
            onToggleVoice={handleToggleVoice}
            zenMode={zenMode}
            onToggleZenMode={() => setZenMode(!zenMode)}
            isSimulated={telemetry?.temperature?.isSimulated}
            onResetHardware={handleResetHardware}
            onSetSimulationValues={handleSetSimulationValues}
            currentTemp={telemetry?.temperature?.temperature || 45}
            currentWifi={telemetry?.wifi?.signalStrength || 80}
          />
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;
