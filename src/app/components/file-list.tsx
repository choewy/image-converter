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
import { CloudDone, Delete, Error, PlayArrow, Refresh } from '@mui/icons-material';

import { appService } from '../app.service';

export const SelectFileList: FC = () => {
  const selectFiles = appService.selectFiles;

  const onClickStart = appService.useOnStartTranscodeFiles();
  const onClickReset = appService.useOnResetSelectFiles();
  const onClickDeleteHandler = appService.useOnDeleteSelectFileHandler();

  return (
    <Paper sx={{ width: 500, height: 630, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography color="GrayText" sx={{ ml: 1 }}>
          선택한 파일 목록
        </Typography>
        <Box>
          <IconButton disabled={selectFiles.length === 0} onClick={onClickStart}>
            <PlayArrow />
          </IconButton>
          <IconButton disabled={selectFiles.length === 0} onClick={onClickReset}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <List>
        {selectFiles.map((file, index) => (
          <ListItem key={file.key}>
            <ListItemIcon>{file.hasError ? <Error color="error" /> : <CloudDone color="info" />}</ListItemIcon>
            <ListItemText>{file.name}</ListItemText>
            <IconButton onClick={onClickDeleteHandler(index)}>
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
  const onClickDeleteHandler = appService.useOnDeleteSelectFileHandler();

  return (
    <Paper sx={{ width: 500, height: 630, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography color="GrayText" sx={{ ml: 1 }}>
          변환중인 파일 목록
        </Typography>
        <Box>
          <IconButton disabled={transcodingFiles.length === 0} onClick={onClickReset}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <List>
        {transcodingFiles.map((file, index) => (
          <Fragment key={file.key}>
            <ListItem key={file.key}>
              <ListItemIcon>{file.hasError ? <Error color="error" /> : <CloudDone color="info" />}</ListItemIcon>
              <ListItemText>{file.name}</ListItemText>
              <LinearProgress variant="determinate" value={file.progress} />
              <IconButton onClick={onClickDeleteHandler(index)}>
                <Delete />
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
  const onClickDeleteHandler = appService.useOnDeleteSelectFileHandler();

  return (
    <Paper sx={{ width: 500, height: 630, overflow: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography color="GrayText" sx={{ ml: 1 }}>
          변환 완료된 파일 목록
        </Typography>
        <Box>
          <IconButton disabled={completeFiles.length === 0} onClick={onClickReset}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>
      <Divider />
      <List>
        {completeFiles.map((file, index) => (
          <ListItem key={file.key}>
            <ListItemIcon>{file.hasError ? <Error color="error" /> : <CloudDone color="info" />}</ListItemIcon>
            <ListItemText>{file.name}</ListItemText>
            <IconButton onClick={onClickDeleteHandler(index)}>
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
