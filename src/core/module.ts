export class Module {
  private readonly os = window.require('os') as typeof import('os');
  private readonly fs = window.require('fs') as typeof import('fs');
  private readonly path = window.require('path') as typeof import('path');
  private readonly ffmpeg = window.require('fluent-ffmpeg') as typeof import('fluent-ffmpeg');
  private readonly childProcess = window.require('child_process') as typeof import('child_process');

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

  public getChildProcess() {
    return this.childProcess;
  }
}

export const module = Module.of();
