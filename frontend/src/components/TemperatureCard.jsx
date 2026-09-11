import React from 'react';
import { Thermometer, TrendingUp, TrendingDown, Minus, AlertTriangle, Cpu, Sliders } from 'lucide-react';

const TemperatureCard = ({ data, onOpenThresholds, tempUnit = 'C', onToggleTempUnit }) => {
  const {
    temperature = 48.0,
    unit = '°C',
    status = 'Normal',
    statusEmoji = '🟢',
    isSimulated = false,
    hardwareSensorsAvailable = false,
    sensorMethod = 'initializing',
    trend = { direction: 'stable', ratePerMinute: 0 },
    overheatingRisk = { warning: false, level: 'LOW', message: '' },
    thresholds = { cold: 45, warm: 65, hot: 75, critical: 85 },
  } = data || {};

  const isFahrenheit = tempUnit === 'F';
  const displayTemp = isFahrenheit
    ? (temperature * 1.8 + 32).toFixed(1)
    : Number(temperature).toFixed(1);
  const displayUnit = isFahrenheit ? '°F' : '°C';

  // Helper for thresholds conversion
  const formatTemp = (val) => (isFahrenheit ? `${Math.round(val * 1.8 + 32)}°F` : `${val}°C`);

  // Color mapping based on temperature status
  const getStatusColor = () => {
    switch (status) {
      case 'Critical':
        return {
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          glow: 'glow-rose',
          fill: '#f43f5e',
          text: 'text-rose-400',
        };
      case 'Hot':
        return {
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          glow: 'glow-orange',
          fill: '#fb923c',
          text: 'text-orange-400',
        };
      case 'Warm':
        return {
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          glow: 'glow-emerald',
          fill: '#f59e0b',
          text: 'text-amber-400',
        };
      case 'Cold':
        return {
          badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          glow: 'glow-cyan',
          fill: '#38bdf8',
          text: 'text-cyan-400',
        };
      default:
        return {
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          glow: 'glow-emerald',
          fill: '#34d399',
          text: 'text-emerald-400',
        };
    }
  };

  const statusStyle = getStatusColor();

  // Convert for circular SVG arc (scale 20°C to 105°C)
  const minTemp = 25;
  const maxTemp = 100;
  const clampedTemp = Math.max(minTemp, Math.min(maxTemp, temperature));
  const percent = (clampedTemp - minTemp) / (maxTemp - minTemp);
  const strokeDashoffset = 251.2 - (251.2 * percent * 0.75); // 270 deg gauge

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:border-white/20 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300">
            <Thermometer className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-sm tracking-wide">CPU Thermals</h3>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {isSimulated ? 'Simulated Telemetry' : (sensorMethod || 'detecting...')}
            </span>
            {hardwareSensorsAvailable && !isSimulated && (
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">● Real Sensor</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onToggleTempUnit && (
            <button
              onClick={onToggleTempUnit}
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-bold text-slate-300 hover:text-white transition-colors"
              title="Toggle °C / °F unit"
            >
              {isFahrenheit ? '°F' : '°C'}
            </button>
          )}
          <button
            onClick={onOpenThresholds}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Configure Temperature Thresholds"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusStyle.badge}`}
          >
            <span>{statusEmoji}</span>
            <span>{status}</span>
          </span>
        </div>
      </div>

      {/* Main Gauge and Numbers */}
      <div className="flex items-center justify-between my-2">
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full -rotate-135 transform" viewBox="0 0 100 100">
            {/* Background Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="9"
              strokeDasharray="251.2"
              strokeDashoffset="62.8"
              strokeLinecap="round"
            />
            {/* Active Gauge Arc */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={statusStyle.fill}
              strokeWidth="9"
              strokeDasharray="251.2"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Central Temperature Value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black tracking-tight ${statusStyle.text}`}>
              {displayTemp}
            </span>
            <span className="text-[11px] font-bold text-slate-400 -mt-1">{displayUnit}</span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="flex-1 pl-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Trend</span>
            <span className="font-medium text-slate-200 flex items-center gap-1">
              {trend?.direction?.includes('rising') ? (
                <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
              ) : trend?.direction?.includes('falling') ? (
                <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-slate-400" />
              )}
              {(trend?.ratePerMinute || 0) > 0 ? `+${trend.ratePerMinute}` : (trend?.ratePerMinute || 0)} °C/m
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Warm Limit</span>
            <span className="font-medium text-slate-300">{formatTemp(thresholds.warm)}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Hot Limit</span>
            <span className="font-medium text-slate-300">{formatTemp(thresholds.hot)}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Critical Limit</span>
            <span className="font-medium text-rose-400">{formatTemp(thresholds.critical)}</span>
          </div>
        </div>
      </div>

      {/* Overheating Risk Alert Banner */}
      {overheatingRisk.warning && (
        <div
          className={`mt-3 p-3 rounded-2xl border flex items-start gap-2.5 text-xs animate-pulse ${
            overheatingRisk.level === 'CRITICAL'
              ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
              : 'bg-amber-500/20 border-amber-500/50 text-amber-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">{overheatingRisk.level} RISK: </span>
            {overheatingRisk.message}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(TemperatureCard);
