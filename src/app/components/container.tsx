import { FC, PropsWithChildren } from 'react';
import { Container } from '@mui/material';

export const PageContainer: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Container maxWidth="xl" sx={{ p: 4 }}>
      {children}
    </Container>
  );
};
