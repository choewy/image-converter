import { v4 } from 'uuid';
import { FfmpegCommand } from 'fluent-ffmpeg';

export class FfmpegFile {
  readonly key: string;

  name: string;
  path: string;

  hasSound: boolean | null;
  frames: number | null;
  error: any | null;
  hasError: boolean;
  progress: number;
  command: FfmpegCommand | null;

  public static of(file: File) {
    const f = file as File & { path: string };

    return new FfmpegFile(f.name, f.path);
  }

  constructor(name: string, path: string) {
    this.key = v4();
    this.name = name;
    this.path = path;
    this.progress = 0;
    this.hasSound = null;
    this.frames = null;
    this.hasError = false;
    this.error = false;
    this.command = null;
  }
}
