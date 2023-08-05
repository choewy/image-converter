import { FfmpegCommand } from 'fluent-ffmpeg';

import { module } from '../module';
import { Logger } from '../logger';

import { TranscodeFile } from './transcode.file';

export class TranscodeStorage {
  public static of() {
    const os = module.getOs();
    const fs = module.getFs();

    return new TranscodeStorage(os, fs);
  }

  private readonly logger = Logger.of(TranscodeStorage.name);

  private readonly cpuCount: number;
  private readonly maxCount: number;
  private readonly defaultLimit: number;

  private readonly keys: string[] = [];
  private readonly files: Record<string, TranscodeFile | null> = {};
  private readonly commands: Record<string, FfmpegCommand | null> = {};
  private readonly timeouts: Record<string, NodeJS.Timeout | null> = {};

  constructor(private readonly os: typeof import('os'), private readonly fs: typeof import('fs')) {
    this.cpuCount = this.os.cpus().length;
    this.maxCount = this.cpuCount > 1 ? this.cpuCount - 1 : 1;
    this.defaultLimit = this.maxCount === 1 ? 1 : Math.floor(this.maxCount / 2);

    for (let i = 1; i <= this.maxCount; i++) {
      const key = `WORKER #${i}`;

      this.keys.push(key);
      this.files[key] = null;
      this.commands[key] = null;
      this.timeouts[key] = null;
    }
  }

  private beforeShutdownkillCommand(key: string): void {
    if (!this.commands[key]) {
      return;
    }

    this.commands[key].kill('SIGKILL');

    for (let output of (this.commands[key] as any)._outputs) {
      const savePath = output.target;

      if (savePath && this.fs.existsSync(savePath)) {
        try {
          this.fs.rmSync(savePath, { recursive: false });
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  public beforeShutdown(): void {
    this.keys.forEach((key) => {
      this.killTimeout(key);
      this.beforeShutdownkillCommand(key);
    });
  }

  public getDefaultLimit(): number {
    return this.defaultLimit;
  }

  public getKeys(): string[] {
    return this.keys;
  }

  public getFile(key: string): TranscodeFile | null {
    return this.files[key];
  }

  public getExistFiles(): TranscodeFile[] {
    return Object.values(this.files).filter((f) => !!f);
  }

  public setFile(key: string, file: TranscodeFile | null = null): void {
    this.files[key] = file;

    this.logger.debug({ key, method: this.setFile.name, file });
  }

  public deleteFile(key: string) {
    this.files[key] = null;

    this.logger.debug({ key, method: this.deleteFile.name });
  }

  public getCommand(key: string): FfmpegCommand | null {
    return this.commands[key];
  }

  public setCommand(key: string, command: FfmpegCommand | null = null): void {
    this.commands[key] = command;

    this.logger.debug({ key, method: this.setCommand.name, command });
  }

  public killCommand(key: string): void {
    if (this.commands[key]) {
      this.commands[key].kill('SIGKILL');
    }

    this.logger.debug({ key, method: this.killCommand.name });
  }

  public runCommand(key: string): void {
    if (this.commands[key]) {
      this.commands[key].run();
    }

    this.logger.debug({ key, method: this.runCommand.name });
  }

  public deleteCommand(key: string) {
    this.commands[key] = null;

    this.logger.debug({ key, method: this.deleteCommand.name });
  }

  public getTimeout(key: string): NodeJS.Timeout | null {
    return this.timeouts[key];
  }

  public setTimeout(key: string, timeout: NodeJS.Timeout | null = null): void {
    this.timeouts[key] = timeout;

    this.logger.debug({ key, method: this.setTimeout.name, timeout });
  }

  public killTimeout(key: string): void {
    if (this.timeouts[key]) {
      clearTimeout(this.timeouts[key]);
      this.timeouts[key] = null;
    }

    this.logger.debug({ key, method: this.killTimeout.name });
  }

  public deleteTimeout(key: string) {
    this.timeouts[key] = null;

    this.logger.debug({ key, method: this.deleteTimeout.name });
  }
}

export const transcodeStorage = TranscodeStorage.of();
