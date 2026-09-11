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
    description: 'Glacial ice fields and frozen aurora skies',
  },
  COLD: {
    name: 'Winter Forest',
    url: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=2560&q=85',
    color: '#0a1929',
    description: 'Snow-blanketed pines under a crisp blue sky',
  },
  COOL: {
    name: 'Misty Peaks',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2560&q=85',
    color: '#0f1b2d',
    description: 'Cool mountain fog rolling through valleys',
  },
  NORMAL: {
    name: 'Golden Meadow',
    url: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=2560&q=85',
    color: '#041f17',
    description: 'Warm sunlight through green rolling hills',
  },
  WARM: {
    name: 'Desert Heat',
    url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=2560&q=85',
    color: '#1f0b03',
    description: 'Amber desert dunes shimmering in heat haze',
  },
  HOT: {
    name: 'Volcanic Fury',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=2560&q=85',
    color: '#1a0508',
    description: 'Molten lava flows and volcanic eruptions',
  },
  CRITICAL: {
    name: 'Inferno',
    url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=2560&q=85',
    color: '#200000',
    description: 'Blazing wildfire consuming everything in sight',
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
    if (temperature <= 30) return 'FREEZING';
    if (temperature <= 44) return 'COLD';
    if (temperature <= 54) return 'COOL';
    if (temperature <= 64) return 'NORMAL';
    if (temperature <= 74) return 'WARM';
    if (temperature <= 84) return 'HOT';
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
   * Downloads image if not already cached and saves as JPEG
   */
  async downloadWallpaper(zoneKey, url) {
    const filePath = path.join(this.cacheDir, `wallpaper_climate_${zoneKey.toLowerCase()}.jpg`);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 5000) {
        return filePath;
      }
    }

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);
      return filePath;
    } catch (err) {
      console.warn(`[WallpaperService] Download failed for climate zone ${zoneKey}:`, err.message);
      return null;
    }
  }

  /**
   * Physically set Windows Desktop Wallpaper using PowerShell and Win32 API.
   * Now accepts temperature to determine the climate zone wallpaper.
   */
  async setWindowsWallpaper(moodKey, customUrl = null, temperature = null) {
    if (process.platform !== 'win32') {
      console.log('[WallpaperService] Non-Windows OS detected, skipping native wallpaper change.');
      return { success: false, reason: 'Platform is not Windows' };
    }

    // Determine climate zone from temperature (primary) or fall back to mood mapping
    let zoneKey;
    if (temperature !== null && temperature !== undefined) {
      zoneKey = this.getClimateZone(temperature);
    } else {
      // Fallback mood → zone mapping for backward compat
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

      // 2. PowerShell script invoking SystemParametersInfo
      const normalizedPath = filePath.replace(/\\/g, '\\\\');
      const psScript = `
$code = @'
using System;
using System.Runtime.InteropServices;
public class Wallpaper {
    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
    public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
'@
Add-Type -TypeDefinition $code
$result = [Wallpaper]::SystemParametersInfo(0x0014, 0, "${normalizedPath}", 0x01 -bor 0x02)
Write-Output $result
`;

      const { stdout } = await execAsync(`powershell -NoProfile -Command "${psScript.replace(/\r?\n/g, ' ')}"`, {
        timeout: 10000,
      });

      console.log(`[WallpaperService] Applied climate wallpaper: ${config.name} (zone: ${zoneKey}, temp: ${temperature}°C)`);
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
   * Called on telemetry update; updates wallpaper based on temperature climate zone.
   * Only changes wallpaper when the climate zone actually changes.
   */
  async handleMoodChange(moodKey, temperature = null) {
    if (!this.autoSync) return;

    let newZone;
    if (temperature !== null && temperature !== undefined) {
      newZone = this.getClimateZone(temperature);
    } else {
      // Can't determine zone without temperature, skip
      return;
    }

    if (newZone === this.lastAppliedZone) return;

    console.log(`[WallpaperService] Temperature ${temperature}°C → Climate zone changed to ${newZone}, syncing wallpaper...`);
    await this.setWindowsWallpaper(moodKey, null, temperature);
  }
}

export default new WallpaperService();
