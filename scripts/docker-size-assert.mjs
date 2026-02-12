#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createGzip } from 'node:zlib';

const image = process.env.ZEO_DOCKER_IMAGE ?? 'zeolite:dev';
const baselineImage = process.env.ZEO_DOCKER_BASELINE_IMAGE;
const maxCompressedBytes = Number(process.env.ZEO_DOCKER_MAX_COMPRESSED_BYTES ?? 250_000_000);
const maxDeltaBytes = Number(process.env.ZEO_DOCKER_MAX_DELTA_COMPRESSED_BYTES ?? 25_000_000);

function compressedBytesForImage(tag) {
  return new Promise((resolve, reject) => {
    const docker = spawn('docker', ['image', 'save', tag], { stdio: ['ignore', 'pipe', 'pipe'] });
    const gzip = createGzip({ level: 9 });
    let total = 0;
    let stderr = '';

    docker.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error("docker executable not found; install Docker to run image size checks"));
        return;
      }
      reject(error);
    });

    docker.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    gzip.on('data', (chunk) => {
      total += chunk.length;
    });

    gzip.on('error', (error) => reject(error));

    docker.stdout.pipe(gzip);

    gzip.on('end', () => {
      if (docker.exitCode !== 0) {
        reject(new Error(stderr || `docker image save failed for ${tag}`));
        return;
      }
      resolve(total);
    });

    docker.on('close', (code) => {
      if (code !== 0) {
        gzip.destroy(new Error(stderr || `docker image save exited with status ${code}`));
      }
    });
  });
}

try {
  const currentBytes = await compressedBytesForImage(image);
  console.log(`[docker-size] ${image} compressed bytes=${currentBytes}`);

  if (currentBytes > maxCompressedBytes) {
    console.error(`[docker-size] threshold failed: ${currentBytes} > max ${maxCompressedBytes}`);
    process.exit(1);
  }

  if (baselineImage) {
    const baselineBytes = await compressedBytesForImage(baselineImage);
    const delta = currentBytes - baselineBytes;
    console.log(`[docker-size] baseline ${baselineImage} compressed bytes=${baselineBytes}`);
    console.log(`[docker-size] delta bytes=${delta}`);

    if (delta > maxDeltaBytes) {
      console.error(`[docker-size] delta threshold failed: ${delta} > max ${maxDeltaBytes}`);
      process.exit(1);
    }
  }

  console.log('[docker-size] thresholds passed');
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[docker-size] ${message}`);
  process.exit(2);
}
