import { FfmpegFile, FfmpegWorker, module } from '@/core';

export class FileListStoreValue {
  selectFiles: FfmpegFile[];
  transcodingFiles: FfmpegFile[];
  completeFiles: FfmpegFile[];

  public static of() {
    return new FileListStoreValue();
  }

  constructor() {
    this.selectFiles = [];
    this.transcodingFiles = [];
    this.completeFiles = [];
  }
}

export class WorkerStoreValue {
  running: boolean;
  workers: FfmpegWorker[];

  public static of() {
    return new WorkerStoreValue();
  }

  constructor() {
    const os = module.getOs();
    const cpuCount = os.cpus().length;
    const workerCount = cpuCount > 1 ? cpuCount - 1 : 1;
    const activeRange = workerCount === 1 ? 1 : Math.floor(workerCount / 2);

    this.running = false;

    this.workers = [];

    for (let i = 1; i <= workerCount; i++) {
      this.workers.push(FfmpegWorker.of(activeRange, i));
    }
  }
}
