import { IpcRenderer } from 'electron';

import { module, TranscodeStorage, transcodeStorage } from './core';

export class IpcController {
  public static define() {
    return new IpcController(module.getIpc(), transcodeStorage);
  }

  private readonly IPC_BEFORE_CLOSE_EVENT = 'ipc:before-close';
  private readonly IPC_BEFORE_QUIT_EVENT = 'ipc:before-quit';
  private readonly IPC_CLOSE_EVENT = 'ipc:close';
  private readonly IPC_QUIT_EVENT = 'ipc:quit';

  constructor(private readonly ipc: IpcRenderer, private readonly transcodeStorage: TranscodeStorage) {
    this.ipc.on(this.IPC_BEFORE_CLOSE_EVENT, this.beforeClose.bind(this));
    this.ipc.on(this.IPC_BEFORE_QUIT_EVENT, this.beforeQuit.bind(this));
  }

  private beforeClose(): void {
    this.transcodeStorage.beforeShutdown();

    this.ipc.send(this.IPC_CLOSE_EVENT);
  }

  private beforeQuit(): void {
    this.transcodeStorage.beforeShutdown();

    this.ipc.send(this.IPC_QUIT_EVENT);
  }
}
