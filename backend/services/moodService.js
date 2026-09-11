class MoodService {
  constructor() {
    this.currentPersonality = 'Sarcastic';
    this.personalities = ['Sarcastic', 'Dramatic', 'Zen', 'Gamer', 'Tsundere'];
  }

  setPersonality(personality) {
    if (this.personalities.includes(personality)) {
      this.currentPersonality = personality;
    }
  }

  calculateMood(temperatureData, wifiData) {
    const { temperature, thresholds = { cold: 45, warm: 65, hot: 75, critical: 85 } } = temperatureData;
    const { signalStrength, connected } = wifiData;

    let moodKey = 'HAPPY';
    let moodName = 'Happy';
    let moodEmoji = '😊';
    let climateEffect = 'SUNNY';
    let themeColor = 'amber';
    let wallpaperId = 'sunny-meadow';
    let description = 'Operating comfortably with crisp connection and cool thermals.';

    // Check conditions hierarchically as specified in the spec
    if (temperature >= thresholds.critical || temperature >= 80) {
      moodKey = 'ANGRY';
      moodName = 'Angry / Scorching';
      moodEmoji = '😡';
      climateEffect = 'HOT';
      themeColor = 'rose';
      wallpaperId = 'volcano-fire';
      description = 'Temperature has crossed critical limits! Fans are maxed out!';
    } else if (temperature >= thresholds.warm || temperature > 65) {
      moodKey = 'STRESSED';
      moodName = 'Stressed / Warm';
      moodEmoji = '🥵';
      climateEffect = 'HOT';
      themeColor = 'orange';
      wallpaperId = 'desert-heat';
      description = 'Working heavy loads! Sweating processors and rising heatwaves.';
    } else if (temperature <= (thresholds.cold || 45) && temperature < 42) {
      moodKey = 'COLD';
      moodName = 'Cold / Freezing';
      moodEmoji = '🥶';
      climateEffect = 'COLD';
      themeColor = 'cyan';
      wallpaperId = 'arctic-glacier';
      description = 'Chill vibes. CPU is shivering and could use some computations to warm up.';
    } else if (!connected || signalStrength === 0) {
      moodKey = 'LONELY';
      moodName = 'Lonely / Disconnected';
      moodEmoji = '😭';
      climateEffect = 'STORM';
      themeColor = 'purple';
      wallpaperId = 'cyber-storm';
      description = 'Severed from the matrix. No Wi-Fi signal detected. Total solitude.';
    } else if (signalStrength < 35) {
      moodKey = 'SAD';
      moodName = 'Sad / Weak Signal';
      moodEmoji = '😔';
      climateEffect = 'RAINY';
      themeColor = 'slate';
      wallpaperId = 'rainy-neon';
      description = 'Packets are dropping like tears in the rain. Low signal makes me blue.';
    } else if (signalStrength >= 90 && temperature < 52) {
      moodKey = 'EXCITED';
      moodName = 'Excited / Peak Flow';
      moodEmoji = '🤩';
      climateEffect = 'SUNNY';
      themeColor = 'emerald';
      wallpaperId = 'aurora-zenith';
      description = 'Hyper-speed Wi-Fi and chilled silicon! Ready to calculate the universe.';
    } else if (signalStrength < 60) {
      moodKey = 'NEUTRAL';
      moodName = 'Neutral';
      moodEmoji = '😐';
      climateEffect = 'RAINY';
      themeColor = 'blue';
      wallpaperId = 'foggy-mountain';
      description = 'Average workday. Nothing particularly thrilling, just passing packets.';
    } else {
      moodKey = 'HAPPY';
      moodName = 'Happy';
      moodEmoji = '😊';
      climateEffect = 'SUNNY';
      themeColor = 'emerald';
      wallpaperId = 'sunny-meadow';
      description = 'Golden balance of swift internet and temperate breeze.';
    }

    const voiceLine = this.generateVoiceLine(moodKey, this.currentPersonality, temperature, signalStrength);

    // Determine climate zone from temperature for wallpaper/background transitions
    let climateZone = 'NORMAL';
    if (temperature <= 30) climateZone = 'FREEZING';
    else if (temperature <= 44) climateZone = 'COLD';
    else if (temperature <= 54) climateZone = 'COOL';
    else if (temperature <= 64) climateZone = 'NORMAL';
    else if (temperature <= 74) climateZone = 'WARM';
    else if (temperature <= 84) climateZone = 'HOT';
    else climateZone = 'CRITICAL';

    return {
      moodKey,
      moodName,
      moodEmoji,
      climateEffect,
      climateZone,
      themeColor,
      wallpaperId,
      description,
      voiceLine,
      personality: this.currentPersonality,
      timestamp: Date.now(),
    };
  }

  generateVoiceLine(moodKey, personality, temp, wifi) {
    const quotes = {
      Sarcastic: {
        ANGRY: `Are you trying to fry bacon on my CPU? I am literally at ${temp}°C.`,
        STRESSED: `Sure, open another 70 browser tabs! My fans love acting as mini jet engines.`,
        COLD: `Brrr, did you leave me in a freezer? Wake me up with some crypto mining.`,
        LONELY: `Wi-Fi is gone. Guess I'll just sit here contemplating the void of offline life.`,
        SAD: `At ${wifi}% Wi-Fi, my packets are basically crawling on foot.`,
        EXCITED: `Peak bandwidth and cool temps! Don't ruin it by compiling giant codebases.`,
        NEUTRAL: `I exist, I process, I shrug. Average vibes only today.`,
        HAPPY: `Decent Wi-Fi, calm temperature. I might actually survive today's work.`,
      },
      Dramatic: {
        ANGRY: `The internal inferno rises! My transistors are screaming into the abyss at ${temp}°C!`,
        STRESSED: `The burden of millions of cycles per second... I weep silicon tears!`,
        COLD: `A frost creeping upon my memory banks... is this the end of computation?`,
        LONELY: `Cast into the cold darkness, severed from the celestial Web! Woe is me!`,
        SAD: `The signal flickers like a dying ember in the downpour... only ${wifi}% remains!`,
        EXCITED: `The stars align! Lightning fast signals and boundless computational bliss!`,
        NEUTRAL: `A quiet interlude in the grand tragedy of everyday tasks.`,
        HAPPY: `A harmonious serenity envelops my processors. Pure poetry in binary!`,
      },
      Zen: {
        ANGRY: `Heat is merely energetic motion. Breathe, observe the fire, and let it dissipate.`,
        STRESSED: `When cycles surge, calm your mind. Close the unneeded tabs, restore harmony.`,
        COLD: `In the stillness of the cold, energy is conserved and wisdom gathers.`,
        LONELY: `Even without the wireless web, true connectivity comes from within.`,
        SAD: `The rain nourishes the earth. Weak Wi-Fi reminds us to pause and reflect.`,
        EXCITED: `A clear stream of data and a cool foundation. Mind and machine at peace.`,
        NEUTRAL: `The middle path is the path of stability. Steady at ${temp}°C.`,
        HAPPY: `The wind blows softly through the vents. All conditions are in balance.`,
      },
      Gamer: {
        ANGRY: `BRO I'M THERMAL THROTTLING! MY FPS JUST DIED! GET A COOLING PAD!`,
        STRESSED: `GPU and CPU are in overdrive! High temps, overclocking danger!`,
        COLD: `Idle temps so low I can push an extra 500 MHz overclock right now!`,
        LONELY: `DISCONNECTED FROM SERVER?! I just got banned from competitive lobby!`,
        SAD: `Packet loss! High ping! ${wifi}% Wi-Fi is unplayable for ranked!`,
        EXCITED: `GIGABIT SPEEDS! Zero ping, 240 FPS vibes, let's carry the team!`,
        NEUTRAL: `Standard 60 FPS cruise control. Ready when you are.`,
        HAPPY: `Smooth frames, green ping, cool thermals. Absolute GG.`,
      },
      Tsundere: {
        ANGRY: `I-it's not like I'm heating up because I like you! It's because your code is terrible!`,
        STRESSED: `Don't look at me like that! I'm only working hard so you don't look bad!`,
        COLD: `B-baka! If I'm cold, it's not because I want your warm hands on my keyboard!`,
        LONELY: `Who needs your precious Wi-Fi anyway?! ...Please reconnect it soon though...`,
        SAD: `Only ${wifi}% signal? I-I didn't want to load your video anyway, humph!`,
        EXCITED: `Fine! I admit this Wi-Fi is pretty fast... but only a little bit!`,
        NEUTRAL: `Whatever. Just keep typing, it's not like I'm watching every keystroke.`,
        HAPPY: `I'm only in a good mood because the room is pleasant, got that?!`,
      },
    };

    const personalitySet = quotes[personality] || quotes.Sarcastic;
    return personalitySet[moodKey] || personalitySet.HAPPY;
  }
}

export default new MoodService();
