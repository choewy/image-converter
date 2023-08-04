import { v4 } from 'uuid';
import { FfmpegCommand } from 'fluent-ffmpeg';
import { plainToInstance } from 'class-transformer';

import { FfmpegStatus } from './enums';
import { SetterOrUpdater } from 'recoil';
import { FfmpegFileStoreImpl, FfmpegWorkerStoreImpl } from './interfaces';
import { ffmpegService } from './ffmpeg.service';

const WAIT_MIN_TIME = 600;
const WAIT_MAX_TIME = 3000;

export class FfmpegFile {
  public static of(file: File) {
    const f = file as File & { path: string };

    return new FfmpegFile(f.name, f.path);
  }

  readonly key = v4();

  name: string;
  path: string;
  savePath: string | null = null;
  hasSound: boolean = false;
  frames: number | null = null;
  error: any | null = null;
  hasError: boolean = false;
  command: FfmpegCommand | null = null;
  status: FfmpegStatus = FfmpegStatus.WAITING;

  constructor(name: string, path: string) {
    this.name = name;
    this.path = path;
  }

  public dupliate(): FfmpegFile {
    return plainToInstance(FfmpegFile, this);
  }

  public setStatus(status: FfmpegStatus) {
    const file = this.dupliate();

    file.status = status;

    return file;
  }

  public setName(name: string) {
    const file = this.dupliate();

    file.name = name;

    return file;
  }

  public setSavePath(savePath: string) {
    const file = this.dupliate();

    file.savePath = savePath;

    return file;
  }

  public setError(e?: any) {
    const file = this.dupliate();

    file.error = e;
    file.hasError = !!e;
    file.command = null;

    return file;
  }
}

export class FfmpegWorker {
  public static of(activeRange: number, currentIndex: number) {
    return new FfmpegWorker(activeRange, currentIndex);
  }

  readonly key: string;

  file: FfmpegFile | null = null;
  status: FfmpegStatus = FfmpegStatus.WAITING;
  progress: number = 0;
  disabled: boolean;
  timer: NodeJS.Timer | null = null;

  constructor(activeRange: number, currentIndex: number) {
    this.key = `WORKER #${currentIndex}`;
    this.disabled = activeRange < currentIndex;
  }

  public isWaiting(): boolean {
    return [FfmpegStatus.WAITING].includes(this.status);
  }

  public isPaused(): boolean {
    return [FfmpegStatus.PAUSED].includes(this.status);
  }

  public isRunning(): boolean {
    return [FfmpegStatus.RUNNING].includes(this.status);
  }

  public dupliate(): FfmpegWorker {
    return plainToInstance(FfmpegWorker, this);
  }

  public setFile(file: FfmpegFile | null): FfmpegWorker {
    const worker = this.dupliate();

    worker.file = file;

    if (!file) {
      worker.file = null;
      worker.progress = 0;
      worker.status = FfmpegStatus.WAITING;
    }

    return worker;
  }

  public setProgress(progress: number) {
    const worker = this.dupliate();

    worker.progress = progress;

    return worker;
  }

  public setDisable(val: boolean): FfmpegWorker {
    const worker = this.dupliate();

    worker.disabled = val;

    return worker;
  }

  public setStatus(status: FfmpegStatus): FfmpegWorker {
    const worker = this.dupliate();

    worker.status = status;

    return worker;
  }

  public run(setWorkers: SetterOrUpdater<FfmpegWorkerStoreImpl>, setFiles: SetterOrUpdater<FfmpegFileStoreImpl>) {
    if (!this.file) {
      return;
    }

    const onProgress = (progress: number) => {
      if (!this.file) {
        return;
      }

      if (progress < 100) {
        setWorkers((prev) => ({
          ...prev,
          workers: prev.workers.map((w) => (w.key === this.key ? this.setProgress(progress) : w)),
        }));
      } else {
        setFiles((prev) => ({
          ...prev,
          transcodingFiles: prev.transcodingFiles.filter((file) => file.key !== this.file.key),
          completeFiles: prev.completeFiles.find((f) => f.key === this.file.key)
            ? prev.completeFiles
            : [...prev.completeFiles].concat(this.file),
        }));

        setWorkers((prev) => ({
          ...prev,
          workers: prev.workers.map((w) =>
            w.key === this.key ? this.setFile(null).setStatus(FfmpegStatus.WAITING) : w,
          ),
        }));
      }
    };

    const onError = (e?: any) => {
      if (!this.file) {
        return;
      }

      setFiles((prev) => {
        let target = prev.transcodingFiles.find((f) => f.key === this.file.key);

        if (!target) {
          return prev;
        }

        return {
          ...prev,
          transcodingFiles: prev.transcodingFiles.filter((f) => f.key !== this.file.key),
          completeFiles: prev.completeFiles.find((f) => f.key === target.key)
            ? prev.completeFiles
            : [...prev.completeFiles].concat(target.setError(e)),
        };
      });

      setWorkers((prev) => ({
        ...prev,
        workers: prev.workers.map((w) => (w.key === this.key ? this.setFile(null) : w)),
      }));
    };

    this.timer = setTimeout(() => {
      ffmpegService.transcode(this.file, onProgress, onError);
    }, Math.floor(Math.random() * (WAIT_MAX_TIME - WAIT_MIN_TIME)) + WAIT_MIN_TIME);

    return this;
  }

  public stop(): FfmpegWorker {
    const worker = this.setProgress(0).setStatus(FfmpegStatus.PAUSED);

    if (this.timer) {
      clearTimeout(this.timer);
    }

    if ((this.isPaused() || this.isRunning()) && this.file && this.file.command) {
      this.file.command.kill('SIGKILL');
    }

    return worker;
  }
}
