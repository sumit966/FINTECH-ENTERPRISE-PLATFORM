import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';
import { fail } from '../utils/apiResponse';

export function notFoundHandler(req: Request, res: Response): void {
  fail(res, 'Route not found: ' + req.method + ' ' + req.originalUrl, 404, 'NOT_FOUND');
}

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    const first = err.errors[0];
    fail(res, first ? (first.path.join('.') + ': ' + first.message) : 'Validation failed', 422, 'VALIDATION');
    return;
  }
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  if (status >= 500) logger.error({ err, url: req.originalUrl, method: req.method }, 'request failed');
  fail(res, message, status, err.code);
}