import { FC } from 'react';

import {
  AccessTime,
  ChangeCircleRounded,
  CheckCircle,
  DoDisturbOff,
  DoDisturbOn,
  PauseCircle,
  SlowMotionVideo,
  Warning,
} from '@mui/icons-material';

import { TranscodeWorker, TranscodeWorkerStatus } from '@/core';

export const WorkerStatusIcon: FC<{ worker: TranscodeWorker }> = ({ worker }) => {
  if (worker.disabled) {
    if (worker.isWaiting()) {
      return <DoDisturbOff fontSize="small" color="disabled" />;
    } else {
      return <ChangeCircleRounded fontSize="small" color="disabled" />;
    }
  }

  switch (worker.status) {
    case TranscodeWorkerStatus.WAITING:
      return <DoDisturbOn fontSize="small" color="action" />;

    case TranscodeWorkerStatus.PREPARE:
      return <AccessTime fontSize="small" color="primary" />;

    case TranscodeWorkerStatus.RUNNING:
      return <SlowMotionVideo fontSize="small" color="primary" />;

    case TranscodeWorkerStatus.COMPLETE:
      return <CheckCircle fontSize="small" color="success" />;

    case TranscodeWorkerStatus.PAUSED:
      return <PauseCircle fontSize="small" color="warning" />;

    case TranscodeWorkerStatus.ERROR:
      return <Warning fontSize="small" color="error" />;
  }
};
