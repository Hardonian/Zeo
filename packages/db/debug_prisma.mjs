import { createRequire } from 'module';
const require = createRequire(import.meta.url);
try {
  const path = require.resolve('@prisma/client');
  console.log('Resolving @prisma/client:', path);
  const prisma = require('@prisma/client');
  console.log('Loaded prisma client');
  if (prisma.PrismaClient) console.log('PrismaClient found');
  else console.log('PrismaClient MISSING');
} catch (e) {
  console.error('Failed:', e);
}
