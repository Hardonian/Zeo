#!/usr/bin/env node

import { spawn } from "node:child_process";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/run-pnpm-with-node-options.mjs <pnpm arguments>");
  process.exitCode = 1;
} else {
  const executable = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const child = spawn(executable, args, {
    cwd: process.cwd(),
    env: { ...process.env, NODE_OPTIONS: "--max-old-space-size=4096" },
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
