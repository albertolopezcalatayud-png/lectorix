// After the app build: unpack the OCR language data (Android renames .gz assets).
import { readdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
const dir = 'dist-app/tesseract/lang';
for (const f of readdirSync(dir)) {
  if (!f.endsWith('.gz')) continue;
  writeFileSync(`${dir}/${f.slice(0, -3)}`, gunzipSync(readFileSync(`${dir}/${f}`)));
  unlinkSync(`${dir}/${f}`);
  console.log('unpacked', f);
}
