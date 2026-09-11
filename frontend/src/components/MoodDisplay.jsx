import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, MessageSquare, Maximize2, Minimize2, Radio, Activity } from 'lucide-react';
import voiceSynthesizer from '../services/voiceSynthesizer';
import audioSynthesizer from '../services/audioSynthesizer';

const MoodDisplay = ({
  mood,
  personality,
  onPersonalityChange,
  isFullscreen,
  onToggleFullscreen,
  voiceEnabled,
  onToggleVoice,
}) => {
  const {
    moodKey = 'HAPPY',
    moodName = 'Happy',
    moodEmoji = '😊',
    climateEffect = 'SUNNY',
    themeColor = 'emerald',
    description = 'Operating comfortably with crisp connection and cool thermals.',
    voiceLine = 'Everything is in balance.',
  } = mood || {};

  const voiceParams = voiceSynthesizer.getTemperatureVoiceParams();

  const handleSpeak = () => {
    voiceSynthesizer.speak(voiceLine, personality, moodKey, true);
  };

  const handlePlayClimateSound = (e) => {
    e.stopPropagation();
    audioSynthesizer.setMuted(false);
    audioSynthesizer.playClimateChangeSound(climateEffect);
  };

  // Expression styling based on mood
  const getFaceExpressions = () => {
    switch (moodKey) {
      case 'ANGRY':
        return {
          eyes: 'rotate-12 bg-rose-500 shadow-rose-500/80',
          mouth: 'h-1.5 w-10 bg-rose-500 rounded-sm -rotate-3',
          glow: 'from-rose-500/40 via-red-500/20 to-transparent',
          screenBg: 'bg-gradient-to-b from-rose-950/80 to-slate-900/90 border-rose-500/40',
        };
      case 'STRESSED':
        return {
          eyes: 'scale-90 bg-orange-500 shadow-orange-500/80',
          mouth: 'h-2 w-8 border-t-2 border-orange-500 rounded-t-full',
          glow: 'from-orange-500/40 via-amber-500/20 to-transparent',
          screenBg: 'bg-gradient-to-b from-orange-950/80 to-slate-900/90 border-orange-500/40',
        };
      case 'COLD':
        return {
          eyes: 'scale-110 bg-cyan-300 shadow-cyan-400/80',
          mouth: 'h-1 w-6 bg-cyan-300 rounded-full',
          glow: 'from-cyan-500/40 via-blue-500/20 to-transparent',
          screenBg: 'bg-gradient-to-b from-cyan-950/80 to-slate-900/90 border-cyan-500/40',
        };
      case 'LONELY':
        return {
          eyes: 'scale-75 bg-purple-400 shadow-purple-500/80',
          mouth: 'h-2 w-8 border-b-2 border-purple-400 rounded-b-full',
          glow: 'from-purple-500/40 via-violet-500/20 to-transparent',
          screenBg: 'bg-gradient-to-b from-purple-950/80 to-slate-900/90 border-purple-500/40',
        };
      case 'SAD':
        return {
          eyes: 'scale-90 bg-slate-300 shadow-slate-400/80',
          mouth: 'h-2 w-8 border-t-2 border-slate-300 rounded-t-full',
          glow: 'from-slate-500/40 via-slate-600/20 to-transparent',
          screenBg: 'bg-gradient-to-b from-slate-900/90 to-slate-950 border-slate-600/40',
        };
      case 'EXCITED':
        return {
          eyes: 'scale-125 bg-amber-400 shadow-amber-300/90 animate-pulse',
          mouth: 'h-4 w-10 bg-amber-400 rounded-b-full border-b-2 border-amber-300',
          glow: 'from-amber-400/40 via-emerald-500/20 to-transparent',
          screenBg: 'bg-gradient-to-b from-emerald-950/80 to-slate-900/90 border-emerald-400/40',
        };
      default:
        // HAPPY
        return {
          eyes: 'scale-100 bg-emerald-400 shadow-emerald-400/80',
          mouth: 'h-3 w-10 border-b-4 border-emerald-400 rounded-b-full',
          glow: 'from-emerald-500/40 via-teal-500/20 to-transparent',
          screenBg: 'bg-gradient-to-b from-emerald-950/80 to-slate-900/90 border-emerald-500/40',
        };
    }
  };

  const face = getFaceExpressions();

  return (
    <div className="relative glass-panel rounded-3xl p-6 sm:p-8 overflow-hidden transition-all duration-500 shadow-2xl">
      {/* Background radial mood aura */}
      <div
        className={`absolute -top-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-br ${face.glow} blur-3xl pointer-events-none transition-all duration-700`}
      />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-2xl shadow-inner animate-bounce">
            {moodEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {moodName}
              </h2>
              <span className="text-xs uppercase px-2.5 py-1 rounded-full font-semibold tracking-wider bg-white/10 border border-white/10 text-white/90">
                {climateEffect}
              </span>
              <button
                onClick={handlePlayClimateSound}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all flex items-center gap-1"
                title={`Play ${climateEffect} climate change sound effect`}
              >
                <Activity className="w-3.5 h-3.5" /> Climate SFX
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{description}</p>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Dynamic Voice Calibration Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-slate-300">
            <Radio className="w-3 h-3 text-indigo-400" />
            <span>Tone: <strong className="text-white font-semibold">{voiceParams.stateLabel}</strong></span>
          </div>

          <button
            onClick={onToggleVoice}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-medium ${
              voiceEnabled
                ? 'bg-indigo-500/20 border-indigo-400/50 text-indigo-200 shadow-lg shadow-indigo-500/20'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title={voiceEnabled ? 'Mute Voice Commentary' : 'Enable Voice Commentary'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Voice {voiceEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={onToggleFullscreen}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all text-xs font-medium"
            title="Toggle Ambient Fullscreen View"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Centerpiece: Animated Laptop Robot Mascot */}
      <div className="flex flex-col items-center justify-center my-6 sm:my-8 relative z-10">
        <div className="relative group cursor-pointer" onClick={handleSpeak}>
          {/* Laptop Lid / Screen */}
          <div
            className={`w-64 sm:w-80 h-40 sm:h-48 rounded-2xl p-3 border shadow-2xl transition-all duration-500 backdrop-blur-md flex flex-col justify-center items-center relative overflow-hidden ${face.screenBg}`}
          >
            {/* Screen shine reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

            {/* Mascot Face */}
            <div className="flex items-center justify-center gap-12 sm:gap-16 mb-4">
              <div
                className={`w-4 sm:w-5 h-7 sm:h-9 rounded-full shadow-lg transition-all duration-300 ${face.eyes}`}
              />
              <div
                className={`w-4 sm:w-5 h-7 sm:h-9 rounded-full shadow-lg transition-all duration-300 ${face.eyes}`}
              />
            </div>
            {/* Mouth */}
            <div className={`transition-all duration-500 ${face.mouth}`} />

            {/* Click to Speak hint on hover */}
            <div className="absolute bottom-2 text-[10px] text-white/50 tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-bold">
              <Volume2 className="w-3 h-3 text-indigo-300" /> Click to hear mood voice
            </div>
          </div>

          {/* Laptop Base / Keyboard deck */}
          <div className="w-68 sm:w-84 max-w-full h-4 sm:h-5 bg-gradient-to-b from-slate-700 to-slate-900 rounded-b-xl mx-auto -mt-1 border-t border-slate-600/50 shadow-2xl flex justify-center items-center">
            <div className="w-16 h-1.5 bg-slate-500/40 rounded-full" />
          </div>
          <div className="w-72 sm:w-92 max-w-full h-2 bg-gradient-to-r from-transparent via-black/40 to-transparent blur-sm mx-auto mt-1" />
        </div>

        {/* Speech Bubble with Personality Voice Line */}
        <div className="mt-6 max-w-xl w-full bg-slate-900/80 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-md relative">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0 mt-0.5">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  {personality} Personality • {voiceParams.stateLabel}
                </span>
                <button
                  onClick={handleSpeak}
                  className="text-[11px] text-slate-400 hover:text-indigo-300 transition-colors flex items-center gap-1 font-semibold"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Hear Voice
                </button>
              </div>
              <p className="text-sm sm:text-base text-slate-200 font-medium italic">
                "{voiceLine}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Personality Pill Selector */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-white/5 relative z-10">
        <span className="text-xs text-slate-400 font-medium mr-1">Laptop Persona:</span>
        {['Sarcastic', 'Dramatic', 'Zen', 'Gamer', 'Tsundere'].map((p) => (
          <button
            key={p}
            onClick={() => onPersonalityChange(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              personality === p
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoodDisplay;
