import { Logger, TranscodeWaitTime, module, transcodeStorage } from '@/core';
import { TranscodeFile } from './transcode.file';
import { kill } from 'process';

export class TranscodeService {
  public static of() {
    const fs = module.getFs();
    const path = module.getPath();
    const ffmpeg = module.getFfmpeg();
    const sharp = module.getSharp();

    return new TranscodeService(fs, path, ffmpeg, sharp);
  }

  private readonly logger = Logger.of(TranscodeService.name);

  constructor(
    private readonly fs: typeof import('fs'),
    private readonly path: typeof import('path'),
    private readonly ffmpeg: typeof import('fluent-ffmpeg'),
    private readonly sharp: typeof import('sharp'),
  ) {}

  private createSavePath(file: TranscodeFile): TranscodeFile {
    const filePath = this.path.parse(file.path);
    const extension = file.hasSound ? 'webm' : 'webp';

    file = file.setName(filePath.name);

    let fileName: string;
    let savePath: string;
    let existCount = 0;

    while (true) {
      fileName = [file.name, extension].join('.');
      savePath = this.path.join(filePath.dir, fileName);

      if (!this.fs.existsSync(savePath)) {
        file = file.setName(filePath.name);
        break;
      }

      existCount += 1;

      if (/.\((\d+)\)/.test(file.name)) {
        file = file.setName(file.name.replace(`(${existCount - 1})`, `(${existCount})`));
      } else {
        file = file.setName(file.name + `(${existCount})`);
      }
    }

    return file.setName(fileName).setSavePath(savePath);
  }

  private getFfmpegOptions(file: TranscodeFile): string[] | null {
    if (file.hasSound) {
      return ['-y', '-vcodec', 'libvpx-vp9'];
    } else {
      if (file.frames === null) {
        return null;
      }

      return ['-c:v', 'libwebp_anim', '-loop', '0', '-lossless', '1', '-preset', 'default', '-an', '-vsync', '0'];
    }
  }

  private ffmpegOf(
    workerKey: string,
    file: TranscodeFile,
    options: string[],
    onProgress: (file: TranscodeFile, progress: number) => void,
    onError: (file: TranscodeFile, sigkill: boolean, e?: any) => void,
  ): TranscodeFile {
    file = this.createSavePath(file);

    const command = this.ffmpeg(file.path)
      .on('progress', (val) => {
        const progress = file.frames ? Math.floor((val.frames / file.frames) * 100) : val.percent;

        onProgress(file, progress || 0);
      })
      .on('error', (e) => {
        const sigkill = e.message.includes('SIGKILL');

        onError(file, sigkill, e);

        if (sigkill) {
          this.logger.debug(this.ffmpegOf.name, 'SIGKILL', file);
        } else {
          this.logger.error(this.ffmpegOf.name, file, e?.stack);
        }
      })
      .on('end', () => {
        onProgress(file, 99);
        setTimeout(() => {
          onProgress(file, 100);
          this.logger.debug(this.ffmpegOf.name, file);
        }, transcodeService.getTeardownTime());
      });

    command.outputOption(options);
    command.save(file.savePath);

    transcodeStorage.setCommand(workerKey, command);

    return file;
  }

  private sharpOf(
    file: TranscodeFile,
    onProgress: (file: TranscodeFile, progress: number) => void,
    onError: (file: TranscodeFile, e?: any) => void,
  ) {
    this.sharp(file.path)
      .webp({ lossless: true })
      .toBuffer()
      .then((buf) => {
        file = this.createSavePath(file);
        this.fs.writeFileSync(file.savePath, buf);

        onProgress(file, 99);
        setTimeout(() => {
          onProgress(file, 100);
          this.logger.debug(this.sharpOf.name, file);
        }, transcodeService.getTeardownTime());
      })
      .catch((e) => {
        onError(file, e);
        this.logger.error(this.sharpOf.name, file, e?.stack);
      });

    return file;
  }

  public ffprobe(file: File): Promise<TranscodeFile> {
    const ffmpegFile = TranscodeFile.of(file);

    return new Promise((resolve) => {
      this.ffmpeg.ffprobe(ffmpegFile.path, (e, metadata) => {
        if (e) {
          ffmpegFile.error = e;
          ffmpegFile.hasError = !!e;

          this.logger.error(this.ffprobe.name, file, e?.stack);
        } else {
          const streams = metadata.streams;
          const nbFrames = streams[0].nb_frames;

          ffmpegFile.frames = [null, undefined, 'N/A'].includes(nbFrames) ? null : Number(nbFrames);
          ffmpegFile.hasSound = streams.findIndex((stream) => stream.codec_type === 'audio') > -1;

          this.logger.debug(this.ffprobe.name, ffmpegFile);
        }

        return resolve(ffmpegFile);
      });
    });
  }

  public getWaitTime(): number {
    return (
      Math.floor(Math.random() * (TranscodeWaitTime.WAIT_MAX - TranscodeWaitTime.WAIT_MIN)) + TranscodeWaitTime.WAIT_MIN
    );
  }

  public getTeardownTime(): number {
    return (
      Math.floor(Math.random() * (TranscodeWaitTime.TEAR_DOWN_MAX - TranscodeWaitTime.TEAR_DOWN_MIN)) +
      TranscodeWaitTime.TEAR_DOWN_MIN
    );
  }

  public transcode(
    workerKey: string,
    onProgress: (file: TranscodeFile, val: number) => void,
    onError: (file: TranscodeFile, error?: any) => void,
  ): boolean {
    const file = transcodeStorage.getFile(workerKey);

    if (!file) {
      return false;
    }

    const ffmpegOptions = this.getFfmpegOptions(file);

    if (ffmpegOptions) {
      this.ffmpegOf(workerKey, file, ffmpegOptions, onProgress, onError);
    } else {
      this.sharpOf(file, onProgress, onError);
    }

    return true;
  }
}

export const transcodeService = TranscodeService.of();
