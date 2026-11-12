/**
 * Print or save as PDF an HTML document (family report, paper worksheets).
 * Android app: the system print screen (HtmlPrintPlugin.java), which also offers "Save as PDF".
 * Web: a print window; if pop-ups are blocked, a hidden frame.
 */
import { Capacitor, registerPlugin } from '@capacitor/core';

const native = Capacitor.isNativePlatform() ? registerPlugin<{ print(o: { html: string; name: string }): Promise<void> }>('HtmlPrint') : null;

export async function printHtml(html: string, name: string): Promise<boolean> {
  if (native) {
    try { await native.print({ html, name }); return true; } catch { return false; }
  }
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => { try { win.focus(); win.print(); } catch { /* closed */ } }, 400);
    return true;
  }
  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.open(); doc.write(html); doc.close();
  setTimeout(() => { frame.contentWindow?.print(); setTimeout(() => frame.remove(), 60000); }, 400);
  return true;
}
