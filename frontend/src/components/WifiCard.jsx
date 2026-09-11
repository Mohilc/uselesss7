import React from 'react';
import { Wifi, WifiOff, Activity, Radio, Zap } from 'lucide-react';

const WifiCard = ({ data }) => {
  const {
    connected = true,
    ssid = 'Connected Wi-Fi',
    signalStrength = 85,
    quality = 'Excellent',
    qualityBadge = '📶 Excellent',
    linkSpeed = '433.3 Mbps',
    pingMs = 18,
    isSimulated = false,
  } = data || {};

  // Determine signal color and bars
  const getSignalMeta = () => {
    if (!connected || signalStrength === 0) {
      return {
        color: 'text-rose-400',
        barColor: 'bg-rose-500',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        barCount: 0,
      };
    }
    if (signalStrength >= 80) {
      return {
        color: 'text-emerald-400',
        barColor: 'bg-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        barCount: 4,
      };
    }
    if (signalStrength >= 60) {
      return {
        color: 'text-teal-400',
        barColor: 'bg-teal-400',
        badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        barCount: 3,
      };
    }
    if (signalStrength >= 35) {
      return {
        color: 'text-amber-400',
        barColor: 'bg-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        barCount: 2,
      };
    }
    return {
      color: 'text-rose-400',
      barColor: 'bg-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      barCount: 1,
    };
  };

  const meta = getSignalMeta();

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:border-white/20 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300">
            {connected ? (
              <Wifi className="w-5 h-5 text-sky-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-rose-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-sm tracking-wide">Wi-Fi Connection</h3>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Radio className="w-3 h-3" />
              {isSimulated ? 'Simulated Signal' : 'Hardware Adapter'}
            </span>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${meta.badge}`}>
          {qualityBadge}
        </span>
      </div>

      {/* Main Signal Display */}
      <div className="flex items-center justify-between my-2">
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-black tracking-tight ${meta.color}`}>
            {connected ? signalStrength : 0}
          </span>
          <span className="text-sm font-semibold text-slate-400">%</span>
        </div>

        {/* 4-bar Signal Indicator */}
        <div className="flex items-end gap-1.5 h-10 px-4 py-1.5 rounded-2xl bg-white/5 border border-white/5">
          {[1, 2, 3, 4].map((bar) => {
            const isActive = connected && bar <= meta.barCount;
            const barHeights = ['h-2', 'h-4', 'h-6', 'h-8'];
            return (
              <div
                key={bar}
                className={`w-2.5 rounded-sm transition-all duration-500 ${barHeights[bar - 1]} ${
                  isActive ? meta.barColor : 'bg-slate-700/50'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Connection Details */}
      <div className="space-y-2 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Network (SSID)</span>
          <span className="font-semibold text-slate-200 truncate max-w-[170px]" title={ssid}>
            {ssid}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Link Speed</span>
          <span className="font-medium text-slate-300 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            {linkSpeed}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Ping Latency</span>
          <span className="font-medium text-slate-300 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                !connected || pingMs === null
                  ? 'bg-rose-500'
                  : pingMs < 30
                  ? 'bg-emerald-400'
                  : pingMs < 80
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            <Activity className="w-3 h-3 text-slate-400" />
            {connected && pingMs !== null ? `${pingMs} ms` : 'Unreachable'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(WifiCard);
