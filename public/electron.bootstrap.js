const electron = require('electron');
const application = require('./electron.application').define();

class ElectronBootstrap {
  static run() {
    return new ElectronBootstrap(application);
  }

  #IPC_CLOSE_EVENT = 'ipc:close';
  #IPC_QUIT_EVENT = 'ipc:quit';

  #application;
  #ipc = electron.ipcMain;

  constructor(application) {
    this.#application = application;
    this.#ipc.on(this.#IPC_CLOSE_EVENT, this.#onIpcCloseWindow.bind(this));
    this.#ipc.on(this.#IPC_QUIT_EVENT, this.#onIpcQuitApplication.bind(this));
  }

  #debug(method, event) {
    console.debug(JSON.stringify({ method, event }, null, 2));
  }

  #onIpcCloseWindow() {
    this.#debug(this.#onIpcCloseWindow.name, this.#IPC_CLOSE_EVENT);
    this.#application.destroyWindow(this.#IPC_CLOSE_EVENT);
  }

  #onIpcQuitApplication() {
    this.#debug(this.#onIpcQuitApplication.name, this.#IPC_QUIT_EVENT);
    this.#application.exitApplication(this.#IPC_QUIT_EVENT);
  }
}

module.exports = ElectronBootstrap;
