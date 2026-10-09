import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { shutdownPrisma } from './config/prisma';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info('nexus-backend listening on http://localhost:' + env.port);
});

async function shutdown(signal: string) {
  logger.info('Shutting down (' + signal + ')...');
  server.close(async () => {
    await shutdownPrisma();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));