import { FfmpegFile } from '@/core';

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
