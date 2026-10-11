import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok } from '../utils/apiResponse';
import * as svc from '../services/automationService';

export const toggleSchema = z.object({ enabled: z.coerce.boolean() });

export async function rules(_req: Request, res: Response, next: NextFunction) {
  try { await svc.ensureNewRules(); ok(res, await svc.listRules()); } catch (e) { next(e); }
}
export async function logs(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.listRunLogs(Math.min(200, Number(req.query.limit) || 50))); } catch (e) { next(e); }
}
export async function toggle(req: Request, res: Response, next: NextFunction) {
  try {
    const { enabled } = toggleSchema.parse(req.body);
    ok(res, await svc.toggleRule(req.params.id, enabled, req.user?.id || null));
  } catch (e) { next(e); }
}
export async function simulate(req: Request, res: Response, next: NextFunction) {
  try { res.status(201).json({ success: true, data: await svc.simulateRun(req.params.code, req.user?.id || null) }); } catch (e) { next(e); }
}