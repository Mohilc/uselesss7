import React, { useState, useEffect } from 'react';
import {
  Minus,
  Square,
  X,
  Monitor,
  LayoutGrid,
  CloudRain,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Pin,
} from 'lucide-react';

const DesktopTitleBar = ({
  currentMode,
  onModeChange,
  isWallpaperSyncOn,
  onToggleWallpaperSync,
  telemetry,
}) => {
  const isElectron = Boolean(window.electronAPI?.isElectron);
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

  const handleMinimize = () => {
    if (window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximize) {
      window.electronAPI.maximize();
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.close) {
      window.electronAPI.close();
    }
  };

  const toggleAlwaysOnTop = () => {
    const next = !isAlwaysOnTop;
    setIsAlwaysOnTop(next);
    if (window.electronAPI?.setAlwaysOnTop) {
      window.electronAPI.setAlwaysOnTop(next);
    }
  };

  // Only render desktop controls if running in Electron or provide a simulation bar
  return (
    <header
      className="w-full h-11 bg-slate-950/85 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-3 select-none z-50 transition-all text-xs"
      style={{ WebkitAppRegion: 'drag' }}
    >
      {/* Left: App Brand & Live Status */}
      <div className="flex items-center gap-2.5" style={{ WebkitAppRegion: 'no-drag' }}>
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 text-[10px]">
          M
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-bold tracking-wider text-slate-200 uppercase text-[11px]">
            MoodOS <span className="text-emerald-400 font-normal">Desktop</span>
          </span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500/15 text-emerald-300 font-mono border border-emerald-500/30">
            v1.0 Windows
          </span>
        </div>

        {telemetry?.mood?.name && (
          <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
            <span>{telemetry.mood.emoji}</span>
            <span className="font-medium text-[10px]">{telemetry.mood.name}</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-[10px] text-emerald-400">
              {telemetry.temperature?.temperature ?? '--'}°C
            </span>
          </div>
        )}
      </div>

      {/* Middle: Screen Mode Switcher */}
      <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-white/10 shadow-inner" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={() => onModeChange('dashboard')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium text-[11px] ${
            currentMode === 'dashboard'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title="Full Dashboard Window"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Dashboard</span>
        </button>

        <button
          onClick={() => onModeChange('widget')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium text-[11px] ${
            currentMode === 'widget'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title="Floating Screen Widget (Always-on-top Mini Companion on Screen)"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Screen Widget</span>
        </button>

        <button
          onClick={() => onModeChange('overlay')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium text-[11px] ${
            currentMode === 'overlay'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title="Desktop Weather Overlay (Live screen weather with click-through to other apps)"
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Screen Weather</span>
        </button>

        {/* Windows Wallpaper Sync Button */}
        <button
          onClick={onToggleWallpaperSync}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all font-medium text-[11px] border ${
            isWallpaperSyncOn
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm animate-pulse'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
          }`}
          title="Automatically change real Windows desktop wallpaper based on laptop mood"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Windows Wallpaper</span>
          {isWallpaperSyncOn && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
        </button>
      </div>

      {/* Right: Window Controls */}
      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={toggleAlwaysOnTop}
          className={`p-1.5 rounded-md transition-colors ${
            isAlwaysOnTop ? 'text-amber-400 bg-amber-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'
          }`}
          title={isAlwaysOnTop ? 'Always on top (Active)' : 'Pin on top'}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>

        {isElectron && (
          <>
            <button
              onClick={handleMinimize}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded-md transition-colors"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMaximize}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/10 rounded-md transition-colors"
              title="Maximize / Restore"
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default DesktopTitleBar;
