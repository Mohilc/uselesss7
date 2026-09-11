import React from 'react';
import { Activity, Clock } from 'lucide-react';

const HistoryChart = ({ history = [], tempUnit = 'C' }) => {
  // Use last 30 data points
  const points = history.slice(-30);

  if (points.length < 2) {
    return (
      <div className="glass-panel rounded-3xl p-6 h-64 flex flex-col items-center justify-center text-slate-400">
        <Activity className="w-8 h-8 text-slate-500 animate-pulse mb-2" />
        <span className="text-sm">Collecting session telemetry points...</span>
      </div>
    );
  }

  const svgWidth = 600;
  const svgHeight = 160;
  const padding = 25;
  const chartW = svgWidth - padding * 2;
  const chartH = svgHeight - padding * 2;

  // Min and max scales
  const minTemp = 20;
  const maxTemp = 100;
  const minWifi = 0;
  const maxWifi = 100;

  // Build SVG path coordinates
  const tempCoords = points.map((pt, i) => {
    const x = padding + (i / (points.length - 1)) * chartW;
    const norm = (pt.temperature - minTemp) / (maxTemp - minTemp);
    const y = padding + (1 - Math.max(0, Math.min(1, norm))) * chartH;
    return { x, y, temp: pt.temperature };
  });

  const wifiCoords = points.map((pt, i) => {
    const x = padding + (i / (points.length - 1)) * chartW;
    const norm = (pt.wifiSignal - minWifi) / (maxWifi - minWifi);
    const y = padding + (1 - Math.max(0, Math.min(1, norm))) * chartH;
    return { x, y, wifi: pt.wifiSignal };
  });

  const makePath = (coords) =>
    coords.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '');

  const tempPath = makePath(tempCoords);
  const wifiPath = makePath(wifiCoords);

  const lastTempPt = tempCoords[tempCoords.length - 1];
  const lastWifiPt = wifiCoords[wifiCoords.length - 1];

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-hidden shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300">
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-200 text-sm tracking-wide">
              Telemetry Trend History
            </h3>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Live session buffer ({points.length} samples)
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" />
            <span className="text-slate-300">Temp ({tempUnit === 'F' ? '°F' : '°C'})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-sm shadow-sky-400/50" />
            <span className="text-slate-300">Wi-Fi (%)</span>
          </div>
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="relative w-full h-44">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="wifiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((fraction, idx) => (
            <line
              key={idx}
              x1={padding}
              y1={padding + fraction * chartH}
              x2={svgWidth - padding}
              y2={padding + fraction * chartH}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4 4"
            />
          ))}

          {/* Wi-Fi Area & Line */}
          <path
            d={`${wifiPath} L ${wifiCoords[wifiCoords.length - 1].x} ${padding + chartH} L ${padding} ${padding + chartH} Z`}
            fill="url(#wifiGradient)"
          />
          <path
            d={wifiPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Temperature Area & Line */}
          <path
            d={`${tempPath} L ${tempCoords[tempCoords.length - 1].x} ${padding + chartH} L ${padding} ${padding + chartH} Z`}
            fill="url(#tempGradient)"
          />
          <path
            d={tempPath}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Live pulsing point markers */}
          {lastTempPt && (
            <g>
              <circle
                cx={lastTempPt.x}
                cy={lastTempPt.y}
                r="5"
                fill="#f43f5e"
                className="animate-ping opacity-75"
              />
              <circle cx={lastTempPt.x} cy={lastTempPt.y} r="4" fill="#f43f5e" />
            </g>
          )}
          {lastWifiPt && (
            <circle cx={lastWifiPt.x} cy={lastWifiPt.y} r="4" fill="#38bdf8" />
          )}
        </svg>
      </div>
    </div>
  );
};

export default React.memo(HistoryChart);
