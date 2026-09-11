import { jest } from '@jest/globals';
import request from 'supertest';
import { app, server, broadcastInterval } from '../server.js';
import moodService from '../services/moodService.js';
import temperatureService from '../services/temperatureService.js';
import wifiService from '../services/wifiService.js';

describe('MoodOS Telemetry API and Engine Tests', () => {
  jest.setTimeout(15000);

  afterAll((done) => {
    clearInterval(broadcastInterval);
    if (server.listening) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('GET /', () => {
    it('should return 200 with server status', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('online');
    });
  });

  describe('GET /api/system', () => {
    it('should return complete system telemetry', async () => {
      const res = await request(app).get('/api/system');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.temperature).toBeDefined();
      expect(res.body.wifi).toBeDefined();
      expect(res.body.mood).toBeDefined();
      expect(res.body.system).toBeDefined();
    });
  });

  describe('GET /api/temperature and /api/wifi', () => {
    it('should return temperature data with status and trend', async () => {
      const res = await request(app).get('/api/temperature');
      expect(res.status).toBe(200);
      expect(res.body.data.temperature).toBeGreaterThan(0);
      expect(res.body.data.status).toBeDefined();
    });

    it('should return wifi data with quality badge', async () => {
      const res = await request(app).get('/api/wifi');
      expect(res.status).toBe(200);
      expect(res.body.data.signalStrength).toBeGreaterThanOrEqual(0);
      expect(res.body.data.quality).toBeDefined();
    });
  });

  describe('POST /api/simulate', () => {
    it('should correctly set simulated values and update mood', async () => {
      const simPayload = {
        enabled: true,
        temperature: 88,
        wifiSignal: 95,
        wifiConnected: true,
        personality: 'Gamer',
      };

      const res = await request(app)
        .post('/api/simulate')
        .send(simPayload);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify system endpoint reflects the simulation
      const sysRes = await request(app).get('/api/system');
      expect(sysRes.body.temperature.temperature).toBeCloseTo(88, 0);
      expect(sysRes.body.mood.moodKey).toBe('ANGRY');
      expect(sysRes.body.mood.climateEffect).toBe('HOT');
      expect(sysRes.body.mood.personality).toBe('Gamer');
    });
  });

  describe('Mood Calculation Engine Boundaries', () => {
    it('should trigger ANGRY when temperature > 80°C', () => {
      const mood = moodService.calculateMood({ temperature: 82 }, { signalStrength: 80, connected: true });
      expect(mood.moodKey).toBe('ANGRY');
      expect(mood.climateEffect).toBe('HOT');
    });

    it('should trigger STRESSED when temperature > 65°C and <= 80°C', () => {
      const mood = moodService.calculateMood({ temperature: 72 }, { signalStrength: 80, connected: true });
      expect(mood.moodKey).toBe('STRESSED');
      expect(mood.climateEffect).toBe('HOT');
    });

    it('should trigger COLD when temperature <= 40°C', () => {
      const mood = moodService.calculateMood({ temperature: 38 }, { signalStrength: 80, connected: true });
      expect(mood.moodKey).toBe('COLD');
      expect(mood.climateEffect).toBe('COLD');
    });

    it('should trigger LONELY when Wi-Fi is disconnected', () => {
      const mood = moodService.calculateMood({ temperature: 52 }, { signalStrength: 0, connected: false });
      expect(mood.moodKey).toBe('LONELY');
      expect(mood.climateEffect).toBe('STORM');
    });

    it('should trigger SAD when Wi-Fi signal < 35%', () => {
      const mood = moodService.calculateMood({ temperature: 52 }, { signalStrength: 25, connected: true });
      expect(mood.moodKey).toBe('SAD');
      expect(mood.climateEffect).toBe('RAINY');
    });

    it('should trigger HAPPY under normal balanced conditions', () => {
      const mood = moodService.calculateMood({ temperature: 52 }, { signalStrength: 80, connected: true });
      expect(mood.moodKey).toBe('HAPPY');
      expect(mood.climateEffect).toBe('SUNNY');
    });
  });

  describe('Windows Wallpaper Endpoints', () => {
    it('should return wallpaper service status', async () => {
      const res = await request(app).get('/api/wallpaper/status');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBeDefined();
    });

    it('should toggle wallpaper auto-sync', async () => {
      const res = await request(app)
        .post('/api/wallpaper/auto-sync')
        .send({ enabled: true });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.autoSync).toBe(true);
    });
  });
});
