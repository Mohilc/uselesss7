const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,

  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // Mode switcher: 'dashboard' | 'widget' | 'overlay'
  setWindowMode: (mode) => ipcRenderer.invoke('set-window-mode', mode),
  getWindowMode: () => ipcRenderer.invoke('get-window-mode'),

  // Floating behavior
  setAlwaysOnTop: (flag) => ipcRenderer.send('set-always-on-top', flag),

  // Click-through for weather overlay
  setIgnoreMouseEvents: (ignore, options) =>
    ipcRenderer.send('set-ignore-mouse-events', ignore, options),

  // Windows Wallpaper trigger from Electron
  applyWindowsWallpaper: (moodKey, url) =>
    ipcRenderer.invoke('apply-windows-wallpaper', { moodKey, url }),

  // Listen to events from main process (e.g. tray menu actions)
  onModeChange: (callback) => {
    const handler = (_event, mode) => callback(mode);
    ipcRenderer.on('mode-changed', handler);
    return () => ipcRenderer.removeListener('mode-changed', handler);
  },
});
