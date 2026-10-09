import { Request, Response, NextFunction } from 'express';
import { fail } from '../utils/apiResponse';

// Founder and director are superusers.
const SUPER_ROLES = new Set(['FOUNDER_CEO', 'DIRECTOR']);

export function requirePermission(code: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      fail(res, 'Not authenticated', 401, 'UNAUTHENTICATED');
      return;
    }
    if (user.roles.some((r) => SUPER_ROLES.has(r))) {
      next();
      return;
    }
    if (user.permissions.includes(code)) {
      next();
      return;
    }
    fail(res, 'Forbidden — missing permission: ' + code, 403, 'FORBIDDEN');
  };
}

export function requireAnyPermission(codes: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      fail(res, 'Not authenticated', 401, 'UNAUTHENTICATED');
      return;
    }
    if (user.roles.some((r) => SUPER_ROLES.has(r))) {
      next();
      return;
    }
    if (codes.some((c) => user.permissions.includes(c))) {
      next();
      return;
    }
    fail(res, 'Forbidden — missing one of: ' + codes.join(', '), 403, 'FORBIDDEN');
  };
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      fail(res, 'Not authenticated', 401, 'UNAUTHENTICATED');
      return;
    }
    if (user.roles.includes(role)) {
      next();
      return;
    }
    fail(res, 'Forbidden — missing role: ' + role, 403, 'FORBIDDEN');
  };
}