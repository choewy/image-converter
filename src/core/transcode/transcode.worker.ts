import { SetterOrUpdater } from 'recoil';
import { plainToInstance } from 'class-transformer';

import { TranscodeWorkerStatus } from './enums';
import { TranscodeFileStoreImpl, TranscodeWorkerStoreImpl } from './interfaces';
import { transcodeService } from './transcode.service';
import { TranscodeFile } from './transcode.file';
import { transcodeStorage } from './transcode.storage';

export class TranscodeWorker {
  public static of(key: string, index: number, defaultLimit: number) {
    return new TranscodeWorker(key, index > defaultLimit);
  }

  status: TranscodeWorkerStatus = TranscodeWorkerStatus.WAITING;
  progress: number = 0;
  stopped: boolean = false;

  constructor(public readonly key: string, public disabled: boolean) {}

  public isWaiting(): boolean {
    return [TranscodeWorkerStatus.WAITING].includes(this.status);
  }

  public isPaused(): boolean {
    return [TranscodeWorkerStatus.PAUSED].includes(this.status);
  }

  public isRunning(): boolean {
    return [TranscodeWorkerStatus.RUNNING].includes(this.status);
  }

  public canStopOrRerun(): boolean {
    return [TranscodeWorkerStatus.PREPARE, TranscodeWorkerStatus.RUNNING, TranscodeWorkerStatus.PAUSED].includes(
      this.status,
    );
  }

  public canPause(): boolean {
    return (
      this.disabled === false && [TranscodeWorkerStatus.PREPARE, TranscodeWorkerStatus.RUNNING].includes(this.status)
    );
  }

  public canError(): boolean {
    return (
      this.disabled === false && [TranscodeWorkerStatus.PREPARE, TranscodeWorkerStatus.RUNNING].includes(this.status)
    );
  }

  public canPrepare(): boolean {
    return this.disabled === false && [TranscodeWorkerStatus.WAITING].includes(this.status);
  }

  public disabledChange(): boolean {
    return [TranscodeWorkerStatus.TEAR_DOWN].includes(this.status);
  }

  public dupliate(): TranscodeWorker {
    return plainToInstance(TranscodeWorker, this);
  }

  public setProgress(progress: number): TranscodeWorker {
    const worker = this.dupliate();

    worker.progress = progress;

    return worker;
  }

  public setDisable(val: boolean): TranscodeWorker {
    const worker = this.dupliate();

    worker.disabled = val;

    return worker;
  }

  public setStopped(val: boolean): TranscodeWorker {
    const worker = this.dupliate();

    worker.stopped = val;

    return worker;
  }

  public setStatus(status: TranscodeWorkerStatus): TranscodeWorker {
    const worker = this.dupliate();

    worker.status = status;

    return worker;
  }

  public prepare(
    setWorkers: SetterOrUpdater<TranscodeWorkerStoreImpl>,
    setFiles: SetterOrUpdater<TranscodeFileStoreImpl>,
  ): TranscodeWorker {
    const file = transcodeStorage.getFile(this.key);

    if (!file) {
      return this;
    }

    const onProgress = (file: TranscodeFile, progress: number) => {
      if (!file) {
        return;
      }

      if (progress < 100) {
        setWorkers((prev) => ({
          ...prev,
          workers: prev.workers.map((w) => (w.key === this.key && w.progress < progress ? w.setProgress(progress) : w)),
        }));
      } else {
        transcodeStorage.deleteFile(this.key);

        setWorkers((prev) => ({
          ...prev,
          workers: prev.workers.map((w) =>
            w.key === this.key ? w.setStatus(TranscodeWorkerStatus.COMPLETE).setProgress(0).setStopped(false) : w,
          ),
        }));

        setFiles((prev) => ({
          ...prev,
          transcodingFiles: prev.transcodingFiles.filter((f) => f.key !== file.key),
          completeFiles: prev.completeFiles.find((f) => f.key === file.key)
            ? prev.completeFiles
            : [...prev.completeFiles].concat(file),
        }));

        setTimeout(() => {
          setWorkers((prev) => ({
            ...prev,
            workers: prev.workers.map((w) => (w.key === this.key ? w.setStatus(TranscodeWorkerStatus.WAITING) : w)),
          }));
        }, transcodeService.getTeardownTime());
      }
    };

    const onError = (file: TranscodeFile, sigkill: boolean, e?: any) => {
      if (!file) {
        return;
      }

      if (sigkill) {
        return setWorkers((prev) => ({
          ...prev,
          workers: prev.workers.map((w) =>
            w.key === this.key ? w.setStatus(TranscodeWorkerStatus.PAUSED).setStopped(true) : w,
          ),
        }));
      }

      transcodeStorage.deleteFile(this.key);

      setWorkers((prev) => ({
        ...prev,
        workers: prev.workers.map((w) =>
          w.key === this.key && w.canError() ? w.setStatus(TranscodeWorkerStatus.ERROR).setProgress(0) : w,
        ),
      }));

      setFiles((prev) => ({
        ...prev,
        transcodingFiles: prev.transcodingFiles.filter((f) => f.key !== file.key),
        completeFiles: prev.completeFiles.find((f) => f.key === file.key)
          ? prev.completeFiles
          : [...prev.completeFiles].concat(file.setError(e)),
      }));

      setTimeout(() => {
        setWorkers((prev) => ({
          ...prev,
          workers: prev.workers.map((w) => (w.key === this.key ? w.setStatus(TranscodeWorkerStatus.WAITING) : w)),
        }));
      }, transcodeService.getTeardownTime());
    };

    transcodeStorage.setTimeout(
      this.key,
      setTimeout(() => {
        transcodeStorage.killTimeout(this.key);

        const prepareComplete = transcodeService.transcode(this.key, onProgress, onError);

        if (!prepareComplete) {
          return;
        }

        setWorkers((prev) => ({
          ...prev,
          workers: prev.workers.map((w) => (w.key === this.key ? w.setStatus(TranscodeWorkerStatus.RUNNING) : w)),
        }));
      }, transcodeService.getWaitTime()),
    );

    return this;
  }

  public rerun(): TranscodeWorker {
    transcodeStorage.runCommand(this.key);

    return this.setStatus(TranscodeWorkerStatus.WAITING);
  }

  public stop(): TranscodeWorker {
    transcodeStorage.killTimeout(this.key);
    transcodeStorage.killCommand(this.key);

    let worker = this.setProgress(0);

    if (!worker.canPause()) {
      return worker;
    }

    return worker.setStatus(TranscodeWorkerStatus.PAUSED);
  }
}
