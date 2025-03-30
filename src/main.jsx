import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme'; // ✅ dynamic theme function

const msalInstance = new PublicClientApplication(msalConfig);

const Main = () => {
  const [mode, setMode] = useState('light');

  return (
    <MsalProvider instance={msalInstance}>
      <ThemeProvider theme={getTheme(mode)}>
        <CssBaseline />
        <App toggleMode={() => setMode(mode === 'light' ? 'dark' : 'light')} />
      </ThemeProvider>
    </MsalProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);
