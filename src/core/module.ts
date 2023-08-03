import Os from 'os';
import Fs from 'fs';
import Path from 'path';
import Ffmpeg from 'fluent-ffmpeg';

export class Module {
  private readonly os = window.require('os') as typeof Os;
  private readonly fs = window.require('fs') as typeof Fs;
  private readonly path = window.require('path') as typeof Path;
  private readonly ffmpeg = window.require('fluent-ffmpeg') as typeof Ffmpeg;

  public static of() {
    return new Module();
  }

  public getOs() {
    return this.os;
  }

  public getFs() {
    return this.fs;
  }

  public getPath() {
    return this.path;
  }

  public getFfmpeg() {
    return this.ffmpeg;
  }
}

export const module = Module.of();
