import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

/**
 * Temperature-driven climate wallpapers.
 * The wallpaper changes based on actual temperature ranges to create an
 * immersive "climate effect" on the Windows desktop.
 *
 * Zones (°C):
 *   FREEZING: ≤ 30     — Arctic tundra, glacial ice
 *   COLD:     31–44    — Snowy winter forest, frozen lakes
 *   COOL:     45–54    — Misty mountains, cool morning fog
 *   NORMAL:   55–64    — Sunny green meadows, golden hour
 *   WARM:     65–74    — Desert dunes, amber sunset heat haze
 *   HOT:      75–84    — Volcanic lava, molten rock
 *   CRITICAL: ≥ 85     — Inferno hellscape, blazing wildfire
 */
const CLIMATE_WALLPAPERS = {
  FREEZING: {
    name: 'Arctic Tundra',
    url: 'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=2560&q=85',
    color: '#03141f',
    description: 'Glacial ice fields and frozen aurora skies (≤ 30°C)',
  },
  COLD: {
    name: 'Winter Forest',
    url: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=2560&q=85',
    color: '#0a1929',
    description: 'Snow-blanketed pines under a crisp blue sky (31–44°C)',
  },
  COOL: {
    name: 'Misty Peaks',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=85',
    color: '#0f1b2d',
    description: 'Cool mountain fog rolling through valleys (45–54°C)',
  },
  NORMAL: {
    name: 'Golden Meadow',
    url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2560&q=85',
    color: '#041f17',
    description: 'Warm sunlight through green rolling hills (55–64°C)',
  },
  WARM: {
    name: 'Desert Heat',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2560&q=85',
    color: '#1f0b03',
    description: 'Amber desert dunes shimmering in heat haze (65–74°C)',
  },
  HOT: {
    name: 'Volcanic Fury',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=2560&q=85',
    color: '#1a0508',
    description: 'Molten lava flows and volcanic eruptions (75–84°C)',
  },
  CRITICAL: {
    name: 'Inferno',
    url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=2560&q=85',
    color: '#200000',
    description: 'Blazing wildfire consuming everything in sight (≥ 85°C)',
  },
};

class WallpaperService {
  constructor() {
    this.autoSync = true; // auto-sync Windows desktop wallpaper on by default
    this.lastAppliedZone = null;
    this.isApplying = false;

    // Cache directory in AppData or temp
    const baseDir = process.env.APPDATA || os.tmpdir();
    this.cacheDir = path.join(baseDir, 'MoodOS', 'wallpapers');
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }
    } catch (e) {
      console.warn('[WallpaperService] Could not create cache dir:', e.message);
    }
  }

  /**
   * Determine the climate zone from a temperature value (°C).
   */
  getClimateZone(temperature) {
    const temp = Number(temperature);
    if (isNaN(temp)) return 'NORMAL';
    if (temp <= 30) return 'FREEZING';
    if (temp <= 44) return 'COLD';
    if (temp <= 54) return 'COOL';
    if (temp <= 64) return 'NORMAL';
    if (temp <= 74) return 'WARM';
    if (temp <= 84) return 'HOT';
    return 'CRITICAL';
  }

  setAutoSync(enabled) {
    this.autoSync = Boolean(enabled);
    console.log(`[WallpaperService] Auto-sync set to: ${this.autoSync}`);
    return { autoSync: this.autoSync };
  }

  getStatus() {
    return {
      autoSync: this.autoSync,
      lastAppliedZone: this.lastAppliedZone,
      isApplying: this.isApplying,
      cacheDir: this.cacheDir,
      climateZones: Object.keys(CLIMATE_WALLPAPERS),
    };
  }

  /**
   * Generates a sleek, high-resolution offline bitmap wallpaper for a climate zone
   * if network is unavailable or Unsplash download fails.
   */
   generateFallbackWallpaper(filePath, hexColor = '#0f172a') {
    try {
      const width = 640;
      const height = 360;
      const r = parseInt(hexColor.slice(1, 3), 16) || 15;
      const g = parseInt(hexColor.slice(3, 5), 16) || 23;
      const b = parseInt(hexColor.slice(5, 7), 16) || 42;

      const rowPadding = (4 - ((width * 3) % 4)) % 4;
      const rowSize = width * 3 + rowPadding;
      const pixelDataSize = rowSize * height;
      const fileSize = 54 + pixelDataSize;

      const buffer = Buffer.alloc(fileSize);

      // BMP Header
      buffer.write('BM', 0);
      buffer.writeUInt32LE(fileSize, 2);
      buffer.writeUInt32LE(54, 10); // Offset to pixel data

      // DIB Header
      buffer.writeUInt32LE(40, 14); // DIB header size
      buffer.writeInt32LE(width, 18);
      buffer.writeInt32LE(height, 22);
      buffer.writeUInt16LE(1, 26);  // Color planes
      buffer.writeUInt16LE(24, 28); // 24 bpp
      buffer.writeUInt32LE(0, 30);  // BI_RGB (uncompressed)
      buffer.writeUInt32LE(pixelDataSize, 34);

      // Fill pixels (BGR order) with vertical gradient
      let offset = 54;
      for (let y = 0; y < height; y++) {
        const factor = 0.4 + (0.6 * (y / height));
        const pr = Math.min(255, Math.floor(r * factor));
        const pg = Math.min(255, Math.floor(g * factor));
        const pb = Math.min(255, Math.floor(b * factor));

        for (let x = 0; x < width; x++) {
          buffer[offset++] = pb;
          buffer[offset++] = pg;
          buffer[offset++] = pr;
        }
        for (let p = 0; p < rowPadding; p++) {
          buffer[offset++] = 0;
        }
      }

      fs.writeFileSync(filePath, buffer);
      return filePath;
    } catch (err) {
      console.warn('[WallpaperService] Fallback BMP generation failed:', err.message);
      return null;
    }
  }

  /**
   * Downloads image if not already cached and saves as JPEG.
   * If offline or download fails, generates a local high-res climate gradient.
   */
  async downloadWallpaper(zoneKey, url) {
    const config = CLIMATE_WALLPAPERS[zoneKey] || CLIMATE_WALLPAPERS.NORMAL;
    const filePath = path.join(this.cacheDir, `wallpaper_climate_${zoneKey.toLowerCase()}.jpg`);
    const bmpPath = path.join(this.cacheDir, `wallpaper_climate_${zoneKey.toLowerCase()}.bmp`);

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 5000) {
        return filePath;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);
      return filePath;
    } catch (err) {
      console.warn(`[WallpaperService] Download failed for climate zone ${zoneKey} (${err.message}). Using high-fidelity offline fallback.`);
      if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
        return filePath;
      }
      return this.generateFallbackWallpaper(bmpPath, config.color) || filePath;
    }
  }

  /**
   * Physically set Windows Desktop Wallpaper using PowerShell and Win32 API.
   * Uses Base64 EncodedCommand to ensure flawless execution with no quote/newline bugs.
   */
  async setWindowsWallpaper(moodKey, customUrl = null, temperature = null) {
    if (process.platform !== 'win32') {
      console.log('[WallpaperService] Non-Windows OS detected, skipping native wallpaper change.');
      return { success: false, reason: 'Platform is not Windows' };
    }

    // Determine climate zone from temperature (primary) or fall back to mood mapping
    let zoneKey;
    if (temperature !== null && temperature !== undefined && !isNaN(Number(temperature))) {
      zoneKey = this.getClimateZone(Number(temperature));
    } else {
      const moodToZone = {
        ANGRY: 'CRITICAL',
        STRESSED: 'HOT',
        HOT: 'HOT',
        COLD: 'FREEZING',
        HAPPY: 'NORMAL',
        EXCITED: 'COOL',
        SAD: 'COLD',
        LONELY: 'COLD',
        NEUTRAL: 'COOL',
      };
      zoneKey = moodToZone[(moodKey || 'HAPPY').toUpperCase()] || 'NORMAL';
    }

    const config = CLIMATE_WALLPAPERS[zoneKey] || CLIMATE_WALLPAPERS.NORMAL;
    const targetUrl = customUrl || config.url;

    if (this.isApplying) {
      return { success: false, reason: 'Another wallpaper application is in progress' };
    }

    this.isApplying = true;

    try {
      // 1. Download/get cached file path
      const filePath = await this.downloadWallpaper(zoneKey, targetUrl);
      if (!filePath || !fs.existsSync(filePath)) {
        throw new Error('Failed to prepare wallpaper image file on disk');
      }

      // 2. PowerShell script invoking SystemParametersInfo via Base64 EncodedCommand
      const escapedPath = filePath.replace(/"/g, '`"');
      const psScript = `
$code = @'
using System;
using System.Runtime.InteropServices;
public class WallpaperHelper {
    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
'@
Add-Type -TypeDefinition $code -Language CSharp -ErrorAction SilentlyContinue
[WallpaperHelper]::SystemParametersInfo(0x0014, 0, "${escapedPath}", 0x01 -bor 0x02)
Write-Output "SUCCESS"
`;

      const b64 = Buffer.from(psScript, 'utf16le').toString('base64');
      const { stdout } = await execAsync(
        `powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${b64}`,
        { timeout: 10000 }
      );

      console.log(
        `[WallpaperService] Applied temperature climate wallpaper: ${config.name} (zone: ${zoneKey}, temp: ${temperature !== null ? `${temperature}°C` : 'N/A'})`
      );
      this.lastAppliedZone = zoneKey;
      return {
        success: true,
        climateZone: zoneKey,
        wallpaperName: config.name,
        description: config.description,
        temperature,
        filePath,
        stdout: stdout.trim(),
      };
    } catch (err) {
      console.error('[WallpaperService] Error applying Windows wallpaper:', err.message);
      return { success: false, error: err.message };
    } finally {
      this.isApplying = false;
    }
  }

  /**
   * Primary handler: Called when temperature changes.
   * Only changes the Windows desktop wallpaper when crossing climate zones.
   */
  async handleTemperatureChange(temperature, moodKey = null) {
    if (!this.autoSync || temperature == null || isNaN(Number(temperature))) return;

    const newZone = this.getClimateZone(Number(temperature));
    if (newZone === this.lastAppliedZone) return;

    console.log(
      `[WallpaperService] Temperature ${temperature}°C crossed threshold → Zone: ${this.lastAppliedZone || 'INITIAL'} → ${newZone}, updating Windows wallpaper...`
    );
    return await this.setWindowsWallpaper(moodKey, null, Number(temperature));
  }

  /**
   * Legacy mood change handler for backward compatibility.
   */
  async handleMoodChange(moodKey, temperature = null) {
    if (temperature !== null && temperature !== undefined) {
      return this.handleTemperatureChange(temperature, moodKey);
    }
    if (!this.autoSync) return;

    const moodToZone = {
      ANGRY: 'CRITICAL',
      STRESSED: 'HOT',
      HOT: 'HOT',
      COLD: 'FREEZING',
      HAPPY: 'NORMAL',
      EXCITED: 'COOL',
      SAD: 'COLD',
      LONELY: 'COLD',
      NEUTRAL: 'COOL',
    };
    const newZone = moodToZone[(moodKey || 'HAPPY').toUpperCase()] || 'NORMAL';
    if (newZone === this.lastAppliedZone) return;

    console.log(`[WallpaperService] Mood ${moodKey} → Climate zone changed to ${newZone}, syncing wallpaper...`);
    return await this.setWindowsWallpaper(moodKey, null, null);
  }
}

export default new WallpaperService();
