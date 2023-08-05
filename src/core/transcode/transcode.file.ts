import { v4 } from 'uuid';
import { plainToInstance } from 'class-transformer';

export class TranscodeFile {
  public static of(file: File) {
    const f = file as File & { path: string };

    return new TranscodeFile(f.name, f.path);
  }

  readonly key = v4();

  name: string;
  path: string;
  savePath: string | null = null;
  hasSound: boolean = false;
  frames: number | null = null;
  error: any | null = null;
  hasError: boolean = false;
  consumed: boolean = false;

  constructor(name: string, path: string) {
    this.name = name;
    this.path = path;
  }

  public dupliate(): TranscodeFile {
    return plainToInstance(TranscodeFile, this);
  }

  public canConsume() {
    return this.consumed === false;
  }

  public setConsume() {
    const file = this.dupliate();

    file.consumed = true;

    return file;
  }

  public setName(name: string) {
    const file = this.dupliate();

    file.name = name;

    return file;
  }

  public setSavePath(savePath: string) {
    const file = this.dupliate();

    file.savePath = savePath;

    return file;
  }

  public setError(e?: any) {
    const file = this.dupliate();

    file.error = e;
    file.hasError = !!e;

    return file;
  }
}
