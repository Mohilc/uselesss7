import express from 'express';
import http from 'http';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import systemRoutes from './routes/systemRoutes.js';
import temperatureService from './services/temperatureService.js';
import wifiService from './services/wifiService.js';
import moodService from './services/moodService.js';
import wallpaperService from './services/wallpaperService.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL,
  ].filter(Boolean),
}));
app.use(express.json());

// Mount API routes
app.use('/api', systemRoutes);

// Root healthcheck
app.get('/', (req, res) => {
  res.json({
    name: 'MoodOS System Telemetry Backend',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/docs',
  });
});

const server = http.createServer(app);

// WebSocket Server for real-time live streaming
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', async (ws) => {
  // Send immediate first state
  try {
    const [temperature, wifi] = await Promise.all([
      temperatureService.getTemperatureData(),
      wifiService.getWifiData(),
    ]);
    const mood = moodService.calculateMood(temperature, wifi);
    ws.send(JSON.stringify({ type: 'TELEMETRY_UPDATE', data: { temperature, wifi, mood } }));
  } catch (err) {
    console.error('Initial WS push error:', err.message);
  }

  ws.on('message', (message) => {
    try {
      const payload = JSON.parse(message);
      if (payload.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }
    } catch {
      // ignore
    }
  });
});

// Resilient real-time broadcast loop (self-scheduling to prevent overlapping executions)
let isBroadcasting = false;
let broadcastTimer = null;
let isStopped = false;

const runBroadcast = async () => {
  if (isStopped) return;

  if (wss.clients.size > 0 && !isBroadcasting) {
    isBroadcasting = true;
    try {
      const [temperature, wifi] = await Promise.all([
        temperatureService.getTemperatureData(),
        wifiService.getWifiData(),
      ]);
      const mood = moodService.calculateMood(temperature, wifi);

      const message = JSON.stringify({
        type: 'TELEMETRY_UPDATE',
        data: {
          timestamp: Date.now(),
          temperature,
          wifi,
          mood,
        },
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });

      // Automatically sync Windows desktop wallpaper based on temperature climate zone
      if (mood && mood.moodKey) {
        const currentTemp = temperature?.temperature ?? null;
        wallpaperService.handleMoodChange(mood.moodKey, currentTemp).catch(() => {});
      }
    } catch (err) {
      // broadcast cycle error
    } finally {
      isBroadcasting = false;
    }
  }

  if (!isStopped) {
    broadcastTimer = setTimeout(runBroadcast, 1500);
    if (broadcastTimer && broadcastTimer.unref) {
      broadcastTimer.unref();
    }
  }
};

broadcastTimer = setTimeout(runBroadcast, 1500);
if (broadcastTimer && broadcastTimer.unref) {
  broadcastTimer.unref();
}

// Compatibility wrapper for Jest test cleanup (clearInterval(broadcastInterval))
const broadcastInterval = {
  stop: () => {
    isStopped = true;
    clearTimeout(broadcastTimer);
  },
  unref: () => {
    if (broadcastTimer?.unref) broadcastTimer.unref();
  },
};

// Intercept clearInterval so existing tests cleanly stop the loop
const originalClearInterval = global.clearInterval;
global.clearInterval = (target) => {
  if (target === broadcastInterval) {
    broadcastInterval.stop();
    return;
  }
  return originalClearInterval(target);
};

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`MoodOS Backend running at http://localhost:${PORT}`);
    console.log(`WebSocket Server active at ws://localhost:${PORT}/ws`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  broadcastInterval.stop();
  server.close();
});

export { app, server, broadcastInterval };
