// Typed environment loader. Loads .env at import time.

import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const v = process.env[name];
  if (v === undefined || v === '') {
    if (fallback !== undefined) return fallback;
    throw new Error('Missing required environment variable: ' + name);
  }
  return v;
}

function optional(name: string, fallback: string): string {
  const v = process.env[name];
  return v === undefined || v === '' ? fallback : v;
}

export const env = {
  nodeEnv:        optional('NODE_ENV', 'development'),
  port:           Number(optional('BACKEND_PORT', '4000')),
  corsOrigin:     optional('CORS_ORIGIN', 'http://localhost:5173'),
  databaseUrl:    required('DATABASE_URL'),
  jwtSecret:      required('JWT_SECRET', 'dev-only-secret-change-me-32-chars-minimum'),
  jwtExpiresIn:   optional('JWT_EXPIRES_IN', '8h'),
  bcryptRounds:   Number(optional('BCRYPT_ROUNDS', '12')),
  aiProvider:     optional('AI_PROVIDER', 'mock'),
  aiApiKey:       optional('AI_API_KEY', ''),
  logLevel:       optional('LOG_LEVEL', 'info'),
};

export const isProduction = env.nodeEnv === 'production';
export const isDevelopment = env.nodeEnv === 'development';