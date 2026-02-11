import { PrismaClient } from '@prisma/client';
const runtimeGlobal = globalThis;
const env = globalThis.process?.env;
const isProduction = env?.NODE_ENV === 'production';
function createPrismaClient() {
    try {
        return new PrismaClient();
    }
    catch {
        return null;
    }
}
const cachedClient = runtimeGlobal.prisma ?? createPrismaClient();
if (!isProduction) {
    runtimeGlobal.prisma = cachedClient;
}
export const prisma = cachedClient;
//# sourceMappingURL=index.js.map