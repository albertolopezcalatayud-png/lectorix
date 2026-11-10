/** Android-app integration (Capacitor). Does nothing on the web. */
import { Capacitor } from '@capacitor/core';

export const isNativeApp = Capacitor.isNativePlatform();

export async function initNativeApp() {
  if (!isNativeApp) return;
  const [{ App }, { StatusBar, Style }, { SplashScreen }] = await Promise.all([
    import('@capacitor/app'),
    import('@capacitor/status-bar'),
    import('@capacitor/splash-screen'),
  ]);
  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#F7F5FF' });
  } catch { /* ignore */ }
  // System back button: go back inside the app; on the home screen, leave the app
  void App.addListener('backButton', ({ canGoBack }) => {
    const atHome = window.location.hash === '' || window.location.hash === '#/' || window.location.hash === '#';
    if (canGoBack && !atHome) window.history.back();
    else void App.exitApp();
  });
  setTimeout(() => { void SplashScreen.hide({ fadeOutDuration: 250 }); }, 150);
}
