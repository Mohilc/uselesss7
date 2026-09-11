import React, { useState, useRef } from 'react';
import { Thermometer, Wifi, WifiOff, Cpu, Zap, Activity, AlertTriangle } from 'lucide-react';

const TiltCard = ({ children, glowColor = '#10b981', className = '' }) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, px: 50, py: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    const rx = ((y - rect.height / 2) / (rect.height / 2)) * -6;
    const ry = ((x - rect.width / 2) / (rect.width / 2)) * 6;
    setTilt({ rx, ry, px, py });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ rx: 0, ry: 0, px: 50, py: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`glass-panel-interactive rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xl transition-transform duration-200 ease-out group ${className}`}
      style={{
        transform: `perspective(800px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
    >
      {/* Dynamic Specular Lighting Spot following cursor */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-0"
          style={{
            background: `radial-gradient(circle 180px at ${tilt.px}% ${tilt.py}%, rgba(255,255,255,0.09), transparent 80%)`,
          }}
        />
      )}

      {/* Cybernetic Conic Border Beam */}
      <div
        className="absolute -inset-[1px] rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 overflow-hidden"
        style={{
          background: `conic-gradient(from 0deg, transparent 0deg, ${glowColor}60 90deg, transparent 180deg)`,
          animation: 'cyber-spin-slow 8s linear infinite',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px',
        }}
      />

      {children}
    </div>
  );
};

const TelemetryRings = ({
  temperatureData,
  wifiData,
  tempUnit = 'C',
  onToggleTempUnit,
}) => {
  // Temperature calculations
  const rawTemp = temperatureData?.temperature ?? 45;
  const isSimulated = temperatureData?.isSimulated || false;
  const cpuLoad = temperatureData?.cpuLoad?.currentLoad ?? 18;
  const overheating = temperatureData?.overheatingRisk?.level || 'LOW';

  const displayTemp = tempUnit === 'F' ? Math.round((rawTemp * 9) / 5 + 32) : Math.round(rawTemp);
  const tempUnitSymbol = `°${tempUnit}`;

  // Gauge clamp (20°C to 95°C mapped to 0-100%)
  const tempPercent = Math.max(0, Math.min(100, ((rawTemp - 20) / (95 - 20)) * 100));

  // Color mapping based on thermals
  let tempColor = '#10b981'; // Emerald
  let tempLabel = 'Cool & Nominal';
  if (rawTemp >= 80) {
    tempColor = '#ef4444'; // Red
    tempLabel = 'Critical Heat!';
  } else if (rawTemp >= 65) {
    tempColor = '#f59e0b'; // Amber
    tempLabel = 'Warm Under Load';
  } else if (rawTemp <= 38) {
    tempColor = '#38bdf8'; // Cyan
    tempLabel = 'Sub-Ambient Chill';
  }

  // Wi-Fi calculations
  const connected = wifiData?.connected ?? true;
  const signalStrength = wifiData?.signalStrength ?? 85;
  const latency = wifiData?.latencyMs ?? 18;
  const ssid = wifiData?.ssid || 'Connected Network';
  const frequency = wifiData?.frequency || '5 GHz';
  const linkSpeed = wifiData?.linkSpeedMbps || 300;

  let wifiColor = '#10b981';
  let wifiQuality = 'High Speed';
  if (!connected || signalStrength === 0) {
    wifiColor = '#8b5cf6';
    wifiQuality = 'Offline';
  } else if (signalStrength < 40) {
    wifiColor = '#f59e0b';
    wifiQuality = 'Weak Signal';
  } else if (latency > 150) {
    wifiColor = '#f97316';
    wifiQuality = 'High Ping';
  }

  // SVG Geometry: Circle of radius 60 => circumference = 2 * PI * 60 = 376.99
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const tempOffset = circumference - (tempPercent / 100) * circumference;
  const wifiOffset = circumference - (signalStrength / 100) * circumference;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      {/* 1. THERMAL CORE RING HUD */}
      <TiltCard glowColor={tempColor}>
        {/* Ambient background glow */}
        <div
          className="absolute -top-12 -left-12 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-25"
          style={{ backgroundColor: tempColor }}
        />

        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-colors"
              style={{ backgroundColor: `${tempColor}25`, color: tempColor }}
            >
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Thermal Core
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {isSimulated ? 'Simulated Sensor' : 'Hardware Telemetry'}
              </p>
            </div>
          </div>

          {/* Unit Toggle Button */}
          <button
            onClick={onToggleTempUnit}
            className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 shadow-sm active:scale-95"
            title="Switch between Celsius and Fahrenheit"
          >
            <span>{tempUnitSymbol}</span>
            <span className="text-[10px] text-indigo-400">Switch</span>
          </button>
        </div>

        {/* Circular HUD Gauge */}
        <div className="flex items-center justify-center my-2 relative z-10">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
              {/* Background track */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="8"
              />
              {/* CPU Load Inner Arc */}
              <circle
                cx="70"
                cy="70"
                r="48"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="4"
              />
              <circle
                cx="70"
                cy="70"
                r="48"
                fill="none"
                stroke="#6366f1"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - Math.min(1, Math.max(0, cpuLoad / 100)))}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
              {/* Outer Temp Meter */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={tempColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={tempOffset}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 10px ${tempColor}90)` }}
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Center Gauge Reading */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black tracking-tight text-white flex items-baseline">
                {displayTemp}
                <span className="text-sm font-semibold text-slate-400 ml-0.5">{tempUnitSymbol}</span>
              </span>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                <Cpu className="w-2.5 h-2.5 text-indigo-400" />
                <span>{Math.round(cpuLoad)}% load</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 relative z-10 text-xs">
          <span className="flex items-center gap-1.5" style={{ color: tempColor }}>
            {rawTemp >= 80 && <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />}
            <span className="font-semibold">{tempLabel}</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Peak: {tempUnit === 'F' ? Math.round(((temperatureData?.maxTemp || 75) * 9) / 5 + 32) : Math.round(temperatureData?.maxTemp || 75)}{tempUnitSymbol}
          </span>
        </div>
      </TiltCard>

      {/* 2. NEURAL WI-FI RING HUD */}
      <TiltCard glowColor={wifiColor}>
        {/* Ambient background glow */}
        <div
          className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-25"
          style={{ backgroundColor: wifiColor }}
        />

        {/* Card Header */}
        <div className="flex items-center justify-between gap-2 mb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-colors"
              style={{ backgroundColor: `${wifiColor}25`, color: wifiColor }}
            >
              {connected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Neural Link
              </h3>
              <p className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                {ssid}
              </p>
            </div>
          </div>

          <div
            className="px-2.5 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 shadow-sm"
            style={{
              backgroundColor: `${wifiColor}15`,
              borderColor: `${wifiColor}40`,
              color: wifiColor,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: wifiColor }} />
            <span>{wifiQuality}</span>
          </div>
        </div>

        {/* Circular HUD Gauge */}
        <div className="flex items-center justify-center my-2 relative z-10">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
              {/* Background track */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="8"
              />
              {/* Radar sweep line */}
              {connected && (
                <circle
                  cx="70"
                  cy="70"
                  r="48"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                  className="animate-spin-slow"
                />
              )}
              {/* Outer Signal Meter */}
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={wifiColor}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={wifiOffset}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 10px ${wifiColor}90)` }}
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Center Gauge Reading */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black tracking-tight text-white flex items-baseline">
                {connected ? signalStrength : 0}
                <span className="text-sm font-semibold text-slate-400 ml-0.5">%</span>
              </span>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono mt-0.5">
                <Activity className="w-2.5 h-2.5 text-sky-400" />
                <span>{connected ? `${latency}ms ping` : 'No signal'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 relative z-10 text-xs">
          <span className="text-slate-300 font-medium">
            {frequency} Band
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {connected ? `${linkSpeed} Mbps` : 'Disconnected'}
          </span>
        </div>
      </TiltCard>
    </div>
  );
};

export default React.memo(TelemetryRings);
