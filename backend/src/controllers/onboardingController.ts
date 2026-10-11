import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok, fail } from '../utils/apiResponse';
import * as svc from '../services/onboardingService';

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  status: z.string().optional(),
});

export const startSchema = z.object({ employeeCode: z.string().min(1) });

export async function list(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.listOnboarding(listSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const r = await svc.getOnboardingDetail(req.params.id);
    if (!r) { fail(res, 'Onboarding record not found', 404, 'NOT_FOUND'); return; }
    ok(res, r);
  } catch (e) { next(e); }
}
export async function start(req: Request, res: Response, next: NextFunction) {
  try {
    const { employeeCode } = startSchema.parse(req.body);
    const r = await svc.startOnboarding(employeeCode, req.user?.id || null);
    res.status(201).json({ success: true, data: r });
  } catch (e) { next(e); }
}
export async function completeTask(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await svc.completeTask(req.params.taskId, req.user?.id || null));
  } catch (e) { next(e); }
}