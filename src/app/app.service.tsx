import { useCallback } from 'react';

import { FfmpegFile, FfmpegService, ffmpegService } from '@/core';
import { FileListStore, fileListStore } from '@/store';

export class AppService {
  public static of() {
    return new AppService();
  }

  private readonly ffmpegService: FfmpegService;
  private readonly fileListStore: FileListStore;

  constructor() {
    this.ffmpegService = ffmpegService;
    this.fileListStore = fileListStore;
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

  public useOnDeleteSelectFileHandler() {
    const setFileList = this.fileListStore.useSetState();

    return useCallback(
      (index: number) => () =>
        setFileList((prev) => ({
          ...prev,
          selectFiles: prev.selectFiles.filter((_, i) => index !== i),
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
          .map((file) => this.ffmpegService.transcode({ ...file }, onProgress(file.key), onError(file.key))),
      }));
    }, [setFileList]);
  }
}

export const appService = AppService.of();
