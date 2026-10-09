import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok, fail } from '../utils/apiResponse';
import * as svc from '../services/notificationService';

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  type: z.string().optional(),
  isRead: z.enum(['true','false']).optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    ok(res, await svc.listNotifications(userId, listSchema.parse(req.query) as any));
  } catch (e) { next(e); }
}
export async function markRead(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.markAsRead(req.user!.id, req.params.id)); } catch (e) { next(e); }
}
export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.markAllAsRead(req.user!.id)); } catch (e) { next(e); }
}