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
  void App.addListener('backButton', () => {
    const atHome = window.location.hash === '' || window.location.hash === '#/' || window.location.hash === '#';
    if (atHome) {
      void App.exitApp();
      return;
    }
    const before = window.location.hash;
    window.history.back();
    // No previous screen in the history (e.g. opened from a reminder): go to the home screen
    setTimeout(() => { if (window.location.hash === before) window.location.hash = '#/'; }, 350);
  });
  setTimeout(() => { void SplashScreen.hide({ fadeOutDuration: 250 }); }, 150);
}
