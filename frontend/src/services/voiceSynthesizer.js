/**
 * VoiceSynthesizer — Dynamic Temperature & Temperament Adaptive Speech Engine
 * 
 * Dynamically modulates voice parameters (Rate, Pitch, Volume, Inflection, Cadence)
 * based on BOTH the laptop's exact temperature and temperament/mood:
 * 
 * Temperature Scaling:
 *   FREEZING  (< 35°C)   → Shivering slow tempo (0.58x), trembling low pitch (0.65x), chattering pauses ("B-b-brr...")
 *   COLD      (35–45°C)  → Sluggish rate (0.75x), deep crisp pitch (0.78x)
 *   BALANCED  (46–62°C)  → Smooth natural pace (0.98x), melodious balanced pitch (1.0x)
 *   WARM      (63–74°C)  → Anxious elevated rate (1.18x), higher tense pitch (1.18x)
 *   HOT/ANGRY (75–84°C)  → Fast aggressive cadence (1.38x), piercing high pitch (1.35x), sharp staccato
 *   CRITICAL  (> 85°C)   → Overclocked alarm mode, glitchy pitch shifts, rapid urgent stutter
 * 
 * Temperament / Personality Modifiers:
 *   Sarcastic, Dramatic, Zen, Gamer, Tsundere
 */
class VoiceSynthesizer {
  constructor() {
    this.enabled = false;
    this.isSpeaking = false;
    this.lastSpokenText = '';
    this.currentTemperature = 50;
    this.currentMood = 'HAPPY';
    this.lastSpeakTime = 0;
    this.minSpeakInterval = 3500;
  }

  setEnabled(val) {
    this.enabled = Boolean(val);
    if (!this.enabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  setTemperature(temp) {
    this.currentTemperature = typeof temp === 'number' ? temp : 50;
  }

  setMood(moodKey) {
    if (moodKey) this.currentMood = moodKey;
  }

  /**
   * Calculate precise voice acoustic parameters based on temperature and mood.
   */
  getTemperatureVoiceParams() {
    const t = this.currentTemperature;

    if (t >= 85) {
      // CRITICAL MELTDOWN — Strained overclocked robotic panic
      return {
        rate: 1.45 + Math.random() * 0.15,
        pitch: 0.35 + (Math.random() > 0.5 ? 0.9 : 0),
        volume: 1.0,
        voiceStyle: 'critical',
        stateLabel: 'Thermal Overload Alarm',
      };
    }
    if (t >= 75) {
      // HOT / SCORCHING — Rapid, tense, sharp, high pitch
      const progress = (t - 75) / 10;
      return {
        rate: 1.3 + progress * 0.18,
        pitch: 1.28 + progress * 0.22,
        volume: 0.98,
        voiceStyle: 'hot',
        stateLabel: 'Scorching / Agitated',
      };
    }
    if (t >= 63) {
      // WARM — Slightly hurried, anxious, elevated pitch
      const progress = (t - 63) / 12;
      return {
        rate: 1.08 + progress * 0.14,
        pitch: 1.1 + progress * 0.12,
        volume: 0.92,
        voiceStyle: 'warm',
        stateLabel: 'Elevated Thermals',
      };
    }
    if (t <= 35) {
      // FREEZING — Shivering, trembling, slowed down
      return {
        rate: 0.58,
        pitch: 0.62,
        volume: 0.72,
        voiceStyle: 'freezing',
        stateLabel: 'Sub-Zero Shivering',
      };
    }
    if (t <= 45) {
      // COLD — Sluggish, chattering cadence
      const progress = (t - 35) / 10;
      return {
        rate: 0.72 + progress * 0.12,
        pitch: 0.74 + progress * 0.12,
        volume: 0.8,
        voiceStyle: 'cold',
        stateLabel: 'Chilly / Sluggish',
      };
    }
    // BALANCED (46–62°C) — Confident, calm, resonant
    return {
      rate: 0.98,
      pitch: 1.0,
      volume: 0.88,
      voiceStyle: 'normal',
      stateLabel: 'Optimal / Harmonious',
    };
  }

  /**
   * Layer temperament and personality onto acoustic parameters
   */
  applyPersonalityAndMoodModifier(params, personality, moodKey) {
    // Mood adjustment
    if (moodKey === 'LONELY' || moodKey === 'SAD') {
      params.rate = Math.max(0.5, params.rate * 0.85);
      params.pitch = Math.max(0.5, params.pitch * 0.85);
    } else if (moodKey === 'EXCITED') {
      params.rate = Math.min(2.0, params.rate * 1.2);
      params.pitch = Math.min(2.0, params.pitch * 1.25);
    }

    // Personality adjustment
    switch (personality) {
      case 'Gamer':
        params.rate = Math.min(2.0, params.rate * 1.18);
        params.pitch = Math.min(2.0, params.pitch * 1.12);
        break;
      case 'Dramatic':
        params.rate = Math.max(0.4, params.rate * 0.88);
        params.pitch = Math.max(0.3, params.pitch * 0.92);
        break;
      case 'Zen':
        params.rate = Math.max(0.45, params.rate * 0.78);
        params.pitch = Math.min(1.8, params.pitch * 0.95);
        params.volume = Math.max(0.3, params.volume * 0.78);
        break;
      case 'Tsundere':
        params.rate = Math.min(2.0, params.rate * 1.12);
        params.pitch = Math.min(2.0, params.pitch * 1.32);
        break;
      default:
        // Sarcastic
        params.pitch = Math.min(2.0, params.pitch * 1.04);
        break;
    }
    return params;
  }

  /**
   * Select the most natural or expressive browser voice available
   */
  selectVoice(voiceStyle) {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;

    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    const pool = englishVoices.length > 0 ? englishVoices : voices;

    if (voiceStyle === 'critical') {
      const roboticVoice = pool.find(v =>
        ['david', 'mark', 'zira', 'robot', 'google', 'desktop'].some(k =>
          v.name.toLowerCase().includes(k)
        )
      );
      if (roboticVoice) return roboticVoice;
    }

    if (voiceStyle === 'freezing' || voiceStyle === 'cold') {
      const deepVoice = pool.find(v =>
        ['male', 'david', 'mark', 'george', 'guy'].some(k =>
          v.name.toLowerCase().includes(k)
        )
      );
      if (deepVoice) return deepVoice;
    }

    // Prefer natural / high quality neural voices
    const naturalVoice = pool.find(v =>
      ['natural', 'online', 'google', 'samantha', 'jenny', 'aria'].some(k =>
        v.name.toLowerCase().includes(k)
      )
    );
    if (naturalVoice) return naturalVoice;

    return pool[0];
  }

  /**
   * Format spoken text to convey physiological state (shivering, panting, alarm)
   */
  formatSpokenText(text, voiceStyle, moodKey) {
    let output = text;

    if (voiceStyle === 'freezing') {
      output = `B-b-brr... ${text.replace(/\b(\w{3,})\b/g, '$1...')} ...so freezing!`;
    } else if (voiceStyle === 'critical') {
      const words = text.split(' ');
      const intro = `ATTENTION! THERMAL ALERT!`;
      output = `${intro} ${words.slice(0, 3).join(' ')}... ${text}!`;
    } else if (voiceStyle === 'hot' && moodKey === 'ANGRY') {
      output = `*panting* ${text}!`;
    } else if (moodKey === 'SAD' || moodKey === 'LONELY') {
      output = `*sigh*... ${text}`;
    }

    return output;
  }

  /**
   * Main speak method
   */
  speak(text, personality = 'Sarcastic', moodKey = null, force = false) {
    if ((!this.enabled && !force) || !text || !('speechSynthesis' in window)) return;

    const now = Date.now();
    if (!force && now - this.lastSpeakTime < this.minSpeakInterval && text === this.lastSpokenText) {
      return;
    }

    window.speechSynthesis.cancel();
    this.lastSpokenText = text;
    this.lastSpeakTime = now;

    const activeMood = moodKey || this.currentMood;
    let params = this.getTemperatureVoiceParams();
    params = this.applyPersonalityAndMoodModifier(params, personality, activeMood);

    const formattedText = this.formatSpokenText(text, params.voiceStyle, activeMood);
    const utterance = new SpeechSynthesisUtterance(formattedText);

    utterance.rate = Math.max(0.3, Math.min(2.0, params.rate));
    utterance.pitch = Math.max(0.1, Math.min(2.0, params.pitch));
    utterance.volume = Math.max(0.1, Math.min(1.0, params.volume));

    const voice = this.selectVoice(params.voiceStyle);
    if (voice) utterance.voice = voice;

    utterance.onstart = () => { this.isSpeaking = true; };
    utterance.onend = () => { this.isSpeaking = false; };
    utterance.onerror = () => { this.isSpeaking = false; };

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Quick preview test of the current voice tone
   */
  previewVoice(temperature, personality = 'Sarcastic', moodKey = 'HAPPY') {
    this.setTemperature(temperature);
    this.setMood(moodKey);
    const params = this.getTemperatureVoiceParams();
    const testLine = `Temperature ${temperature}°C. Voice calibrated to ${params.stateLabel}.`;
    this.speak(testLine, personality, moodKey, true);
  }
}

export default new VoiceSynthesizer();
