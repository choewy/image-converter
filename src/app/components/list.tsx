import { FC, Fragment, useCallback } from 'react';
import {
  Box,
  Divider,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import {
  CheckCircle,
  CloudDone,
  Delete,
  DoDisturbOff,
  DoDisturbOn,
  Error,
  FolderOpen,
  PauseCircle,
  PlayArrow,
  Refresh,
  RunCircle,
} from '@mui/icons-material';

import { appService } from '../app.service';
import { FfmpegWorker } from '@/core';

export const WorkerList: FC = () => {
  const workers = appService.workers;
  const disabled = workers.filter((worker) => worker.isWaiting()).length === workers.length;

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
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography color="GrayText" sx={{ ml: 1 }}>
          PROCESS
        </Typography>
        <Box>
          <IconButton size="small" disabled={disabled}>
            <Refresh fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <List>
        {workers.map((worker, i) => (
          <ListItem key={worker.key}>
            <ListItemIcon>{statusIcon(worker)}</ListItemIcon>
            <ListItemText>{`WORKER #${i + 1}`}</ListItemText>
            {worker.file && <LinearProgress variant="determinate" value={worker.file.progress} />}
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export const SelectFileList: FC = () => {
  const selectFiles = appService.selectFiles;

  const onClickStart = appService.useOnStartTranscodeFiles();
  const onClickReset = appService.useOnResetSelectFiles();
  const onClickDeleteHandler = appService.useOnDeleteFileHandler('selectFiles');

  return (
    <Paper sx={{ width: 500, height: 630, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography color="GrayText" sx={{ ml: 1 }}>
          선택한 파일 목록
        </Typography>
        <Box>
          <IconButton size="small" disabled={selectFiles.length === 0} onClick={onClickStart}>
            <PlayArrow fontSize="small" />
          </IconButton>
          <IconButton size="small" disabled={selectFiles.length === 0} onClick={onClickReset}>
            <Refresh fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Divider />
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
  const transcodingFiles = appService.transcodingFiles;

  const onClickReset = appService.useOnResetTranscodingFiles();
  const onClickDeleteHandler = appService.useOnDeleteFileHandler('transcodingFiles');

  return (
    <Paper sx={{ width: 500, height: 630, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography color="GrayText" sx={{ ml: 1 }}>
          변환 대기 목록
        </Typography>
        <Box>
          <IconButton size="small" disabled={transcodingFiles.length === 0} onClick={onClickReset}>
            <Refresh fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <List>
        {transcodingFiles.map((file) => (
          <Fragment key={file.key}>
            <ListItem key={file.key}>
              <ListItemIcon>
                {file.hasError ? <Error color="error" fontSize="small" /> : <CloudDone color="info" fontSize="small" />}
              </ListItemIcon>
              <ListItemText>{file.name}</ListItemText>
              <IconButton size="small" onClick={onClickDeleteHandler(file)}>
                <Delete fontSize="small" />
              </IconButton>
            </ListItem>
            <Box sx={{ width: '100%' }}>
              <LinearProgress variant="determinate" value={file.progress} />
            </Box>
          </Fragment>
        ))}
      </List>
    </Paper>
  );
};

export const CompleteFileList: FC = () => {
  const completeFiles = appService.completeFiles;

  const onClickReset = appService.useOnResetTranscodingFiles();
  const onClickOpenDirectory = appService.useOnOpenDirectory();
  const onClickDeleteHandler = appService.useOnDeleteFileHandler('completeFiles');

  return (
    <Paper sx={{ width: 500, height: 630, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography color="GrayText" sx={{ ml: 1 }}>
          변환이 완료된 파일 목록
        </Typography>
        <Box>
          <IconButton size="small" disabled={completeFiles.length === 0} onClick={onClickReset}>
            <Refresh fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Divider />
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
            <IconButton size="small" onClick={onClickDeleteHandler(file)}>
              <Delete fontSize="small" />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
