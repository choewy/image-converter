const { app, BrowserWindow, screen, ipcMain } = require('electron');
const isDevelopment = require('electron-is-dev');
const path = require('path');

let window = null;

const createWindow = () => {
  const size = screen.getPrimaryDisplay().workAreaSize;

  window = new BrowserWindow({
    title: 'Image Converter',
    width: size.width,
    height: size.height,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      devTools: isDevelopment,
    },
  });

  let indexPath;

  if (isDevelopment) {
    window.webContents.openDevTools({ mode: 'detach' });
    indexPath = 'http://localhost:8000';
  } else {
    indexPath = `file://${path.join(__dirname, '../build/index.html')}`;
  }

  window.on('close', (e) => {
    e.preventDefault();

    if (!window) {
      return app.quit(0);
    }

    window.webContents.send('before-close');
  });

  window.loadURL(indexPath);
  window.setMenuBarVisibility(false);
  window.setResizable(true);
  window.focus();
};

ipcMain.on('close', () => {
  window.destroy();
  window = null;
});

ipcMain.on('shutdown', () => {
  app.exit(0);
});

app.on('before-quit', (e) => {
  e.preventDefault();

  if (!window) {
    return app.exit(0);
  }

  window.webContents.send('before-shutdown');
});

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') {
    if (window) {
      window.webContents.send('before-shutdown');
    }

    return;
  }

  app.quit(0);
});

app.on('activate', () => {
  if (window === null) {
    createWindow();
  }
});

app.on('ready', createWindow);
