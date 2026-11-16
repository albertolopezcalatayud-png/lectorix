import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/styles/index.css';
import App from './App';
import { initNativeApp } from '@/native/app';
import { initShareReceiver } from '@/native/share';
import { installErrorLog } from '@/services/errorLog';
import { Capacitor } from '@capacitor/core';

installErrorLog();
// The large-screen layout (side navigation, columns) is only for the web, never for the Android app
if (!Capacitor.isNativePlatform()) document.documentElement.classList.add('web');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

void initNativeApp();
void initShareReceiver();
