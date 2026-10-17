import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
const root = process.cwd();
const copy = (source, destination) => {
  mkdirSync(dirname(destination), { recursive: true });
  if (
    !existsSync(destination) ||
    statSync(source).size !== statSync(destination).size ||
    statSync(source).mtimeMs > statSync(destination).mtimeMs
  )
    copyFileSync(source, destination);
};
const publicDir = join(root, 'public', 'ocr');
copy(
  join(root, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js'),
  join(publicDir, 'worker.min.js'),
);
copy(
  join(root, 'node_modules', 'tesseract.js', 'dist', 'worker.min.js.LICENSE.txt'),
  join(publicDir, 'worker.LICENSE.txt'),
);
const core = join(root, 'node_modules', 'tesseract.js-core');
for (const file of readdirSync(core))
  if (file.endsWith('.wasm.js')) copy(join(core, file), join(publicDir, 'core', file));
copy(join(core, 'LICENSE'), join(publicDir, 'core', 'LICENSE'));
copy(
  join(root, 'node_modules', '@tesseract.js-data', 'eng', '4.0.0', 'eng.traineddata.gz'),
  join(publicDir, 'lang', 'eng.traineddata.gz'),
);
console.log('Local OCR assets ready (worker, WebAssembly cores, English language data).');
