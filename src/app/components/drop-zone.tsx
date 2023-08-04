import { FC } from 'react';
import { useDropzone } from 'react-dropzone';

import { Box, Input, Paper, Typography } from '@mui/material';

import { appService } from '../app.service';

export const FileDropZone: FC = () => {
  const pushSelectFiles = appService.useOnPushSelecetFiles();

  const dropHook = useDropzone({
    onDrop: pushSelectFiles,
    useFsAccessApi: false,
    accept: {
      'image/*': ['.jpg', '.jpe', '.jpeg', '.png', '.webp', '.gif', '.tif', '.tiff'],
      'video/*': ['.webp', '.mp4', 'm4v', '.avi', '.wmv', '.mwa', '.asf', '.mkv', '.mov'],
    },
  });

  const boxProps = dropHook.getRootProps();
  const inputProps = dropHook.getInputProps();

  return (
    <Paper
      {...boxProps}
      elevation={3}
      sx={{
        p: 2,
        pb: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <Typography color="GrayText" component="h5" alignItems="center" justifyContent="center">
        파일을 드래그하거나, 아이콘을 클릭하여 변환할 파일을 추가하세요.
      </Typography>
      <Box mt={3}>
        <Box>
          <Box
            sx={{
              width: 100,
              height: 100,
              background: 'url("./assets/images/file-upload-image.png")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'multiply',
              opacity: 0.2,
            }}
          />
        </Box>
        <Input type="file" inputProps={inputProps} />
      </Box>
    </Paper>
  );
};
