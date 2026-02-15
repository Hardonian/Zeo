#!/usr/bin/env node
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: validate-commit-msg.mjs <commit_msg_file>');
  process.exit(1);
}

const message = fs.readFileSync(file, 'utf8').split('\n')[0].trim();
const commitPattern = /^(feat|fix|docs|style|refactor|test|chore|ci|perf|build|revert)(\([\w\-/]+\))?!?: .{5,72}$/;

if (!commitPattern.test(message)) {
  console.error('Invalid commit message format. Use: type(scope): summary');
  console.error('Example: feat(web): add 90-day activity filter');
  process.exit(1);
}
