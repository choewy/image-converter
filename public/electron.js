const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(require('ffmpeg-static-electron').path);
ffmpeg.setFfprobePath(require('ffprobe-static-electron').path);

const { app, BrowserWindow } = require('electron');

const path = require('path');

const devTools = require('electron-is-dev');

const createWindow = () => {
  const window = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      devTools,
    },
  });

  window.loadURL(devTools ? 'http://localhost:8000' : `file://${path.join(__dirname, '../build/index.html')}`);

  if (devTools) {
    window.webContents.openDevTools({ mode: 'detach' });
  }

  window.setResizable(true);
  window.on('closed', () => (window = null));
  window.focus();
};

app.on('ready', createWindow);
app.on('window-all-closed', app.quit);
