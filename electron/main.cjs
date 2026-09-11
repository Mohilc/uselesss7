const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow = null;
let tray = null;
let currentMode = 'dashboard'; // 'dashboard' | 'widget' | 'overlay'
let lastNormalBounds = { width: 1260, height: 820, x: null, y: null };

// Create a stylish 32x32 circular icon buffer for Tray
function createTrayIcon() {
  // Simple 16x16 RGBA buffer: emerald dot with dark outline
  const size = 16;
  const buffer = Buffer.alloc(size * size * 4);
  const center = size / 2;
  const radius = 6;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dist = Math.sqrt((x - center + 0.5) ** 2 + (y - center + 0.5) ** 2);
      if (dist <= radius) {
        // Emerald green (#10b981)
        buffer[idx] = 16; // R
        buffer[idx + 1] = 185; // G
        buffer[idx + 2] = 129; // B
        buffer[idx + 3] = 255; // Alpha
      } else {
        buffer[idx + 3] = 0; // transparent
      }
    }
  }
  return nativeImage.createFromBuffer(buffer, { width: size, height: size });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1260,
    height: 820,
    minWidth: 320,
    minHeight: 120,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: true,
    show: false,
    icon: createTrayIcon(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
    },
  });

  const devUrl = 'http://localhost:3000';
  const prodUrl = 'http://localhost:5000';

  const loadApp = () => {
    mainWindow.loadURL(devUrl).catch(() => {
      // Fallback to prod backend port if Vite dev server isn't running
      mainWindow.loadURL(prodUrl).catch((err) => {
        console.warn('Waiting for server...', err.message);
        setTimeout(loadApp, 1500);
      });
    });
  };

  loadApp();

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Tray setup
  setupTray();
}

function setupTray() {
  if (tray) return;

  tray = new Tray(createTrayIcon());
  tray.setToolTip('MoodOS — Laptop MoodSwing System');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '🖥️ Full Dashboard',
      click: () => applyWindowMode('dashboard'),
    },
    {
      label: '🪟 Floating Screen Widget',
      click: () => applyWindowMode('widget'),
    },
    {
      label: '🌧️ Screen Weather Overlay',
      click: () => applyWindowMode('overlay'),
    },
    { type: 'separator' },
    {
      label: '🔄 Toggle Windows Wallpaper Sync',
      click: () => toggleWallpaperSync(),
    },
    { type: 'separator' },
    {
      label: '❌ Exit MoodOS',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

function toggleWallpaperSync() {
  const req = http.request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/wallpaper/auto-sync',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    (res) => {
      console.log(`[Tray] Wallpaper sync toggled: ${res.statusCode}`);
    }
  );
  req.on('error', () => {});
  req.write(JSON.stringify({ enabled: true }));
  req.end();
}

function applyWindowMode(mode) {
  if (!mainWindow) return;

  const primaryDisplay = screen.getPrimaryDisplay();
  const { workArea, bounds } = primaryDisplay;

  currentMode = mode;

  if (mode === 'widget') {
    // Save normal bounds before shrinking
    if (!mainWindow.isAlwaysOnTop()) {
      const b = mainWindow.getBounds();
      lastNormalBounds = { width: b.width, height: b.height, x: b.x, y: b.y };
    }

    const widgetWidth = 350;
    const widgetHeight = 140;
    // Position at bottom-right of work area (above taskbar)
    const targetX = workArea.x + workArea.width - widgetWidth - 24;
    const targetY = workArea.y + workArea.height - widgetHeight - 24;

    mainWindow.setResizable(true);
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.setBounds({
      x: Math.round(targetX),
      y: Math.round(targetY),
      width: widgetWidth,
      height: widgetHeight,
    });
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    mainWindow.setResizable(false);
    mainWindow.focus();
  } else if (mode === 'overlay') {
    // Fullscreen transparent weather over user's Windows screen
    mainWindow.setResizable(true);
    mainWindow.setBounds(bounds);
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    // Enable click-through so user can click other apps on screen!
    mainWindow.setIgnoreMouseEvents(true, { forward: true });
  } else {
    // Default 'dashboard'
    mainWindow.setIgnoreMouseEvents(false);
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setResizable(true);

    const w = lastNormalBounds.width || 1260;
    const h = lastNormalBounds.height || 820;
    mainWindow.setSize(w, h);
    if (lastNormalBounds.x != null && lastNormalBounds.y != null) {
      mainWindow.setPosition(lastNormalBounds.x, lastNormalBounds.y);
    } else {
      mainWindow.center();
    }
    mainWindow.focus();
  }

  mainWindow.webContents.send('mode-changed', mode);
}

// IPC Handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.handle('set-window-mode', (_event, mode) => {
  applyWindowMode(mode);
  return { currentMode };
});

ipcMain.handle('get-window-mode', () => {
  return currentMode;
});

ipcMain.on('set-always-on-top', (_event, flag) => {
  if (mainWindow) mainWindow.setAlwaysOnTop(Boolean(flag));
});

ipcMain.on('set-ignore-mouse-events', (_event, ignore, options) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(Boolean(ignore), options || { forward: true });
  }
});

ipcMain.handle('apply-windows-wallpaper', async (_event, { moodKey, url }) => {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ mood: moodKey, url });
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/wallpaper/apply',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve({ success: false, raw: body });
          }
        });
      }
    );
    req.on('error', (err) => resolve({ success: false, error: err.message }));
    req.write(postData);
    req.end();
  });
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
