import { useCallback, useEffect } from 'react';

import { FfmpegFile, FfmpegService, FfmpegStatus, FfmpegWorker, Logger, ffmpegService, module } from '@/core';
import { FileListStore, FileListStoreValue, WorkerStore, fileListStore, workerStore } from '@/store';

export class AppService {
  public static of() {
    return new AppService();
  }

  private readonly logger = Logger.of(AppService.name);

  private readonly childProcess: typeof import('child_process');
  private readonly ffmpegService: FfmpegService;
  private readonly workerStore: WorkerStore;
  private readonly fileListStore: FileListStore;

  constructor() {
    this.childProcess = module.getChildProcess();
    this.ffmpegService = ffmpegService;
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

        const selectFiles: FfmpegFile[] = await Promise.all(files.map((file) => this.ffmpegService.ffprobe(file)));

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
      (file: FfmpegFile) => () =>
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

  public useOnDequeue() {
    const [{ transcodingFiles }, setFiles] = this.fileListStore.useState();
    const [{ running, workers }, setWorkers] = this.workerStore.useState();

    const file = transcodingFiles.find((f) => [FfmpegStatus.WAITING, FfmpegStatus.PAUSED].includes(f.status));
    const worker = workers.find((w) => !w.disabled && [FfmpegStatus.WAITING, FfmpegStatus.PAUSED].includes(w.status));

    useEffect(() => {
      if (!running || !file || !worker) {
        return setWorkers((prev) => ({ ...prev }));
      }

      this.logger.debug({
        file: `${file?.name} : ${file?.status}`,
        worker: `${worker?.key} : ${worker?.status}`,
      });

      setFiles((prev) => ({
        ...prev,
        transcodingFiles: prev.transcodingFiles.map((f) =>
          f.key === file.key ? file.setStatus(FfmpegStatus.RUNNING) : f,
        ),
      }));

      setWorkers((prev) => ({
        ...prev,
        workers: prev.workers.map((w) =>
          w.key !== worker.key ? w : w.setStatus(FfmpegStatus.RUNNING).setFile(file).run(setWorkers, setFiles),
        ),
      }));
    }, [running, file, worker, setWorkers]);
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

  public useOnTranscodeStop() {
    const setFiles = this.fileListStore.useSetState();
    const [{ workers }, setWorkers] = this.workerStore.useState();

    return useCallback(() => {
      const hasFileWorkers = workers.filter((w) => !!w.file);

      if (hasFileWorkers.length === 0) {
        return;
      }

      setWorkers((prev) => ({
        ...prev,
        running: false,
        workers: prev.workers.map((worker) => worker.stop()),
      }));

      setFiles((prev) => {
        const transcodingFiles = [...prev.transcodingFiles];

        for (const worker of hasFileWorkers) {
          if (!worker.file) {
            continue;
          }

          const index = transcodingFiles.findIndex((f) => f.key === worker.file.key);

          if (index > -1) {
            transcodingFiles[index] = transcodingFiles[index].setStatus(FfmpegStatus.PAUSED);
          } else {
            transcodingFiles.push(worker.file.setStatus(FfmpegStatus.PAUSED));
          }
        }

        return { ...prev, transcodingFiles };
      });
    }, [workers, setFiles, setWorkers]);
  }

  public useOnTranscodeRestart() {
    const setWorkers = this.workerStore.useSetState();

    return useCallback(() => {
      setWorkers((prev) => ({
        ...prev,
        running: true,
      }));
    }, [setWorkers]);
  }

  public useOnChangeWorkerActive() {
    const setWorkers = this.workerStore.useSetState();

    return useCallback(
      (worker: FfmpegWorker) => () => {
        setWorkers((prev) => ({
          ...prev,
          workers: prev.workers.map((w) => (w.key === worker.key ? w.setDisable(!w.disabled) : w)),
        }));
      },
      [setWorkers],
    );
  }

  public useOnOpenDirectory() {
    return useCallback(
      (file: FfmpegFile) => () => {
        const split = file.path.split('/');
        const directory = split.slice(0, split.length - 1).join('/');

        this.childProcess.execSync(['open', directory].join(' '));
      },
      [],
    );
  }
}

export const appService = AppService.of();
