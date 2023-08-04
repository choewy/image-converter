import { Logger, module } from '@/core';
import { FfmpegFile } from './ffmpeg.class';

export class FfmpegService {
  public static of() {
    const fs = module.getFs();
    const path = module.getPath();
    const ffmpeg = module.getFfmpeg();
    const sharp = module.getSharp();

    return new FfmpegService(fs, path, ffmpeg, sharp);
  }

  private readonly logger = Logger.of(FfmpegService.name);

  constructor(
    private readonly fs: typeof import('fs'),
    private readonly path: typeof import('path'),
    private readonly ffmpeg: typeof import('fluent-ffmpeg'),
    private readonly sharp: typeof import('sharp'),
  ) {}

  private createSavePath(file: FfmpegFile): FfmpegFile {
    const filePath = this.path.parse(file.path);
    const extension = file.hasSound ? 'webm' : 'webp';

    file = file.setName(filePath.name);

    let savePath: string;
    let existCount = 0;

    while (true) {
      const fileName = [file.name, extension].join('.');

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

    return file.setSavePath(savePath);
  }

  private getFfmpegOptions(file: FfmpegFile): string[] | null {
    if (file.frames === null) {
      return null;
    }

    if (file.hasSound) {
      return ['-y', '-vcodec', 'libvpx-vp9'];
    } else {
      return ['-c:v', 'libwebp_anim', '-loop', '0', '-lossless', '1', '-preset', 'default', '-an', '-vsync', '0'];
    }
  }

  private ffmpegOf(
    file: FfmpegFile,
    options: string[],
    onProgress: (progress: number) => void,
    onError: (e?: any) => void,
  ) {
    file.command = this.ffmpeg(file.path)
      .on('progress', (val) => {
        onProgress(file.frames ? Math.floor((val.frames / file.frames) * 100) : val.percent);
      })
      .on('error', (e) => {
        onError(e);
        file.command.kill('SIGKILL');

        this.logger.error(this.ffmpegOf.name, file, e?.stack);
      })
      .on('end', () => {
        onProgress(100);

        this.logger.debug(this.ffmpegOf.name, file);
      });

    file.command.outputOption(options);
    file.command.save(file.savePath);

    return file;
  }

  private sharpOf(file: FfmpegFile, onProgress: (progress: number) => void, onError: (e?: any) => void) {
    this.sharp(file.path)
      .webp({ lossless: true })
      .toBuffer()
      .then((buf) => {
        this.fs.writeFileSync(file.savePath, buf);

        onProgress(100);

        this.logger.debug(this.sharpOf.name, file);
      })
      .catch((e) => {
        onError(e);
        this.logger.error(this.sharpOf.name, file, e?.stack);
      });

    return file;
  }

  public ffprobe(file: File): Promise<FfmpegFile> {
    const ffmpegFile = FfmpegFile.of(file);

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

  public transcode(file: FfmpegFile, onProgress: (val: number) => void, onError: (error: any) => void): FfmpegFile {
    const ffmpegOptions = this.getFfmpegOptions(file);

    if (ffmpegOptions) {
      return this.ffmpegOf(this.createSavePath(file), ffmpegOptions, onProgress, onError);
    } else {
      return this.sharpOf(this.createSavePath(file), onProgress, onError);
    }
  }
}

export const ffmpegService = FfmpegService.of();
