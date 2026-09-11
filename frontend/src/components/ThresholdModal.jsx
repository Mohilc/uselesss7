import React, { useState } from 'react';
import { X, Check, Sliders, RotateCcw } from 'lucide-react';
import { updateThresholds } from '../services/api';

const defaultThresholds = {
  cold: 45,
  warm: 65,
  hot: 75,
  critical: 85,
};

const ThresholdModal = ({ isOpen, onClose, currentThresholds = defaultThresholds, onSaved }) => {
  const [thresholds, setThresholds] = useState(currentThresholds);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateThresholds(thresholds);
      if (onSaved) onSaved(thresholds);
      onClose();
    } catch (err) {
      console.error('Failed to save thresholds:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setThresholds(defaultThresholds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 shadow-2xl relative border border-white/10 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Adjust Temperature Limits</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          Customize hardware thresholds for triggering emotional shifts, warnings, and climate effects.
        </p>

        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-cyan-300 mb-1">
              <span>❄️ Cold Freezing Threshold</span>
              <span>{thresholds.cold} °C</span>
            </div>
            <input
              type="range"
              min="20"
              max="55"
              value={thresholds.cold}
              onChange={(e) => setThresholds({ ...thresholds, cold: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-amber-300 mb-1">
              <span>🌡️ Warm Load Threshold</span>
              <span>{thresholds.warm} °C</span>
            </div>
            <input
              type="range"
              min="50"
              max="75"
              value={thresholds.warm}
              onChange={(e) => setThresholds({ ...thresholds, warm: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-orange-400 mb-1">
              <span>🔥 Hot / Stressed Threshold</span>
              <span>{thresholds.hot} °C</span>
            </div>
            <input
              type="range"
              min="65"
              max="85"
              value={thresholds.hot}
              onChange={(e) => setThresholds({ ...thresholds, hot: Number(e.target.value) })}
              className="w-full accent-orange-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-rose-400 mb-1">
              <span>🚨 Critical / Angry Limit</span>
              <span>{thresholds.critical} °C</span>
            </div>
            <input
              type="range"
              min="75"
              max="105"
              value={thresholds.critical}
              onChange={(e) => setThresholds({ ...thresholds, critical: Number(e.target.value) })}
              className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 mt-8 pt-4 border-t border-white/10">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Apply Limits'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThresholdModal;
