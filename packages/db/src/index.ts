import { createRequire } from 'module';
import type { PrismaClient as PrismaClientType } from '@prisma/client';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');

type PrismaGlobal = typeof globalThis & { prisma?: PrismaClientType | null };
const runtimeGlobal = globalThis as PrismaGlobal;

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const isProduction = env?.NODE_ENV === 'production';

function createPrismaClient(): PrismaClientType | null {
  try {
    return new PrismaClient();
  } catch {
    return null;
  }
}

const cachedClient = runtimeGlobal.prisma ?? createPrismaClient();

if (!isProduction) {
  runtimeGlobal.prisma = cachedClient;
}

export const prisma = cachedClient as PrismaClientType;
