import { PrismaClient } from '@prisma/client';
import { isDevelopment } from './env';

export const prisma = new PrismaClient({
  log: isDevelopment ? ['warn', 'error'] : ['error'],
});

export async function shutdownPrisma(): Promise<void> {
  await prisma.$disconnect();
}