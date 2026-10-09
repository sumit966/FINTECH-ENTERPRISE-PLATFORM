import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok } from '../utils/apiResponse';
import * as svc from '../services/auditService';

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
  search: z.string().optional(),
  action: z.string().optional(),
  module: z.string().optional(),
  userEmail: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.listAuditLogs(listSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.getAuditSummary()); } catch (e) { next(e); }
}