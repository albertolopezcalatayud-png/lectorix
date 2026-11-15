/** Android-app integration (Capacitor). Does nothing on the web. */
import { Capacitor, registerPlugin } from '@capacitor/core';

/** "#abc", "#aabbcc" or "rgb(r, g, b)" → "#AABBCC" */
export function toHex(c: string): string | null {
  const h = c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (h) return ('#' + (h[1].length === 3 ? [...h[1]].map((x) => x + x).join('') : h[1])).toUpperCase();
  const m = c.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/);
  return m ? ('#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('')).toUpperCase() : null;
}
/** Whether light icons are needed on this background */
export function isDark(hex: string): boolean {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) < 140;
}

export const isNativeApp = Capacitor.isNativePlatform();

export async function initNativeApp() {
  if (!isNativeApp) return;
  const [{ App }, { StatusBar, Style }, { SplashScreen }] = await Promise.all([
    import('@capacitor/app'),
    import('@capacitor/status-bar'),
    import('@capacitor/splash-screen'),
  ]);
  // Status bar and navigation bar (back, home, recent apps) take the colour of the app's background,
  // with their icons in a colour that can be seen on it. Repeated whenever the theme changes.
  const SystemBars = registerPlugin<{ set(o: { color: string; dark: boolean }): Promise<void> }>('SystemBars');
  let last = '';
  const paintBars = async () => {
    const color = toHex(getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim()) ?? '#FBF8F1';
    if (color === last) return;
    last = color;
    const dark = isDark(color);
    try {
      await SystemBars.set({ color, dark });
    } catch {
      // An older build of the Android app without the plugin: at least the status bar
      try { await StatusBar.setStyle({ style: dark ? Style.Dark : Style.Light }); await StatusBar.setBackgroundColor({ color }); } catch { /* ignore */ }
    }
  };
  void paintBars();
  new MutationObserver(() => void paintBars()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-contrast', 'class', 'style'] });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => void paintBars());
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
