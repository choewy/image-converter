import { useCallback } from 'react';

import { FfmpegFile, FfmpegService, ffmpegService, module } from '@/core';
import { FileListStore, FileListStoreValue, WorkerStore, fileListStore, workerStore } from '@/store';

export class AppService {
  public static of() {
    return new AppService();
  }

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

  public useOnResetSelectFiles() {
    const setFileList = this.fileListStore.useSetState();

    return useCallback(
      () =>
        setFileList((prev) => ({
          ...prev,
          selectFiles: [],
        })),
      [setFileList],
    );
  }

  public useOnResetTranscodingFiles() {
    const setFileList = this.fileListStore.useSetState();

    return useCallback(
      () =>
        setFileList((prev) => ({
          ...prev,
          transcodingFiles: [],
        })),
      [setFileList],
    );
  }

  public useOnStartTranscodeFiles() {
    const setFileList = this.fileListStore.useSetState();

    const onProgress = useCallback(
      (key: string) => (value: number) => {
        setFileList((prev) => {
          let target = prev.transcodingFiles.find((file) => file.key === key);

          if (!target) {
            return prev;
          }

          target = Object.assign({}, target);
          target.progress = value;

          if (value < 100) {
            return {
              ...prev,
              transcodingFiles: prev.transcodingFiles.map((file) => (file.key === key ? target : file)),
            };
          } else {
            return {
              ...prev,
              transcodingFiles: prev.transcodingFiles.filter((file) => file.key !== key),
              completeFiles: [...prev.completeFiles].concat(target),
            };
          }
        });
      },
      [setFileList],
    );

    const onError = useCallback(
      (key: string) => (e: any) => {
        setFileList((prev) => {
          let target = prev.transcodingFiles.find((file) => file.key === key);

          if (!target) {
            return prev;
          }

          target = Object.assign({}, target);

          target.progress = 100;
          target.error = e;
          target.hasError = !!e;

          return {
            ...prev,
            transcodingFiles: prev.transcodingFiles.filter((file) => file.key !== key),
            completeFiles: [...prev.completeFiles].concat(target),
          };
        });
      },
      [setFileList],
    );

    return useCallback(() => {
      setFileList((prev) => ({
        ...prev,
        selectFiles: prev.selectFiles.filter((file) => !!file.hasError),
        transcodingFiles: prev.selectFiles
          .filter((file) => !file.hasError)
          .map((file) => this.ffmpegService.transcode(file.dupliate(), onProgress(file.key), onError(file.key))),
      }));
    }, [setFileList]);
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
