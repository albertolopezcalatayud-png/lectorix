/**
 * "Share with Lectorix": text or a photo shared from another app opens in "Adapt my homework".
 * Android: ShareReceiverPlugin.java. Installed web app: Web Share Target (text only, see vite.config.ts).
 * The content stays on the device.
 */
import { create } from 'zustand';
import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';

export type Shared = { kind: 'text'; text: string; subject?: string } | { kind: 'image'; dataUrl: string } | { kind: 'too-big' };

export const useShareInbox = create<{ item: Shared | null; put: (s: Shared) => void; take: () => Shared | null }>()((set, get) => ({
  item: null,
  put: (item) => set({ item }),
  take: () => { const i = get().item; set({ item: null }); return i; },
}));

interface ShareReceiver {
  takePending(): Promise<{ data?: Shared }>;
  addListener(e: 'shared', cb: (d: Shared) => void): Promise<PluginListenerHandle>;
}

const open = (s: Shared) => {
  useShareInbox.getState().put(s);
  if (window.location.hash !== '#/adaptar') window.location.hash = '#/adaptar';
};

export async function initShareReceiver() {
  // Web Share Target: /lectorix/?text=...&title=...&url=...
  const q = new URLSearchParams(window.location.search);
  const text = [q.get('title'), q.get('text'), q.get('url')].filter(Boolean).join('\n\n').trim();
  if (q.has('share') || q.has('text')) {
    history.replaceState(null, '', window.location.pathname + window.location.hash);
    if (text) open({ kind: 'text', text: text.slice(0, 20000) });
  }
  if (!Capacitor.isNativePlatform()) return;
  try {
    const plugin = registerPlugin<ShareReceiver>('ShareReceiver');
    await plugin.addListener('shared', open);
    const { data } = await plugin.takePending();
    if (data) open(data);
  } catch { /* older app without the plugin */ }
}
