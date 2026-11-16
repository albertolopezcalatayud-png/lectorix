/**
 * Saves a text file on the device. Android app: the system "save as" screen (SaveFilePlugin.java).
 * Web: a normal download. Returns false if the user cancelled or it could not be saved.
 */
import { Capacitor, registerPlugin } from '@capacitor/core';

const native = Capacitor.isNativePlatform() ? registerPlugin<{ save(o: { name: string; text: string; mime: string }): Promise<{ saved: boolean }> }>('SaveFile') : null;

export async function saveTextFile(name: string, text: string, mime = 'application/json'): Promise<boolean> {
  if (native) { try { return (await native.save({ name, text, mime })).saved; } catch { return false; } }
  try {
    const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
    const a = document.createElement('a'); a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    return true;
  } catch { return false; }
}
