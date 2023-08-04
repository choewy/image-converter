import { FC } from 'react';
import { Box, Typography } from '@mui/material';

import { ListToolbarProps } from './interfaces';

export const ListToolbar: FC<ListToolbarProps> = ({ children, title }) => {
  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: '#292929' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography color="GrayText" sx={{ ml: 1 }}>
          {title}
        </Typography>
        {children}
      </Box>
    </Box>
  );
};
