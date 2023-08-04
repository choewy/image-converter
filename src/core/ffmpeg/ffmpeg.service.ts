import Fs from 'fs';
import Path from 'path';
import Ffmpeg from 'fluent-ffmpeg';

import { module } from '@/core';
import { FfmpegFile } from './ffmpeg.class';

export class FfmpegService {
  public static of() {
    const fs = module.getFs();
    const path = module.getPath();
    const ffmpeg = module.getFfmpeg();

    return new FfmpegService(fs, path, ffmpeg);
  }

  constructor(
    private readonly fs: typeof Fs,
    private readonly path: typeof Path,
    private readonly ffmpeg: typeof Ffmpeg,
  ) {}

  public ffprobe(file: File): Promise<FfmpegFile> {
    const ffmpegFile = FfmpegFile.of(file);

    return new Promise((resolve) => {
      this.ffmpeg.ffprobe(ffmpegFile.path, (e, metadata) => {
        if (e) {
          ffmpegFile.error = e;
          ffmpegFile.hasError = !!e;
        } else {
          const streams = metadata.streams;
          const nbFrames = streams[0].nb_frames;

          ffmpegFile.frames = [null, undefined, 'N/A'].includes(nbFrames) ? null : Number(nbFrames);
          ffmpegFile.hasSound = streams.findIndex((stream) => stream.codec_type === 'audio') > -1;
        }

        return resolve(ffmpegFile);
      });
    });
  }

  public transcode(file: FfmpegFile, onProgress: (val: number) => void, onError: (error: any) => void): FfmpegFile {
    const filePath = this.path.parse(file.path);

    let extension: string;
    let options: string[];

    if (file.hasSound) {
      extension = 'webm';
      options = ['-y', '-vcodec', 'libvpx-vp9'];
    } else {
      extension = 'webp';
      options = ['-c:v', 'libwebp_anim', '-loop', '0', '-lossless', '1', '-preset', 'default', '-an', '-vsync', '0'];
    }

    file.name = filePath.name;

    let savePath: string;
    let existCount = 0;

    while (true) {
      const fileName = [file.name, extension].join('.');

      savePath = this.path.join(filePath.dir, fileName);

      if (!this.fs.existsSync(savePath)) {
        file.name = fileName;
        break;
      }

      existCount += 1;

      if (/.\((\d+)\)/.test(file.name)) {
        file.name = file.name.replace(`(${existCount - 1})`, `(${existCount})`);
      } else {
        file.name += `(${existCount})`;
      }
    }

    const command = this.ffmpeg(file.path)
      .on('progress', (val) => {
        onProgress(file.frames ? (val.frames / file.frames) * 100 : val.percent);
      })
      .on('error', (e) => {
        onError(e);
        command.kill('SIGKILL');
      })
      .on('end', () => {
        setTimeout(() => {
          onProgress(100);
        }, 1_000);
      });

    command.outputOption(options);
    command.save(savePath);

    return file;
  }
}

export const ffmpegService = FfmpegService.of();
