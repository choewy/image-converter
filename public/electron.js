const { app, BrowserWindow, screen, ipcMain } = require('electron');
const isDevelopment = require('electron-is-dev');
const path = require('path');

const IPC_CLOSE_EVENT = 'ipc:close';
const IPC_QUIT_EVENT = 'ipc:quit';

const IPC_BEFORE_CLOSE_EVENT = 'ipc:before-close';
const IPC_BEFORE_QUIT_EVENT = 'ipc:before-quit';

const WINDOW_CLOSE_EVENT = 'close';

const APP_BEFORE_QUIT_EVENT = 'before-quit';
const APP_ALL_CLOSE_EVENT = 'window-all-closed';
const APP_ACTIVATE_EVENT = 'activate';
const APP_READY_EVENT = 'ready';

/**
 * @description close event(before kill ffmpeg processes)
 * @win not applicable
 * @mac detroy window(cmd + w)
 */
ipcMain.on(IPC_CLOSE_EVENT, () => {
  console.log(IPC_CLOSE_EVENT);

  window.destroy();
  window = null;
});

/**
 * @description quit event(before kill ffmpeg processes)
 * @win not applicable
 * @mac detroy window(cmd + q)
 */
ipcMain.on(IPC_QUIT_EVENT, () => {
  console.log(IPC_QUIT_EVENT);

  app.exit(0);
});

let window = null;

/**
 * @description create window
 */
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

  /**
   * @description close event(default prevented)
   * @win quit application immediately
   * @mac send before-close event to react app(for kill ffmpeg processes)
   */
  window.on(WINDOW_CLOSE_EVENT, (e) => {
    e.preventDefault();

    console.log(WINDOW_CLOSE_EVENT);

    if (!window) {
      return app.quit(0);
    }

    window.webContents.send(IPC_BEFORE_CLOSE_EVENT);
  });

  window.loadURL(indexPath);
  window.setMenuBarVisibility(false);
  window.setResizable(true);
  window.focus();
};

app.on(APP_BEFORE_QUIT_EVENT, (e) => {
  e.preventDefault();

  console.log(APP_BEFORE_QUIT_EVENT);

  if (window && window.isDestroyed === false) {
    window.webContents.send(IPC_BEFORE_QUIT_EVENT);

    return;
  }

  return app.exit(0);
});

app.on(APP_ALL_CLOSE_EVENT, () => {
  console.log(APP_ALL_CLOSE_EVENT);

  if (process.platform === 'darwin') {
    if (window) {
      window.webContents.send(IPC_BEFORE_CLOSE_EVENT);
    }

    return;
  }

  app.quit(0);
});

app.on(APP_ACTIVATE_EVENT, () => {
  console.log(APP_ACTIVATE_EVENT);

  createWindow();
});

app.on(APP_READY_EVENT, createWindow);
