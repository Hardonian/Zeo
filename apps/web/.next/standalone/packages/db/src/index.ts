import { PrismaClient } from '@prisma/client';

type PrismaGlobal = typeof globalThis & { prisma?: PrismaClient | null };
const runtimeGlobal = globalThis as PrismaGlobal;

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const isProduction = env?.NODE_ENV === 'production';

function createPrismaClient(): PrismaClient | null {
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

export const prisma = cachedClient as PrismaClient;
