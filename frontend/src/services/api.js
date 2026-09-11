const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const fetchSystemData = async () => {
  const res = await fetch(`${API_BASE}/system`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const fetchTemperature = async () => {
  const res = await fetch(`${API_BASE}/temperature`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const fetchWifi = async () => {
  const res = await fetch(`${API_BASE}/wifi`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const fetchMood = async () => {
  const res = await fetch(`${API_BASE}/mood`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const fetchStatus = async () => {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const fetchHistory = async () => {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const setSimulation = async (settings) => {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const setPersonality = async (personality) => {
  const res = await fetch(`${API_BASE}/personality`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personality }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const updateThresholds = async (thresholds) => {
  const res = await fetch(`${API_BASE}/thresholds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ thresholds }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const fetchApiDocs = async () => {
  const res = await fetch(`${API_BASE}/docs`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const applyWindowsWallpaper = async (mood, url, temperature) => {
  const res = await fetch(`${API_BASE}/wallpaper/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mood, url, temperature }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const setWallpaperAutoSync = async (enabled) => {
  const res = await fetch(`${API_BASE}/wallpaper/auto-sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

export const fetchWallpaperStatus = async () => {
  const res = await fetch(`${API_BASE}/wallpaper/status`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

/**
 * Creates resilient WebSocket connection that automatically recovers
 */
export const connectTelemetryStream = (onMessage, onStatusChange) => {
  const backendUrl = import.meta.env.VITE_API_URL;
  let wsUrl;
  if (backendUrl) {
    // Production: derive WS URL from the backend URL
    const url = new URL(backendUrl);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    wsUrl = `${protocol}//${url.host}/ws`;
  } else {
    // Dev: connect to local backend
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    wsUrl = `${protocol}//localhost:5000/ws`;
  }

  let ws = null;
  let reconnectTimeout = null;
  let isUnmounted = false;

  const connect = () => {
    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (onStatusChange) onStatusChange('connected');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'TELEMETRY_UPDATE') {
            onMessage(payload.data);
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        if (onStatusChange) onStatusChange('error');
      };

      ws.onclose = () => {
        if (onStatusChange) onStatusChange('disconnected');
        if (!isUnmounted) {
          reconnectTimeout = setTimeout(connect, 3000);
        }
      };
    } catch {
      if (!isUnmounted) {
        reconnectTimeout = setTimeout(connect, 3000);
      }
    }
  };

  connect();

  return () => {
    isUnmounted = true;
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
    if (ws) ws.close();
  };
};
