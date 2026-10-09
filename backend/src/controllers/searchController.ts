import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok } from '../utils/apiResponse';
import * as svc from '../services/searchService';

export const searchSchema = z.object({ q: z.string().min(1).max(200) });

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const { q } = searchSchema.parse(req.query);
    const user = req.user!;
    ok(res, await svc.globalSearch(q, { roles: user.roles, permissions: user.permissions }));
  } catch (e) { next(e); }
}