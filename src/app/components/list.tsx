import { FC, Fragment } from 'react';
import { Box, IconButton, LinearProgress, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import {
  CheckCircle,
  CloudDone,
  Delete,
  Error,
  FolderOpen,
  PlayArrow,
  PlayCircleFilledRounded,
  Refresh,
  StopCircleRounded,
  TransferWithinAStation,
} from '@mui/icons-material';

import { appService } from '../app.service';
import { ListToolbar } from './list-toolbar';
import { WorkerStatusIcon } from './icons';

export const WorkerList: FC = () => {
  const workers = appService.workers;
  const running = !!workers.find((worker) => worker.isRunning());
  const disabled = workers.filter((worker) => worker.isWaiting()).length === workers.length;

  const onChangeActive = appService.useOnChangeWorkerActive();
  const onClickStopHandler = appService.useOnClickStopHandler();
  const onClickRunHandler = appService.useOnClickRunHandler();

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
                  <IconButton size="small" disabled={worker.disabledChange()} onClick={onChangeActive(worker)}>
                    <WorkerStatusIcon worker={worker} />
                  </IconButton>
                </ListItemIcon>
                <ListItemText
                  sx={{
                    color: worker.disabled ? '#888' : '#fff',
                  }}
                >{`WORKER #${i + 1}`}</ListItemText>
                {worker.canStopOrRerun() ? (
                  worker.stopped ? (
                    <IconButton size="small" onClick={onClickRunHandler(worker)}>
                      <PlayCircleFilledRounded fontSize="small" color="action" />
                    </IconButton>
                  ) : (
                    <IconButton size="small" onClick={onClickStopHandler(worker)}>
                      <StopCircleRounded fontSize="small" color="action" />
                    </IconButton>
                  )
                ) : (
                  <Fragment />
                )}
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

  appService.useOnDequeue();

  const onClickReset = appService.useOnResetFilesHandler('transcodingFiles');
  const onClickDeleteHandler = appService.useOnDeleteFileHandler('transcodingFiles');

  return (
    <Paper sx={{ width: 500, height: 630, overflow: 'auto' }}>
      <ListToolbar title="변환 대기">
        <Box>
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
