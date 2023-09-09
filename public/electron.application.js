const electron = require('electron');
const ElectronWindow = require('./electron.window');

class ElectronApplication {
  static define() {
    return new ElectronApplication();
  }

  #APP_BEFORE_QUIT_EVENT = 'before-quit';
  #APP_WINDOW_ALL_CLOSED_EVENT = 'window-all-closed';
  #APP_ACTIVATE_EVENT = 'activate';
  #APP_READY_EVENT = 'ready';

  #IPC_BEFORE_CLOSE_EVENT = 'ipc:before-close';
  #IPC_BEFORE_QUIT_EVENT = 'ipc:before-quit';

  #app = electron.app;
  #window = null;

  constructor() {
    this.#app.on(this.#APP_BEFORE_QUIT_EVENT, this.#onBeforeQuitApplication.bind(this));
    this.#app.on(this.#APP_WINDOW_ALL_CLOSED_EVENT, this.#onWindowAllClosed.bind(this));
    this.#app.on(this.#APP_ACTIVATE_EVENT, this.#onActivateApplication.bind(this));
    this.#app.on(this.#APP_READY_EVENT, this.#onReadyApplication.bind(this));
  }

  #debug(method, event) {
    console.debug(JSON.stringify({ method, event }, null, 2));
  }

  #onBeforeQuitApplication(e) {
    e.preventDefault();

    this.#debug(this.#onBeforeQuitApplication.name, this.#APP_BEFORE_QUIT_EVENT);

    if (this.#window && this.#window.isDestroyed === false) {
      this.#window.webContents.send(this.#IPC_BEFORE_QUIT_EVENT);
    } else {
      this.#app.exit(0);
    }
  }

  #onWindowAllClosed() {
    this.#debug(this.#onWindowAllClosed.name, this.#APP_WINDOW_ALL_CLOSED_EVENT);

    if (process.platform === 'darwin') {
      if (this.#window) {
        this.#window.webContents.send(this.#IPC_BEFORE_CLOSE_EVENT);
      }
    } else {
      this.#app.quit(0);
    }
  }

  #onActivateApplication() {
    this.#debug(this.#onActivateApplication.name, this.#APP_ACTIVATE_EVENT);

    if (this.#window === null || this.#window.isDestroyed()) {
      this.#window = ElectronWindow.define();
    }
  }

  #onReadyApplication() {
    this.#debug(this.#onReadyApplication.name, this.#APP_READY_EVENT);
    this.#window = ElectronWindow.define();
  }

  destroyWindow(event) {
    this.#debug(this.destroyWindow.name, event);

    if (this.#window) {
      this.#window.destroy();
      this.#window = null;
    }
  }

  exitApplication(event) {
    this.#debug(this.exitApplication.name, event);

    this.#app.exit(0);
  }
}

module.exports = ElectronApplication;
