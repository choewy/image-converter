const path = require('path');
const electron = require('electron');
const development = require('electron-is-dev');

class ElectronWindow extends electron.BrowserWindow {
  static define() {
    return new ElectronWindow();
  }

  #WINDOW_CLOSE_EVENT = 'close';
  #IPC_BEFORE_CLOSE_EVENT = 'ipc:before-close';

  constructor() {
    const title = 'Image Converter';
    const size = electron.screen.getPrimaryDisplay().workAreaSize;

    super({
      title,
      width: size.width,
      height: size.height,
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false,
        devTools: development,
      },
    });

    this.#initialize();
  }

  #debug(method, event) {
    console.debug(JSON.stringify({ method, event }, null, 2));
  }

  #initialize() {
    let index;

    if (development) {
      index = 'http://localhost:8000';
      this.webContents.openDevTools({ mode: 'detach' });
    } else {
      index = `file://${path.join(__dirname, '../build/index.html')}`;
    }

    this.on(this.#WINDOW_CLOSE_EVENT, this.#onCloseWindow.bind(this));
    this.loadURL(index);
    this.setMenuBarVisibility(false);
    this.setResizable(true);
    this.focus();
  }

  #onCloseWindow(e) {
    e.preventDefault();

    this.#debug(this.#onCloseWindow.name, this.#WINDOW_CLOSE_EVENT);
    this.webContents.send(this.#IPC_BEFORE_CLOSE_EVENT);
  }
}

module.exports = ElectronWindow;
