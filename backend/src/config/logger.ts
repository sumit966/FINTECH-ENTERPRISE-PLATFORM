import pino from 'pino';
import { env, isProduction } from './env';

export const logger = pino({
  level: env.logLevel,
  transport: isProduction ? undefined : { target: 'pino/file', options: { destination: 1 } },
});