import { FC, Fragment, useCallback } from 'react';
import { Box, IconButton, LinearProgress, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import {
  CheckCircle,
  CloudDone,
  Delete,
  DoDisturbOff,
  DoDisturbOn,
  Error,
  FolderOpen,
  Pause,
  PauseCircle,
  PlayArrow,
  Refresh,
  RunCircle,
  TransferWithinAStation,
} from '@mui/icons-material';

import { FfmpegWorker } from '@/core';

import { appService } from '../app.service';
import { ListToolbar } from './list-toolbar';

export const WorkerList: FC = () => {
  const workers = appService.workers;
  const running = !!workers.find((worker) => worker.isRunning());
  const disabled = workers.filter((worker) => worker.isWaiting()).length === workers.length;

  const onChangeActive = appService.useOnChangeWorkerActive();

  const statusIcon = useCallback((worker: FfmpegWorker) => {
    if (worker.disabled) {
      return <DoDisturbOff fontSize="small" color="disabled" />;
    }

    if (worker.isWaiting()) {
      return <DoDisturbOn fontSize="small" />;
    }

    if (worker.isPaused()) {
      return <PauseCircle fontSize="small" color="warning" />;
    }

    if (worker.isRunning()) {
      return <RunCircle fontSize="small" color="primary" />;
    }
  }, []);

  return (
    <Paper sx={{ width: 500, height: 630, overflow: 'auto' }}>
      <ListToolbar title="프로세스">
        <Box>
          <IconButton size="small" disabled={disabled}>
            <TransferWithinAStation fontSize="small" color={running ? 'info' : 'disabled'} />
          </IconButton>
        </Box>
      </ListToolbar>
      <List>
        {workers.map((worker, i) => {
          return (
            <Fragment key={worker.key}>
              <ListItem>
                <ListItemIcon>
                  <IconButton size="small" disabled={!worker.isWaiting()} onClick={onChangeActive(worker)}>
                    {statusIcon(worker)}
                  </IconButton>
                </ListItemIcon>
                <ListItemText
                  sx={{
                    color: worker.disabled ? '#888' : '#fff',
                  }}
                >{`WORKER #${i + 1}`}</ListItemText>
              </ListItem>
              <LinearProgress variant="determinate" value={worker.progress || 0} />
            </Fragment>
          );
        })}
      </List>
    </Paper>
  );
};

export const SelectFileList: FC = () => {
  const selectFiles = appService.selectFiles;

  appService.useOnDequeue();

  const onClickStart = appService.useOnTranscodeStart();
  const onClickReset = appService.useOnResetFilesHandler('selectFiles');
  const onClickDeleteHandler = appService.useOnDeleteFileHandler('selectFiles');

  return (
    <Paper sx={{ width: 500, height: 630, overflow: 'auto' }}>
      <ListToolbar title="파일 목록">
        <Box>
          <IconButton size="small" disabled={selectFiles.length === 0} onClick={onClickStart}>
            <PlayArrow fontSize="small" />
          </IconButton>
          <IconButton size="small" disabled={selectFiles.length === 0} onClick={onClickReset}>
            <Refresh fontSize="small" />
          </IconButton>
        </Box>
      </ListToolbar>
      <List>
        {selectFiles.map((file) => (
          <ListItem key={file.key}>
            <ListItemIcon>
              {file.hasError ? <Error color="error" fontSize="small" /> : <CloudDone color="info" fontSize="small" />}
            </ListItemIcon>
            <ListItemText>{file.name}</ListItemText>
            <IconButton size="small" onClick={onClickDeleteHandler(file)}>
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export const TranscodingFileList: FC = () => {
  const running = appService.running;
  const transcodingFiles = appService.transcodingFiles;

  const onClickPause = appService.useOnTranscodeStop();
  const onClickRestart = appService.useOnTranscodeRestart();
  const onClickReset = appService.useOnResetFilesHandler('transcodingFiles');
  const onClickDeleteHandler = appService.useOnDeleteFileHandler('transcodingFiles');

  return (
    <Paper sx={{ width: 500, height: 630, overflow: 'auto' }}>
      <ListToolbar title="변환 대기">
        <Box>
          {transcodingFiles.length === 0 ? (
            <Fragment />
          ) : running ? (
            <IconButton size="small" disabled={transcodingFiles.length === 0} onClick={onClickPause}>
              <Pause fontSize="small" />
            </IconButton>
          ) : (
            <IconButton size="small" disabled={transcodingFiles.length === 0} onClick={onClickRestart}>
              <PlayArrow fontSize="small" />
            </IconButton>
          )}
          <IconButton size="small" disabled={transcodingFiles.length === 0} onClick={onClickReset}>
            <Refresh fontSize="small" />
          </IconButton>
        </Box>
      </ListToolbar>
      <List>
        {transcodingFiles.map((file) => (
          <ListItem key={file.key}>
            <ListItemIcon>
              {file.hasError ? <Error color="error" fontSize="small" /> : <CloudDone color="info" fontSize="small" />}
            </ListItemIcon>
            <ListItemText>{file.name}</ListItemText>
            <IconButton size="small" onClick={onClickDeleteHandler(file)}>
              <Delete fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export const CompleteFileList: FC = () => {
  const completeFiles = appService.completeFiles;

  const onClickReset = appService.useOnResetFilesHandler('completeFiles');
  const onClickOpenDirectory = appService.useOnOpenDirectory();

  return (
    <Paper sx={{ width: 500, height: 630, overflow: 'auto' }}>
      <ListToolbar title="변환 완료">
        <Box>
          <IconButton size="small" disabled={completeFiles.length === 0} onClick={onClickReset}>
            <Refresh fontSize="small" />
          </IconButton>
        </Box>
      </ListToolbar>
      <List>
        {completeFiles.map((file) => (
          <ListItem key={file.key}>
            <ListItemIcon>
              {file.hasError ? (
                <Error color="error" fontSize="small" />
              ) : (
                <CheckCircle color="success" fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>{file.name}</ListItemText>
            <IconButton size="small" onClick={onClickOpenDirectory(file)}>
              <FolderOpen fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
