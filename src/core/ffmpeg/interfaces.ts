import { FfmpegFile, FfmpegWorker } from './ffmpeg.class';

export interface FfmpegFileStoreImpl {
  selectFiles: FfmpegFile[];
  transcodingFiles: FfmpegFile[];
  completeFiles: FfmpegFile[];
}

export interface FfmpegWorkerStoreImpl {
  running: boolean;
  workers: FfmpegWorker[];
}
