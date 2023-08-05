import { TranscodeFile } from './transcode.file';
import { TranscodeWorker } from './transcode.worker';

export interface TranscodeFileStoreImpl {
  selectFiles: TranscodeFile[];
  transcodingFiles: TranscodeFile[];
  completeFiles: TranscodeFile[];
}

export interface TranscodeWorkerStoreImpl {
  running: boolean;
  workers: TranscodeWorker[];
}
