import { v4 } from 'uuid';
import { FfmpegCommand } from 'fluent-ffmpeg';

import { FfmpegWorkerStatus } from './enums';

export class FfmpegFile {
  public static of(file: File) {
    const f = file as File & { path: string };

    return new FfmpegFile(f.name, f.path);
  }

  readonly key = v4();

  name: string;
  path: string;

  hasSound: boolean = false;
  frames: number | null = null;
  error: any | null = null;
  hasError: boolean = false;
  progress: number = 0;
  command: FfmpegCommand | null = null;

  constructor(name: string, path: string) {
    this.name = name;
    this.path = path;
  }

  public dupliate(): FfmpegFile {
    return Object.assign({}, this);
  }
}

export class FfmpegWorker {
  public static of(activeRange: number, currentIndex: number) {
    return new FfmpegWorker(activeRange < currentIndex);
  }

  readonly key = v4();

  file: FfmpegFile | null = null;
  status: FfmpegWorkerStatus = FfmpegWorkerStatus.WAITING;
  disabled: boolean;

  constructor(disabled = false) {
    this.disabled = disabled;
  }

  public isWaiting(): boolean {
    return [FfmpegWorkerStatus.WAITING].includes(this.status);
  }

  public isPaused(): boolean {
    return [FfmpegWorkerStatus.PAUSED].includes(this.status);
  }

  public isRunning(): boolean {
    return [FfmpegWorkerStatus.RUNNING].includes(this.status);
  }

  public dupliate(): FfmpegWorker {
    return Object.assign({}, this);
  }

  public setFile(file?: FfmpegFile): FfmpegWorker {
    const worker = this.dupliate();

    worker.file = file || null;

    return worker;
  }

  public setDisable(val: boolean): FfmpegWorker {
    const worker = this.dupliate();

    worker.disabled = val;

    return worker;
  }

  public setStatus(status: FfmpegWorkerStatus): FfmpegWorker {
    const worker = this.dupliate();

    worker.status = status;

    return worker;
  }

  public stop(): void {
    if (this.status === FfmpegWorkerStatus.WAITING || !this.file || !this.file.command) {
      return;
    }

    this.file.command.kill('SIGKILL');
  }
}
