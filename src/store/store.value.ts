import {
  TranscodeFileStoreImpl,
  TranscodeFile,
  TranscodeWorker,
  TranscodeWorkerStoreImpl,
  transcodeStorage,
} from '@/core';

export class FileListStoreValue implements TranscodeFileStoreImpl {
  selectFiles: TranscodeFile[];
  transcodingFiles: TranscodeFile[];
  completeFiles: TranscodeFile[];

  public static of() {
    return new FileListStoreValue();
  }

  constructor() {
    this.selectFiles = [];
    this.transcodingFiles = [];
    this.completeFiles = [];
  }
}

export class WorkerStoreValue implements TranscodeWorkerStoreImpl {
  running: boolean = false;
  workers: TranscodeWorker[] = [];

  public static of() {
    return new WorkerStoreValue();
  }

  constructor() {
    const keys = transcodeStorage.getKeys();
    const activeLimit = transcodeStorage.getDefaultLimit();

    for (let i = 0; i < keys.length; i++) {
      this.workers.push(TranscodeWorker.of(keys[i], i + 1, activeLimit));
    }
  }
}
