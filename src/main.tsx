import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/index.css';
import App from './App';
import { initNativeApp } from '@/native/app';
import { initShareReceiver } from '@/native/share';
import { installErrorLog } from '@/services/errorLog';

installErrorLog();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

void initNativeApp();
void initShareReceiver();
