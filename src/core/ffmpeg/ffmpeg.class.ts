import { FfmpegService, ffmpegService } from './ffmpeg.service';
import { FfmpegCommand, FfprobeData, FfprobeStream } from 'fluent-ffmpeg';

export class FfmpegFile {
  readonly name: string;
  readonly path: string;

  readonly progress: number;
  readonly hasSound: boolean | null;
  readonly frames: number | null;
  readonly error: any | null;
  readonly hasError: boolean;
  readonly command: FfmpegCommand | null;

  public static of(file: File) {
    const f = file as File & { path: string };

    return new FfmpegFile(f.name, f.path);
  }

  public static listOf(files: FileList): FfmpegFile[] {
    return Array(files.length)
      .fill(null)
      .map((_, i) => {
        const file = files.item(i) as File & { path: string };

        return new FfmpegFile(file.name, file.path);
      });
  }

  constructor(name: string, path: string) {
    this.name = name;
    this.path = path;
    this.progress = 0;
    this.hasSound = null;
    this.frames = null;
    this.error = false;
    this.command = null;
  }

  public setMetadata(metadata: FfprobeData) {
    const streams = metadata.streams;
    const nbFrames = streams[0].nb_frames;

    Object.assign(this, {
      frames: [null, undefined, 'N/A'].includes(nbFrames) ? null : Number(nbFrames),
      hasSound: streams.findIndex((stream) => stream.codec_type === 'audio') > -1,
    });

    return this;
  }

  public setCommand(command: FfmpegCommand) {
    Object.assign(this, { command });

    return this;
  }

  public setError(error: any) {
    Object.assign(this, {
      error,
      hasError: !!error,
      command: null,
    });

    return this;
  }
}

export class Transcoder {
  private static readonly WAIT_MIN_TIME = 600;
  private static readonly WAIT_MAX_TIME = 3000;

  public static wait() {
    return new Promise((resolve) =>
      setTimeout(resolve, Math.floor(Math.random() * (this.WAIT_MAX_TIME - this.WAIT_MIN_TIME)) + this.WAIT_MIN_TIME),
    );
  }

  public static of(getFile: () => FfmpegFile, onEnd: (file: FfmpegFile) => void, onProgress: () => void) {
    return new Transcoder(ffmpegService, getFile, onEnd, onProgress);
  }

  file: FfmpegFile | null = null;
  status: 'waiting' | 'paused' | 'running' = 'waiting';

  constructor(
    private readonly ffmpegService: FfmpegService,
    private readonly getFile: () => FfmpegFile,
    private readonly onEnd: (file: FfmpegFile) => void,
    private readonly setProgress: (progress: number) => void,
  ) {}

  private init(): void {
    this.file = null;
    this.status = 'waiting';

    this.setProgress(0);
  }

  private transcode(file: FfmpegFile): void {
    this.status = 'running';

    file.setCommand(
      this.ffmpegService.transcode(
        file,
        (progress) => {
          this.setProgress(progress);
        },
        (e) => {
          file.setError(e);
          this.init();
          this.onEnd(file);
          this.setProgress(0);
          this.prepare();
        },
      ),
    );

    this.file = file;
  }

  private prepare(): void {
    Transcoder.wait().then(() => {
      const file = this.getFile();

      if (!file) {
        return;
      }

      this.transcode(file);
    });
  }

  public awake(): void {
    if (this.status !== 'waiting') {
      return;
    }

    this.prepare();
  }

  public kill(): void {
    if ([this.status].includes('waiting')) {
      return;
    }

    if (this.file && this.file.command) {
      this.file.command.kill('SIGKILL');
    }
  }
}
