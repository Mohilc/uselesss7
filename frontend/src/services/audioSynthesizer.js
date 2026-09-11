/**
 * AudioSynthesizer — Procedural Climate Soundscapes & Climate Change SFX Engine
 * 
 * Generates dynamic audio using Web Audio API synthesis:
 *   1. Climate Change Transition SFX (Instant cinematic sonic shifts when weather changes)
 *   2. Procedural Ambient Soundscapes (Continuous reactive background weather)
 *   3. System & Thermal Warning SFX (Overheat siren, Wi-Fi drops, fan hum)
 */
class AudioSynthesizer {
  constructor() {
    this.ctx = null;
    this.muted = true;
    this.volume = 0.35;
    this.masterGain = null;
    this.currentClimate = null;
    this.ambientInterval = null;
    this.transitionCooldown = false;
    this.cachedNoiseBuffers = {};
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, Number(volume) || 0));
    if (this.masterGain && this.ctx && !this.muted) {
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.1);
    }
  }

  setMuted(muted) {
    this.muted = muted;
    this.init();
    if (this.masterGain && this.ctx) {
      const targetGain = muted ? 0 : this.volume;
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.3);
    }
    if (muted) {
      this.stopAmbient();
    } else if (this.currentClimate) {
      this.startAmbientLoop(this.currentClimate);
    }
  }

  // ——————————————————— NOISE BUFFERS (CACHED) ———————————————————

  createNoiseBuffer(type = 'white', duration = 2) {
    if (!this.ctx) return null;
    const durKey = Math.ceil(duration);
    const key = `${type}_${durKey}`;
    if (this.cachedNoiseBuffers[key]) {
      return this.cachedNoiseBuffers[key];
    }

    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * Math.max(durKey, 2));
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else if (type === 'brown') {
        data[i] = (b0 = (b0 + (0.02 * white)) / 1.02) * 3.5;
      } else {
        data[i] = white;
      }
    }
    this.cachedNoiseBuffers[key] = buffer;
    return buffer;
  }

  playNoiseBurst({
    type = 'white',
    filterFreq = 3000,
    filterQ = 1,
    filterType = 'bandpass',
    gain = 0.08,
    duration = 0.3,
    attack = 0.01,
    decay = 0.15,
  } = {}) {
    if (!this.ctx || this.muted) return;
    const buffer = this.createNoiseBuffer(type, duration + 0.1);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    filter.Q.value = filterQ;

    const gainNode = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gain, now + attack);
    gainNode.gain.linearRampToValueAtTime(gain * 0.7, now + duration - decay);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.start(now);
    source.stop(now + duration);
  }

  // ——————————————————— CLIMATE CHANGE TRANSITION SFX ———————————————————

  /**
   * Distinct cinematic sound effect when changing climate
   */
  playClimateChangeSound(targetClimate) {
    this.init();
    if (this.muted || !this.ctx) return;

    const now = this.ctx.currentTime;

    switch (targetClimate) {
      case 'SUNNY': {
        // Golden harmonic sunrise chime arpeggio (E Major pentatonic) + warm breeze
        const notes = [329.63, 415.30, 493.88, 659.25, 830.61, 987.77];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          const t = now + idx * 0.07;
          osc.frequency.setValueAtTime(freq, t);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.01, t + 0.6);

          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.09, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 1.25);
        });

        // Warm sunny breeze sweep
        this.playNoiseBurst({
          type: 'pink',
          filterFreq: 450,
          filterQ: 0.8,
          filterType: 'lowpass',
          gain: 0.08,
          duration: 1.8,
          attack: 0.3,
          decay: 0.8,
        });

        // Melodic celebratory bird trill
        setTimeout(() => this.playBirdChirp(), 350);
        break;
      }

      case 'HOT': {
        // Thermal ignition whoosh + rising sizzling pitch + fire crackle
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(360, now + 0.8);
        osc.frequency.linearRampToValueAtTime(140, now + 1.4);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, now);
        filter.frequency.linearRampToValueAtTime(1200, now + 0.6);
        filter.frequency.linearRampToValueAtTime(300, now + 1.4);
        filter.Q.value = 4;

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 1.55);

        // Heat sizzle ignition burst
        this.playNoiseBurst({
          type: 'white',
          filterFreq: 3200,
          filterQ: 2,
          filterType: 'bandpass',
          gain: 0.1,
          duration: 0.9,
          attack: 0.05,
          decay: 0.4,
        });
        setTimeout(() => this.playFireCrackle(), 150);
        break;
      }

      case 'COLD': {
        // Sub-zero freeze fracture crack + glassy ice crystalline chimes + arctic gust
        const crystalFreqs = [1480, 2093, 2793, 3520, 4186];
        crystalFreqs.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          const t = now + idx * 0.06;
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.08 - idx * 0.01, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.95);
        });

        // Frost snap noise
        this.playNoiseBurst({
          type: 'white',
          filterFreq: 5500,
          filterQ: 4,
          filterType: 'highpass',
          gain: 0.09,
          duration: 0.4,
          attack: 0.005,
          decay: 0.2,
        });

        // Arctic wind howl
        setTimeout(() => this.playArcticWind(), 100);
        break;
      }

      case 'RAINY': {
        // Rolling soft thunder swell into soothing rain droplets
        this.playNoiseBurst({
          type: 'brown',
          filterFreq: 120,
          filterQ: 1.2,
          filterType: 'lowpass',
          gain: 0.16,
          duration: 1.8,
          attack: 0.2,
          decay: 1.0,
        });

        // Shower swoop
        this.playNoiseBurst({
          type: 'pink',
          filterFreq: 1800,
          filterQ: 0.5,
          filterType: 'lowpass',
          gain: 0.08,
          duration: 1.5,
          attack: 0.1,
          decay: 0.8,
        });

        setTimeout(() => this.playRainPatter(), 200);
        setTimeout(() => this.playRainPatter(), 450);
        break;
      }

      case 'STORM': {
        // Dramatic explosive lightning strike with sub-bass boom + electric zap
        // Sub-bass thunderboom (40Hz)
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(85, now);
        subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.8);
        subGain.gain.setValueAtTime(0.24, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        subOsc.connect(subGain);
        subGain.connect(this.masterGain);
        subOsc.start(now);
        subOsc.stop(now + 1.85);

        // High voltage electric lightning crack
        this.playNoiseBurst({
          type: 'white',
          filterFreq: 7000,
          filterQ: 1.5,
          filterType: 'highpass',
          gain: 0.2,
          duration: 0.15,
          attack: 0.002,
          decay: 0.08,
        });

        // Low rumble layer
        this.playNoiseBurst({
          type: 'brown',
          filterFreq: 90,
          filterQ: 0.6,
          filterType: 'lowpass',
          gain: 0.22,
          duration: 2.2,
          attack: 0.05,
          decay: 1.6,
        });

        setTimeout(() => this.playHowlingWind(), 150);
        break;
      }

      default:
        this.playSunnyWind();
        break;
    }
  }

  // ——————————————————— INDIVIDUAL PROCEDURAL SOUNDS ———————————————————

  /** Gentle wind breeze (for SUNNY) */
  playSunnyWind() {
    this.playNoiseBurst({
      type: 'pink',
      filterFreq: 420,
      filterQ: 0.6,
      filterType: 'lowpass',
      gain: 0.05,
      duration: 2.6,
      attack: 0.5,
      decay: 0.9,
    });
  }

  /** Bird chirp — realistic multi-tone sine sweep */
  playBirdChirp() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const baseFreq = 2600 + Math.random() * 1800;

    for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const t = now + i * (0.055 + Math.random() * 0.035);
      osc.frequency.setValueAtTime(baseFreq + Math.random() * 400, t);
      osc.frequency.linearRampToValueAtTime(baseFreq + 900 + Math.random() * 500, t + 0.035);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.04, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.065);
    }
  }

  /** Rain patter */
  playRainPatter() {
    const count = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.playNoiseBurst({
          type: 'white',
          filterFreq: 3800 + Math.random() * 4200,
          filterQ: 3 + Math.random() * 4,
          filterType: 'bandpass',
          gain: 0.025 + Math.random() * 0.03,
          duration: 0.06 + Math.random() * 0.04,
          attack: 0.002,
          decay: 0.02,
        });
      }, i * (18 + Math.random() * 35));
    }
  }

  /** Continuous rain wash */
  playRainWash() {
    this.playNoiseBurst({
      type: 'pink',
      filterFreq: 2400,
      filterQ: 0.35,
      filterType: 'lowpass',
      gain: 0.065,
      duration: 3.2,
      attack: 0.4,
      decay: 1.1,
    });
  }

  /** Thunder rumble with sub-bass */
  playThunder() {
    if (!this.ctx || this.muted) return;
    this.playNoiseBurst({
      type: 'brown',
      filterFreq: 85,
      filterQ: 0.6,
      filterType: 'lowpass',
      gain: 0.22,
      duration: 2.8,
      attack: 0.03,
      decay: 1.8,
    });
    setTimeout(() => {
      this.playNoiseBurst({
        type: 'white',
        filterFreq: 5800,
        filterQ: 1.2,
        filterType: 'highpass',
        gain: 0.14,
        duration: 0.09,
        attack: 0.002,
        decay: 0.04,
      });
    }, 40);
  }

  /** Howling wind */
  playHowlingWind() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80 + Math.random() * 40, now);
    osc.frequency.linearRampToValueAtTime(130 + Math.random() * 60, now + 1.5);
    osc.frequency.linearRampToValueAtTime(65, now + 3);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, now);
    filter.frequency.linearRampToValueAtTime(650, now + 1.2);
    filter.frequency.linearRampToValueAtTime(160, now + 3);
    filter.Q.value = 6;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.5);
    gain.gain.linearRampToValueAtTime(0.09, now + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 3.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 3.5);

    this.playNoiseBurst({
      type: 'brown',
      filterFreq: 320,
      filterQ: 0.9,
      filterType: 'lowpass',
      gain: 0.06,
      duration: 3,
      attack: 0.3,
      decay: 1,
    });
  }

  /** Fire crackle */
  playFireCrackle() {
    const pops = 5 + Math.floor(Math.random() * 6);
    for (let i = 0; i < pops; i++) {
      setTimeout(() => {
        this.playNoiseBurst({
          type: 'white',
          filterFreq: 1800 + Math.random() * 3200,
          filterQ: 6 + Math.random() * 8,
          filterType: 'bandpass',
          gain: 0.045 + Math.random() * 0.045,
          duration: 0.03 + Math.random() * 0.03,
          attack: 0.001,
          decay: 0.015,
        });
      }, i * (70 + Math.random() * 180));
    }
  }

  /** Heat haze drone */
  playHeatDrone() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    [55, 82.5, 110].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.025 - i * 0.006, now + 0.5);
      gain.gain.linearRampToValueAtTime(0.018, now + 2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 3.3);
    });
  }

  /** Ice crystal chime */
  playIceChime() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const freqs = [1320, 1980, 2640, 3520].sort(() => Math.random() - 0.5).slice(0, 2);
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f + Math.random() * 150, now + i * 0.12);
      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.03, now + i * 0.12 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.85);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.95);
    });
  }

  /** Arctic wind whistle */
  playArcticWind() {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    const base = 320 + Math.random() * 220;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.linearRampToValueAtTime(base + 180, now + 1.1);
    osc.frequency.linearRampToValueAtTime(base - 60, now + 2.6);

    filter.type = 'bandpass';
    filter.frequency.value = base + 120;
    filter.Q.value = 9;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.3);
    gain.gain.linearRampToValueAtTime(0.045, now + 1.3);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 3.1);

    this.playNoiseBurst({
      type: 'pink',
      filterFreq: 850,
      filterQ: 2,
      filterType: 'bandpass',
      gain: 0.045,
      duration: 2.6,
      attack: 0.2,
      decay: 0.9,
    });
  }

  // ——————————————————— AMBIENT LOOP ENGINE ———————————————————

  stopAmbient() {
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }

  startAmbientLoop(climate) {
    this.stopAmbient();
    if (this.muted) return;
    this.currentClimate = climate;

    const tick = () => {
      if (this.muted) return;

      switch (climate) {
        case 'SUNNY':
          this.playSunnyWind();
          if (Math.random() < 0.4) setTimeout(() => this.playBirdChirp(), Math.random() * 1500);
          if (Math.random() < 0.25) setTimeout(() => this.playBirdChirp(), 800 + Math.random() * 1200);
          break;

        case 'RAINY':
          this.playRainWash();
          this.playRainPatter();
          setTimeout(() => this.playRainPatter(), 350 + Math.random() * 500);
          setTimeout(() => this.playRainPatter(), 900 + Math.random() * 700);
          if (Math.random() < 0.09) setTimeout(() => this.playThunder(), 1400 + Math.random() * 1000);
          break;

        case 'STORM':
          this.playRainWash();
          this.playRainPatter();
          this.playRainPatter();
          setTimeout(() => this.playRainPatter(), 200);
          setTimeout(() => this.playRainPatter(), 450);
          this.playHowlingWind();
          if (Math.random() < 0.3) setTimeout(() => this.playThunder(), 400 + Math.random() * 1400);
          break;

        case 'HOT':
          this.playFireCrackle();
          this.playHeatDrone();
          if (Math.random() < 0.35) setTimeout(() => this.playFireCrackle(), 700 + Math.random() * 900);
          break;

        case 'COLD':
          this.playArcticWind();
          if (Math.random() < 0.45) setTimeout(() => this.playIceChime(), 450 + Math.random() * 1400);
          if (Math.random() < 0.2) setTimeout(() => this.playIceChime(), 1400 + Math.random() * 900);
          break;

        default:
          this.playSunnyWind();
          break;
      }
    };

    tick();
    const intervalMs = climate === 'STORM' ? 2800 : climate === 'RAINY' ? 3000 : 3400;
    this.ambientInterval = setInterval(tick, intervalMs);
  }

  /**
   * Main transition handler triggered on mood / climate shift
   */
  playMoodTransition(climate) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    if (this.transitionCooldown) return;
    this.transitionCooldown = true;
    setTimeout(() => { this.transitionCooldown = false; }, 1800);

    // Play dedicated climate change sound effect
    this.playClimateChangeSound(climate);

    // Spin up ambient loop
    setTimeout(() => this.startAmbientLoop(climate), 900);
  }

  /** Overheating emergency siren */
  playOverheatingAlarm() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const startT = now + i * 0.24;
      osc.frequency.setValueAtTime(920, startT);
      osc.frequency.exponentialRampToValueAtTime(460, startT + 0.11);
      osc.frequency.setValueAtTime(920, startT + 0.11);
      osc.frequency.exponentialRampToValueAtTime(460, startT + 0.21);

      gain.gain.setValueAtTime(0.18, startT);
      gain.gain.exponentialRampToValueAtTime(0.01, startT + 0.23);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startT);
      osc.stop(startT + 0.25);
    }
  }

  /** Pleasant interactive cyber chime when user interacts or pokes the companion */
  playInteractionChime() {
    this.init();
    if (!this.ctx) return;
    const wasMuted = this.muted;
    const now = this.ctx.currentTime;

    // Harmonious cyber pentatonic sweep (C6, E6, G6, B6)
    const pitches = [1046.5, 1318.5, 1567.98, 1975.53];
    pitches.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const t = now + idx * 0.05;
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, t + 0.35);

      gain.gain.setValueAtTime(0, t);
      const vol = wasMuted ? 0.04 : (this.volume * 0.25);
      gain.gain.linearRampToValueAtTime(vol, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }
}

export default new AudioSynthesizer();

