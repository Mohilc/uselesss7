import os from 'os';
import si from 'systeminformation';
import temperatureService from '../services/temperatureService.js';
import wifiService from '../services/wifiService.js';
import moodService from '../services/moodService.js';
import wallpaperService from '../services/wallpaperService.js';

const telemetryHistory = [];
const MAX_HISTORY = 50;

export const getSystemData = async (req, res) => {
  try {
    const [temperature, wifi] = await Promise.all([
      temperatureService.getTemperatureData(),
      wifiService.getWifiData(),
    ]);
    const mood = moodService.calculateMood(temperature, wifi);

    const snapshot = {
      timestamp: Date.now(),
      temperature: temperature.temperature,
      wifiSignal: wifi.signalStrength,
      moodKey: mood.moodKey,
    };

    telemetryHistory.push(snapshot);
    if (telemetryHistory.length > MAX_HISTORY) {
      telemetryHistory.shift();
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      temperature,
      wifi,
      mood,
      system: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptimeSeconds: Math.round(os.uptime()),
        freeMemoryMB: Math.round(os.freemem() / (1024 * 1024)),
        totalMemoryMB: Math.round(os.totalmem() / (1024 * 1024)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTemperature = async (req, res) => {
  try {
    const data = await temperatureService.getTemperatureData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getWifi = async (req, res) => {
  try {
    const data = await wifiService.getWifiData();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMood = async (req, res) => {
  try {
    const [temperature, wifi] = await Promise.all([
      temperatureService.getTemperatureData(),
      wifiService.getWifiData(),
    ]);
    const mood = moodService.calculateMood(temperature, wifi);
    res.json({ success: true, data: mood });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getStatus = async (req, res) => {
  try {
    const cpu = await si.cpu();
    const mem = await si.mem();
    res.json({
      success: true,
      status: 'operational',
      serverTime: new Date().toISOString(),
      uptime: process.uptime(),
      hardware: {
        cpuModel: `${cpu.manufacturer || ''} ${cpu.brand || ''}`.trim(),
        cores: cpu.cores,
        speedGhz: cpu.speed,
        totalRamGB: parseFloat((mem.total / (1024 ** 3)).toFixed(2)),
        usedRamGB: parseFloat((mem.used / (1024 ** 3)).toFixed(2)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getHistory = (req, res) => {
  res.json({
    success: true,
    data: telemetryHistory,
  });
};

export const simulate = (req, res) => {
  try {
    const {
      enabled,
      temperature,
      wifiSignal,
      wifiConnected,
      wifiSsid,
      personality,
    } = req.body;

    if (enabled !== undefined) {
      temperatureService.setSimulation(enabled, temperature);
      wifiService.setSimulation(enabled, wifiSignal, wifiConnected, wifiSsid);
    } else {
      if (temperature !== undefined) {
        temperatureService.setSimulation(true, temperature);
      }
      if (wifiSignal !== undefined || wifiConnected !== undefined || wifiSsid !== undefined) {
        wifiService.setSimulation(true, wifiSignal, wifiConnected, wifiSsid);
      }
    }

    if (personality) {
      moodService.setPersonality(personality);
    }

    // Immediately trigger Windows desktop wallpaper sync for the new temperature
    if (temperature !== undefined && !isNaN(Number(temperature))) {
      wallpaperService.handleTemperatureChange(Number(temperature)).catch(() => {});
    } else if (enabled === false) {
      // Reverting to live hardware temperature
      const liveData = temperatureService.getTemperatureData();
      liveData.then((d) => {
        if (d?.temperature != null) {
          wallpaperService.handleTemperatureChange(Number(d.temperature)).catch(() => {});
        }
      }).catch(() => {});
    }

    res.json({
      success: true,
      message: 'Simulation parameters updated successfully',
      settings: {
        simulationActive: Boolean(enabled),
        temperature,
        wifiSignal,
        wifiConnected,
        personality: moodService.currentPersonality,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const setPersonality = (req, res) => {
  const { personality } = req.body;
  if (!personality) {
    return res.status(400).json({ success: false, error: 'Personality required' });
  }
  moodService.setPersonality(personality);
  res.json({ success: true, currentPersonality: moodService.currentPersonality });
};

export const updateThresholds = (req, res) => {
  const { thresholds } = req.body;
  if (!thresholds || typeof thresholds !== 'object') {
    return res.status(400).json({ success: false, error: 'Valid thresholds object required' });
  }
  temperatureService.setThresholds(thresholds);
  res.json({ success: true, thresholds: temperatureService.thresholds });
};

export const applyWallpaper = async (req, res) => {
  try {
    const { mood, url, temperature } = req.body;
    const result = await wallpaperService.setWindowsWallpaper(mood, url, temperature ?? null);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const setWallpaperAutoSync = (req, res) => {
  const { enabled } = req.body;
  const result = wallpaperService.setAutoSync(enabled);
  res.json({ success: true, ...result });
};

export const getWallpaperStatus = (req, res) => {
  res.json({ success: true, status: wallpaperService.getStatus() });
};

export const getApiDocs = (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'MoodOS System & Telemetry API',
      version: '1.0.0',
      description: 'API for monitoring laptop hardware temperature, Wi-Fi connectivity, and dynamic mood synthesis.',
    },
    paths: {
      '/api/system': {
        get: { summary: 'Combined system telemetry, temperature, wifi, and calculated mood' },
      },
      '/api/temperature': {
        get: { summary: 'Current CPU temperature and overheating hazard analysis' },
      },
      '/api/wifi': {
        get: { summary: 'Current Wi-Fi connection quality, ping latency, and signal' },
      },
      '/api/mood': {
        get: { summary: 'Current calculated mood, theme, climate effect, and speech line' },
      },
      '/api/status': {
        get: { summary: 'Server health, CPU specifications, and RAM utilization' },
      },
      '/api/history': {
        get: { summary: 'Session history data points for graphing' },
      },
      '/api/simulate': {
        post: {
          summary: 'Control simulation mode and override temperature/Wi-Fi values',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    enabled: { type: 'boolean' },
                    temperature: { type: 'number' },
                    wifiSignal: { type: 'number' },
                    wifiConnected: { type: 'boolean' },
                    personality: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      '/api/thresholds': {
        post: { summary: 'Set custom user temperature thresholds' },
      },
    },
  });
};
