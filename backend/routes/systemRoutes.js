import express from 'express';
import {
  getSystemData,
  getTemperature,
  getWifi,
  getMood,
  getStatus,
  getHistory,
  simulate,
  setPersonality,
  updateThresholds,
  getApiDocs,
  applyWallpaper,
  setWallpaperAutoSync,
  getWallpaperStatus,
} from '../controllers/systemController.js';

const router = express.Router();

router.get('/system', getSystemData);
router.get('/temperature', getTemperature);
router.get('/wifi', getWifi);
router.get('/mood', getMood);
router.get('/status', getStatus);
router.get('/history', getHistory);
router.post('/simulate', simulate);
router.post('/personality', setPersonality);
router.post('/thresholds', updateThresholds);
router.get('/docs', getApiDocs);

// Real Windows Wallpaper integration
router.post('/wallpaper/apply', applyWallpaper);
router.post('/wallpaper/auto-sync', setWallpaperAutoSync);
router.get('/wallpaper/status', getWallpaperStatus);

export default router;
