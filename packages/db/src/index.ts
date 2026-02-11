import { PrismaClient } from '@prisma/client';

type PrismaGlobal = typeof globalThis & { prisma?: PrismaClient };
const runtimeGlobal = globalThis as PrismaGlobal;

export const prisma = runtimeGlobal.prisma ?? new PrismaClient();

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const isProduction = env?.NODE_ENV === 'production';

if (!isProduction) {
  runtimeGlobal.prisma = prisma;
}
