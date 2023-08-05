export enum TranscodeWorkerStatus {
  WAITING = 'waiting',
  PREPARE = 'prepare',
  PAUSED = 'paused',
  RUNNING = 'running',
  COMPLETE = 'complete',
  ERROR = 'error',
  TEAR_DOWN = 'tear-down',
}

export enum TranscodeWaitTime {
  WAIT_MIN = 600,
  WAIT_MAX = 3000,
  TEAR_DOWN_MIN = 1000,
  TEAR_DOWN_MAX = 2000,
}
