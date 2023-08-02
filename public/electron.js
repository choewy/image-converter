const { app, BrowserWindow } = require('electron');

const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static-electron');
const ffprobStatic = require('ffprobe-static-electron');

const dev = require('electron-is-dev');

ffmpeg.setFfmpegPath(ffmpegStatic.path);
ffmpeg.setFfprobePath(ffprobStatic.path);

let window = null;

const createWindow = () => {
  window = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      devTools: dev,
    },
  });

  window.loadURL(dev ? 'http://localhost:8000' : `file://${path.join(__dirname, '../build/index.html')}`);

  if (dev) {
    window.webContents.openDevTools({ mode: 'detach' });
  }

  window.setResizable(true);
  window.on('closed', () => (window = null));
  window.focus();
};

app.on('ready', createWindow);
app.on('window-all-closed', app.quit);
app.on('ready', () => {
  if (window === null) {
    createWindow();
  }
});
