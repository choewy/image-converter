import './index.css';

import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';

import { RecoilRoot, RecoilEnv } from 'recoil';
import { CssBaseline, ThemeProvider } from '@mui/material';

import { theme } from '@/theme';
import { App } from '@/app';
import { IpcController } from '@/ipc';

RecoilEnv.RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED = false;

IpcController.define();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ThemeProvider theme={theme}>
    <RecoilRoot>
      <CssBaseline />
      <App />
    </RecoilRoot>
  </ThemeProvider>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
