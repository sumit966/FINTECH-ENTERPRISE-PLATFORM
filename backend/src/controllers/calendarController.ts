import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok } from '../utils/apiResponse';
import * as svc from '../services/calendarService';

export const listSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  category: z.string().optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.listEvents(listSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.getCalendarSummary()); } catch (e) { next(e); }
}