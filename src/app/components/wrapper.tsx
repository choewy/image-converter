import { FC, PropsWithChildren } from 'react';

import { Box } from '@mui/material';

export const ListWrapper: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Box display="flex" justifyContent="center" gap={3} mt={3}>
      {children}
    </Box>
  );
};
