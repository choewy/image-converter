import { useCallback, useEffect } from 'react';

import {
  TranscodeFile,
  TranscodeService,
  TranscodeWorker,
  transcodeService,
  module,
  transcodeStorage,
  TranscodeWorkerStatus,
} from '@/core';
import { FileListStore, FileListStoreValue, WorkerStore, fileListStore, workerStore } from '@/store';

export class AppService {
  public static of() {
    return new AppService();
  }

  private readonly childProcess: typeof import('child_process');
  private readonly transcodeService: TranscodeService;
  private readonly workerStore: WorkerStore;
  private readonly fileListStore: FileListStore;

  constructor() {
    this.childProcess = module.getChildProcess();
    this.transcodeService = transcodeService;
    this.workerStore = workerStore;
    this.fileListStore = fileListStore;
  }

  public get running() {
    return this.workerStore.useValue().running;
  }

  public get workers() {
    return this.workerStore.useValue().workers;
  }

  public get selectFiles() {
    return this.fileListStore.useValue().selectFiles;
  }

  public get transcodingFiles() {
    return this.fileListStore.useValue().transcodingFiles;
  }

  public get completeFiles() {
    return this.fileListStore.useValue().completeFiles;
  }

  public useOnPushSelecetFiles() {
    const setFileList = this.fileListStore.useSetState();

    return useCallback(
      async (files: File | File[]) => {
        files = Array.isArray(files) ? files : [files];

        if (files.length === 0) {
          return;
        }

        const selectFiles: TranscodeFile[] = await Promise.all(
          files.map((file) => this.transcodeService.ffprobe(file)),
        );

        setFileList((prev) => ({
          ...prev,
          selectFiles: [...prev.selectFiles].concat(selectFiles),
        }));
      },
      [setFileList],
    );
  }

  public useOnDeleteFileHandler(property: keyof FileListStoreValue) {
    const setFileList = this.fileListStore.useSetState();

    return useCallback(
      (file: TranscodeFile) => () =>
        setFileList((prev) => ({
          ...prev,
          [property]: prev[property].filter(({ key }) => key !== file.key),
        })),
      [setFileList],
    );
  }

  public useOnResetFilesHandler(property: keyof FileListStoreValue) {
    const setFileList = this.fileListStore.useSetState();

    return useCallback(
      () =>
        setFileList((prev) => ({
          ...prev,
          [property]: [],
        })),
      [setFileList],
    );
  }

  public useOnClickStopHandler() {
    const setWorkers = this.workerStore.useSetState();

    return useCallback(
      (worker: TranscodeWorker) => () => {
        transcodeStorage.killTimeout(worker.key);
        transcodeStorage.killCommand(worker.key);

        setWorkers((prev) => ({
          ...prev,
          workers: prev.workers.map((w) =>
            w.key === worker.key ? w.setStatus(TranscodeWorkerStatus.PAUSED).setStopped(true) : w,
          ),
        }));
      },
      [setWorkers],
    );
  }

  public useOnClickRunHandler() {
    const setWorkers = this.workerStore.useSetState();

    return useCallback(
      (worker: TranscodeWorker) => () => {
        transcodeStorage.runCommand(worker.key);

        setWorkers((prev) => ({
          ...prev,
          workers: prev.workers.map((w) =>
            w.key === worker.key ? w.setStatus(TranscodeWorkerStatus.RUNNING).setStopped(false) : w,
          ),
        }));
      },
      [setWorkers],
    );
  }

  public useOnDequeue() {
    const [{ running, workers }, setWorkers] = this.workerStore.useState();
    const [{ transcodingFiles }, setFiles] = this.fileListStore.useState();

    const worker = workers.find((w) => w.canPrepare());
    const file = transcodingFiles.find((f) => f.canConsume());

    useEffect(() => {
      if (!running || !file || !worker) {
        return;
      }

      transcodeStorage.setFile(worker.key, file);

      setFiles((prev) => ({
        ...prev,
        transcodingFiles: prev.transcodingFiles.map((f) => (f.key === file.key ? file.setConsume() : f)),
      }));

      setWorkers((prev) => ({
        ...prev,
        workers: prev.workers.map((w) =>
          w.key !== worker.key ? w : w.setStatus(TranscodeWorkerStatus.PREPARE).prepare(setWorkers, setFiles),
        ),
      }));
    }, [running, file, worker, setFiles, setWorkers]);
  }

  public useOnTranscodeStart() {
    const setFiles = this.fileListStore.useSetState();
    const setWorkers = this.workerStore.useSetState();

    return useCallback(() => {
      setFiles((prev) => ({
        ...prev,
        selectFiles: prev.selectFiles.filter((f) => f.hasError),
        transcodingFiles: prev.selectFiles.filter((f) => !f.hasError),
      }));

      setWorkers((prev) => ({ ...prev, running: true }));
    }, [setFiles, setWorkers]);
  }

  public useOnChangeWorkerActive() {
    const setWorkers = this.workerStore.useSetState();

    return useCallback(
      (worker: TranscodeWorker) => () => {
        if (worker.isWaiting()) {
          setWorkers((prev) => ({
            ...prev,
            workers: prev.workers.map((w) => (w.key === worker.key ? w.setDisable(!w.disabled) : w)),
          }));
        } else {
          setWorkers((prev) => ({
            ...prev,
            workers: prev.workers.map((w) =>
              w.key === worker.key ? w.setDisable(!w.disabled).setStatus(TranscodeWorkerStatus.TEAR_DOWN) : w,
            ),
          }));

          setTimeout(() => {
            setWorkers((prev) => ({
              ...prev,
              workers: prev.workers.map((w) => (w.key === worker.key ? w.setStatus(TranscodeWorkerStatus.WAITING) : w)),
            }));
          }, this.transcodeService.getTeardownTime());
        }
      },
      [setWorkers],
    );
  }

  public useOnOpenDirectory() {
    return useCallback(
      (file: TranscodeFile) => () => {
        const split = file.path.replaceAll(' ', '_').split('/');
        const directory = split.slice(0, split.length - 1).join('/');

        this.childProcess.execSync(['open', directory].join(' '));
      },
      [],
    );
  }
}

export const appService = AppService.of();
