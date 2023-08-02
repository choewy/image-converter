import { FfmpegFile } from '@/core';

export type SelectFileStoreValue = {
  files: FfmpegFile[];
  loading: boolean;
  disabled: boolean;
};

export type ProcessFile = {};
export type CompleteFile = {};
