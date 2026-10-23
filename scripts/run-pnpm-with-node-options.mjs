#!/usr/bin/env node

import { spawn } from "node:child_process";

const suppliedArgs = process.argv.slice(2);
const heapSizeArgument = suppliedArgs.find((argument) => argument.startsWith("--heap-mb="));
const args = suppliedArgs.filter((argument) => argument !== heapSizeArgument);
const heapSize = heapSizeArgument === undefined ? 4096 : Number(heapSizeArgument.slice("--heap-mb=".length));

if (!Number.isSafeInteger(heapSize) || heapSize < 256) {
  console.error("--heap-mb must be an integer of at least 256.");
  process.exitCode = 1;
} else if (args.length === 0) {
  console.error("Usage: node scripts/run-pnpm-with-node-options.mjs <pnpm arguments>");
  process.exitCode = 1;
} else {
  const pnpmEntrypoint = process.env.npm_execpath;
  const command = pnpmEntrypoint === undefined
    ? (process.platform === "win32" ? "pnpm.cmd" : "pnpm")
    : process.execPath;
  const commandArguments = pnpmEntrypoint === undefined ? args : [pnpmEntrypoint, ...args];
  const child = spawn(command, commandArguments, {
    cwd: process.cwd(),
    env: { ...process.env, NODE_OPTIONS: `--max-old-space-size=${heapSize}` },
    shell: pnpmEntrypoint === undefined && process.platform === "win32",
    stdio: "inherit",
  });
  child.once("error", (error) => {
    console.error(`Unable to start pnpm: ${error.message}`);
    process.exitCode = 1;
  });
  child.once("exit", (code, signal) => {
    if (signal !== null) {
      console.error(`pnpm terminated by signal ${signal}.`);
      process.exitCode = 1;
      return;
    }
    process.exitCode = code ?? 1;
  });
}
