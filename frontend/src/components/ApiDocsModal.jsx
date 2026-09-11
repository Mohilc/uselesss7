import React, { useState } from 'react';
import { X, Code, Play, CheckCircle2, Server, Globe } from 'lucide-react';

const endpoints = [
  { method: 'GET', path: '/api/system', desc: 'Get combined hardware telemetry, temperature, wifi, and calculated mood.' },
  { method: 'GET', path: '/api/temperature', desc: 'Get current CPU temperature, status, limits, and overheating prediction.' },
  { method: 'GET', path: '/api/wifi', desc: 'Get active Wi-Fi connection parameters, link speed, quality, and ping latency.' },
  { method: 'GET', path: '/api/mood', desc: 'Get current calculated mood, personality commentary, and climate effect.' },
  { method: 'GET', path: '/api/status', desc: 'Server health, CPU model, RAM metrics, and uptime.' },
  { method: 'GET', path: '/api/history', desc: 'Active session historical points for telemetry graphing.' },
  {
    method: 'POST',
    path: '/api/simulate',
    desc: 'Override telemetry with simulated parameters for testing.',
    body: JSON.stringify({ enabled: true, temperature: 85, wifiSignal: 90, wifiConnected: true }, null, 2),
  },
  { method: 'GET', path: '/api/docs', desc: 'OpenAPI 3.0 specification in JSON format.' },
];

const ApiDocsModal = ({ isOpen, onClose }) => {
  const [activeEndpoint, setActiveEndpoint] = useState(endpoints[0]);
  const [responseOutput, setResponseOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTest = async () => {
    setLoading(true);
    try {
      let res;
      if (activeEndpoint.method === 'GET') {
        res = await fetch(activeEndpoint.path);
      } else {
        res = await fetch(activeEndpoint.path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: activeEndpoint.body,
        });
      }
      const data = await res.json();
      setResponseOutput(data);
    } catch (err) {
      setResponseOutput({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-3xl max-h-[85vh] rounded-3xl p-6 shadow-2xl flex flex-col border border-white/10 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">MoodOS REST API & WebSockets</h3>
              <p className="text-xs text-slate-400">Interactive live API explorer and OpenAPI reference</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-4 flex-1 overflow-hidden">
          {/* Left Endpoint List */}
          <div className="md:col-span-2 overflow-y-auto space-y-1.5 pr-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Endpoints
            </div>
            {endpoints.map((ep) => {
              const isSelected = activeEndpoint.path === ep.path;
              return (
                <button
                  key={ep.path}
                  onClick={() => {
                    setActiveEndpoint(ep);
                    setResponseOutput(null);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 border ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                      : 'bg-white/5 border-transparent text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="font-mono truncate">{ep.path}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      ep.method === 'GET'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {ep.method}
                  </span>
                </button>
              );
            })}

            {/* WebSocket Note */}
            <div className="mt-4 p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-300 mb-1">
                <Globe className="w-3.5 h-3.5" /> WebSocket Stream
              </div>
              <p className="text-[11px] text-slate-300 font-mono">ws://localhost:5000/ws</p>
              <p className="text-[10px] text-slate-400 mt-1">
                Emits <code className="text-indigo-300">TELEMETRY_UPDATE</code> every 1.5s
              </p>
            </div>
          </div>

          {/* Right Endpoint Details & Test output */}
          <div className="md:col-span-3 flex flex-col overflow-hidden bg-slate-950/70 rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded mr-2 ${
                    activeEndpoint.method === 'GET'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {activeEndpoint.method}
                </span>
                <span className="font-mono text-sm font-bold text-white">{activeEndpoint.path}</span>
              </div>
              <button
                onClick={handleTest}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30"
              >
                <Play className="w-3 h-3" /> {loading ? 'Running...' : 'Execute'}
              </button>
            </div>

            <p className="text-xs text-slate-300 my-3">{activeEndpoint.desc}</p>

            {activeEndpoint.body && (
              <div className="mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Sample Request Body:
                </span>
                <pre className="p-2 rounded-lg bg-black/50 text-[11px] font-mono text-indigo-200 overflow-x-auto">
                  {activeEndpoint.body}
                </pre>
              </div>
            )}

            {/* Response Console */}
            <div className="flex-1 flex flex-col min-h-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Response Payload:</span>
                {responseOutput && <span className="text-emerald-400">200 OK</span>}
              </span>
              <div className="flex-1 bg-black/60 rounded-xl p-3 font-mono text-[11px] text-slate-300 overflow-auto border border-white/5">
                {responseOutput ? (
                  <pre>{JSON.stringify(responseOutput, null, 2)}</pre>
                ) : (
                  <span className="text-slate-500 italic">Click "Execute" to run request...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiDocsModal;
