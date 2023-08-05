export class Module {
  private readonly electron = window.require('electron') as typeof import('electron');
  private readonly os = window.require('os') as typeof import('os');
  private readonly fs = window.require('fs') as typeof import('fs');
  private readonly path = window.require('path') as typeof import('path');
  private readonly ffmpeg = window.require('fluent-ffmpeg') as typeof import('fluent-ffmpeg');
  private readonly childProcess = window.require('child_process') as typeof import('child_process');
  private readonly sharp = window.require('sharp') as typeof import('sharp');

  public static of() {
    return new Module();
  }

  constructor() {
    let ffmpegStaticPath = window.require('ffmpeg-static-electron').path;
    let ffprobeStaticPath = window.require('ffprobe-static-electron').path;

    switch (process.platform) {
      case 'darwin':
        break;
    }

    this.ffmpeg.setFfmpegPath(ffmpegStaticPath);
    this.ffmpeg.setFfprobePath(ffprobeStaticPath);
  }

  public getIpc() {
    return this.electron.ipcRenderer;
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

  public getSharp() {
    return this.sharp;
  }

  public getChildProcess() {
    return this.childProcess;
  }
}

export const module = Module.of();
