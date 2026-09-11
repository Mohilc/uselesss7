import os from 'os';
import si from 'systeminformation';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// PowerShell command to read REAL hardware thermal zone temperature (works without admin on Windows 10/11)
const PS_THERMAL_CMD = `powershell -NoProfile -Command "Get-CimInstance -ClassName Win32_PerfFormattedData_Counters_ThermalZoneInformation -ErrorAction Stop | Where-Object { $_.Temperature -gt 273 } | Sort-Object Temperature -Descending | Select-Object -First 1 -ExpandProperty Temperature"`;

class TemperatureService {
  constructor() {
    this.history = [];
    this.maxHistory = 60;
    this.simulation = {
      enabled: false,
      temperature: 55,
    };
    this.thresholds = {
      cold: 45,
      warm: 65,
      hot: 75,
      critical: 85,
    };
    this.lastTemp = 48.0;
    this.sensorMethod = 'initializing';
    this.cache = null;
    this.lastFetchTime = 0;
    this.cacheTTL = 1800; // 1.8s cache
    this.thermalZoneSupported = null; // null: unknown, true: supported, false: unsupported
    this.thermalZoneLastChecked = 0;
    this.thermalZoneFailCount = 0;
    this.siTempSupported = null;
    this.prevCpus = os.cpus();
  }

  getNativeCpuLoad() {
    try {
      const currentCpus = os.cpus();
      if (!this.prevCpus || this.prevCpus.length === 0) {
        this.prevCpus = currentCpus;
        return 15;
      }
      let totalIdle = 0;
      let totalTick = 0;
      for (let i = 0; i < currentCpus.length; i++) {
        const prev = this.prevCpus[i];
        const curr = currentCpus[i];
        if (!prev || !curr) continue;
        const prevTotal = Object.values(prev.times).reduce((a, b) => a + b, 0);
        const currTotal = Object.values(curr.times).reduce((a, b) => a + b, 0);
        totalTick += (currTotal - prevTotal);
        totalIdle += (curr.times.idle - prev.times.idle);
      }
      this.prevCpus = currentCpus;
      if (totalTick <= 0) return 15;
      const load = (1 - (totalIdle / totalTick)) * 100;
      return Math.max(0, Math.min(100, load));
    } catch {
      return 15;
    }
  }

  setThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  setSimulation(enabled, temperature) {
    this.simulation.enabled = Boolean(enabled);
    if (temperature !== undefined && temperature !== null) {
      this.simulation.temperature = Math.max(20, Math.min(110, Number(temperature)));
    }
    this.cache = null; // Bust cache on simulation change
  }

  /**
   * Try to read REAL hardware temperature from Windows thermal zone counters.
   * With capability detection and 120s backoff so unsupported systems aren't constantly spawning PowerShell.
   */
  async readWindowsThermalZone() {
    const now = Date.now();
    // If determined unsupported, back off for 120 seconds before testing again
    if (this.thermalZoneSupported === false && (now - this.thermalZoneLastChecked) < 120000) {
      return null;
    }

    try {
      this.thermalZoneLastChecked = now;
      const { stdout } = await execAsync(PS_THERMAL_CMD, { timeout: 2000 });
      const kelvin = parseFloat(stdout.trim());
      if (!isNaN(kelvin) && kelvin > 273) {
        const celsius = parseFloat((kelvin - 273.15).toFixed(1));
        if (celsius > 0 && celsius < 120) {
          this.thermalZoneSupported = true;
          this.thermalZoneFailCount = 0;
          return celsius;
        }
      }
    } catch {
      // PowerShell failed or timed out
    }

    this.thermalZoneFailCount++;
    if (this.thermalZoneFailCount >= 2) {
      this.thermalZoneSupported = false;
    }
    return null;
  }

  async getTemperatureData() {
    // Return cached data if within TTL
    const now = Date.now();
    if (this.cache && !this.simulation.enabled && (now - this.lastFetchTime) < this.cacheTTL) {
      return this.cache;
    }

    let currentTemp = 50.0;
    let isSimulated = this.simulation.enabled;
    let hardwareSensorsAvailable = false;

    if (this.simulation.enabled) {
      // Simulation mode with subtle micro-jitter for realism
      const jitter = (Math.random() - 0.5) * 0.6;
      currentTemp = parseFloat((this.simulation.temperature + jitter).toFixed(1));
      this.sensorMethod = 'simulation';
    } else {
      // === STRATEGY 1: Windows Thermal Zone Counters (REAL hardware, no admin needed) ===
      const thermalZoneTemp = await this.readWindowsThermalZone();
      if (thermalZoneTemp !== null) {
        currentTemp = thermalZoneTemp;
        hardwareSensorsAvailable = true;
        this.sensorMethod = 'Windows Thermal Zone (Real Hardware Sensor)';
      } else if (this.siTempSupported !== false) {
        // === STRATEGY 2: systeminformation ACPI (probe once, avoid repeating 780ms WMI calls) ===
        try {
          const cpuTemp = await si.cpuTemperature();
          if (cpuTemp && cpuTemp.main && cpuTemp.main > 0) {
            currentTemp = parseFloat(cpuTemp.main.toFixed(1));
            hardwareSensorsAvailable = true;
            this.sensorMethod = 'systeminformation ACPI';
            this.siTempSupported = true;
          } else {
            this.siTempSupported = false;
          }
        } catch {
          this.siTempSupported = false;
        }
      }

      // === STRATEGY 3: Instantaneous Native CPU Load Estimation (0ms latency, zero WMI lag) ===
      if (!hardwareSensorsAvailable) {
        const cpuLoad = this.getNativeCpuLoad();
        // Model: idle ~42°C, full load ~85°C, with smooth moving average
        const estimated = 42 + (cpuLoad * 0.43) + ((Math.random() - 0.5) * 0.8);
        this.lastTemp = (this.lastTemp * 0.7) + (estimated * 0.3);
        currentTemp = parseFloat(this.lastTemp.toFixed(1));
        this.sensorMethod = 'CPU Load Estimation (no hardware sensor access)';
      }
    }

    // Determine status
    let status = 'Normal';
    let statusEmoji = '🟢';
    if (currentTemp >= this.thresholds.critical) {
      status = 'Critical';
      statusEmoji = '🚨';
    } else if (currentTemp >= this.thresholds.hot) {
      status = 'Hot';
      statusEmoji = '🔥';
    } else if (currentTemp >= this.thresholds.warm) {
      status = 'Warm';
      statusEmoji = '🌡️';
    } else if (currentTemp <= this.thresholds.cold) {
      status = 'Cold';
      statusEmoji = '❄️';
    }

    // History for trend prediction
    this.history.push({
      timestamp: Date.now(),
      temperature: currentTemp,
    });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    const trend = this.calculateTrend();
    const overheatingRisk = this.predictOverheating(currentTemp, trend);

    const result = {
      temperature: currentTemp,
      unit: '°C',
      status,
      statusEmoji,
      isSimulated,
      hardwareSensorsAvailable,
      sensorMethod: this.sensorMethod,
      thresholds: this.thresholds,
      trend,
      overheatingRisk,
    };

    // Cache the result
    this.cache = result;
    this.lastFetchTime = Date.now();

    return result;
  }

  calculateTrend() {
    if (this.history.length < 5) return { direction: 'stable', ratePerMinute: 0 };
    const recent = this.history.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const timeDiffMinutes = (last.timestamp - first.timestamp) / 60000;
    if (timeDiffMinutes <= 0) return { direction: 'stable', ratePerMinute: 0 };

    const rate = parseFloat(((last.temperature - first.temperature) / timeDiffMinutes).toFixed(2));
    let direction = 'stable';
    if (rate > 1.5) direction = 'rising_fast';
    else if (rate > 0.5) direction = 'rising';
    else if (rate < -1.5) direction = 'falling_fast';
    else if (rate < -0.5) direction = 'falling';

    return { direction, ratePerMinute: rate };
  }

  predictOverheating(currentTemp, trend) {
    if (currentTemp >= this.thresholds.critical) {
      return {
        warning: true,
        level: 'CRITICAL',
        message: 'CPU has reached critical thermal threshold! Throttling likely.',
      };
    }
    if (currentTemp >= this.thresholds.hot && trend.ratePerMinute > 0.8) {
      return {
        warning: true,
        level: 'HIGH',
        message: 'Temperature is rising rapidly toward critical levels.',
      };
    }
    if (currentTemp >= this.thresholds.warm && trend.ratePerMinute > 2.0) {
      return {
        warning: true,
        level: 'MODERATE',
        message: 'Sudden heat spike detected.',
      };
    }
    return {
      warning: false,
      level: 'LOW',
      message: 'Thermals operating within normal parameters.',
    };
  }
}

export default new TemperatureService();
