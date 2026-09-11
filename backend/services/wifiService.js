import si from 'systeminformation';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class WifiService {
  constructor() {
    this.simulation = {
      enabled: false,
      signalStrength: 85,
      connected: true,
      ssid: 'MoodOS-HyperFiber',
    };
    this.lastKnownWifi = {
      ssid: 'Connected Wi-Fi',
      signalStrength: 85,
      connected: true,
      linkSpeed: '433.3 Mbps',
      pingMs: 18,
    };
    this.cache = null;
    this.lastFetchTime = 0;
    this.ttl = 2000; // 2.0 second hardware cache
    this.cachedPingMs = 18;
    this.lastPingCheck = 0;
    this.isPinging = false;
  }

  setSimulation(enabled, signalStrength, connected, ssid) {
    this.simulation.enabled = Boolean(enabled);
    if (signalStrength !== undefined && signalStrength !== null) {
      this.simulation.signalStrength = Math.max(0, Math.min(100, Number(signalStrength)));
    }
    if (connected !== undefined && connected !== null) {
      this.simulation.connected = Boolean(connected);
    }
    if (ssid) {
      this.simulation.ssid = String(ssid);
    }
    this.cache = null;
  }

  // Non-blocking latency refresher
  refreshPingInBackground() {
    const now = Date.now();
    if (this.isPinging || (now - this.lastPingCheck) < 30000) return;
    this.isPinging = true;
    this.lastPingCheck = now;
    si.inetLatency()
      .then((latency) => {
        if (typeof latency === 'number' && latency > 0) {
          this.cachedPingMs = Math.round(latency);
        }
      })
      .catch(() => {})
      .finally(() => {
        this.isPinging = false;
      });
  }

  async getWifiData() {
    const now = Date.now();
    if (this.cache && (now - this.lastFetchTime) < this.ttl) {
      return this.cache;
    }
    if (this.simulation.enabled) {
      const connected = this.simulation.connected && this.simulation.signalStrength > 0;
      const signal = connected ? this.simulation.signalStrength : 0;
      const quality = this.classifySignal(signal, connected);
      return {
        connected,
        ssid: connected ? this.simulation.ssid : 'Disconnected',
        signalStrength: signal,
        quality: quality.label,
        qualityBadge: quality.badge,
        linkSpeed: connected ? '650 Mbps' : '0 Mbps',
        pingMs: connected ? Math.max(12, Math.round(100 - signal * 0.8)) : null,
        isSimulated: true,
      };
    }

    let connected = false;
    let ssid = 'Unknown Network';
    let signalStrength = 75;
    let linkSpeed = 'Unknown';
    let pingMs = this.cachedPingMs;

    try {
      // 1. Try netsh wlan show interfaces on Windows
      const { stdout } = await execAsync('netsh wlan show interfaces', { timeout: 1000 });
      const ssidMatch = stdout.match(/SSID\s*:\s*(.+)/);
      const signalMatch = stdout.match(/Signal\s*:\s*(\d+)%/);
      const stateMatch = stdout.match(/State\s*:\s*(.+)/);
      const rxRateMatch = stdout.match(/Receive rate \(Mbps\)\s*:\s*([\d.]+)/);

      if (stateMatch && stateMatch[1].trim().toLowerCase() === 'connected') {
        connected = true;
        if (ssidMatch && ssidMatch[1].trim()) ssid = ssidMatch[1].trim();
        if (signalMatch) signalStrength = parseInt(signalMatch[1], 10);
        if (rxRateMatch) linkSpeed = `${rxRateMatch[1]} Mbps`;
      }
    } catch {
      // Fallback: check network interfaces via systeminformation
      try {
        const netInterfaces = await si.networkInterfaces();
        const wifiInterface = (Array.isArray(netInterfaces) ? netInterfaces : [netInterfaces]).find(
          (iface) =>
            iface.type?.toLowerCase().includes('wireless') ||
            iface.iface?.toLowerCase().includes('wi-fi') ||
            iface.default
        );

        if (wifiInterface && wifiInterface.operstate === 'up') {
          connected = true;
          ssid = wifiInterface.iface || 'Active Wireless Network';
          linkSpeed = wifiInterface.speed ? `${wifiInterface.speed} Mbps` : '433.3 Mbps';
          signalStrength = this.lastKnownWifi.signalStrength;
        } else {
          // Check default network gateway
          const defaultGateway = await si.networkGatewayDefault();
          if (defaultGateway) {
            connected = true;
            ssid = 'Active Gateway Connection';
          }
        }
      } catch {
        connected = true;
      }
    }

    // Trigger non-blocking background ping refresh
    this.refreshPingInBackground();

    // Dynamic micro-variation for live feel
    const variance = (Math.random() - 0.5) * 4;
    signalStrength = Math.min(100, Math.max(0, Math.round(signalStrength + variance)));

    this.lastKnownWifi = { connected, ssid, signalStrength, linkSpeed, pingMs };
    const quality = this.classifySignal(signalStrength, connected);

    const result = {
      connected,
      ssid,
      signalStrength,
      quality: quality.label,
      qualityBadge: quality.badge,
      linkSpeed,
      pingMs,
      isSimulated: false,
    };
    this.cache = result;
    this.lastFetchTime = Date.now();
    return result;
  }

  classifySignal(signal, connected) {
    if (!connected || signal === 0) {
      return { label: 'Disconnected', badge: '❌ Disconnected' };
    }
    if (signal >= 85) return { label: 'Excellent', badge: '📶 Excellent' };
    if (signal >= 65) return { label: 'Good', badge: '📶 Good' };
    if (signal >= 35) return { label: 'Fair', badge: '⚠️ Weak / Fair' };
    return { label: 'Poor', badge: '🔻 Poor Signal' };
  }
}

export default new WifiService();
