import Path from 'path';
import Ffmpeg, { FfmpegCommand, FfprobeData } from 'fluent-ffmpeg';

import { module } from '../module';
import { FfmpegFile } from './ffmpeg.class';

export class FfmpegService {
  public static of() {
    const path = module.getPath();
    const ffmpeg = module.getFfmpeg();

    return new FfmpegService(path, ffmpeg);
  }

  constructor(private readonly path: typeof Path, private readonly ffmpeg: typeof Ffmpeg) {}

  public ffprobe(file: File): Promise<FfmpegFile> {
    const ffmpegFile = FfmpegFile.of(file);

    return new Promise((resolve) => {
      this.ffmpeg.ffprobe(ffmpegFile.path, (e, metadata) => {
        if (e) {
          return resolve(ffmpegFile.setError(e));
        } else {
          return resolve(ffmpegFile.setMetadata(metadata));
        }
      });
    });
  }

  public transcode(
    file: FfmpegFile,
    onProgress: (val: number) => void,
    onEnd: (hasError: boolean) => void,
  ): FfmpegCommand {
    let savePath: string;

    const filePath = this.path.parse(file.path);

    const command = this.ffmpeg(file.path)
      .on('progress', (val) => {
        onProgress(file.frames ? (val.frames / file.frames) * 100 : val.percent);
      })
      .on('error', (e) => {
        command.kill('SIGKILL');
        onEnd(true);
      })
      .on('end', () => {
        onProgress(100);
        setTimeout(() => {
          onEnd(false);
        }, 2000);
      });

    let extension: string;
    let options: string[];

    if (file.hasSound) {
      extension = 'webm';
      options = ['-y', '-vcodec', 'libvpx-vp9'];
    } else {
      extension = 'webp';
      options = ['-c:v', 'libwebp_anim', '-loop', '0', '-lossless', '1', '-preset', 'default', '-an', '-vsync', '0'];
    }

    savePath = this.path.join(filePath.dir, [filePath.name, extension].join('.'));

    command.outputOption(options);
    command.save(savePath);

    return command;
  }
}

export const ffmpegService = FfmpegService.of();
