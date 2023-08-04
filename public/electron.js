const { app, BrowserWindow, screen } = require('electron');
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

  window.loadURL(indexPath);
  window.setMenuBarVisibility(false);
  window.setResizable(true);
  window.focus();

  window.on('closed', () => {
    window = null;
  });
};

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform === 'darwin') {
    return;
  }

  app.quit();
});

app.on('activate', () => {
  if (window === null) {
    createWindow();
  }
});
