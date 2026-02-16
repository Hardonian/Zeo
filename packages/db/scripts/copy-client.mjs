import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src/generated/client');
const destDir = path.resolve(__dirname, '../dist/generated/client');

if (fs.existsSync(srcDir)) {
  console.log(`Copying Prisma client from ${srcDir} to ${destDir}`);
  fs.mkdirSync(path.dirname(destDir), { recursive: true });
  fs.cpSync(srcDir, destDir, { recursive: true });
} else {
  console.warn('Prisma client source not found at', srcDir);
}
