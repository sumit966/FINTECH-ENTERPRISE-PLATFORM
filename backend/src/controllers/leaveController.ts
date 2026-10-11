import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok } from '../utils/apiResponse';
import * as leaveService from '../services/leaveService';

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  employeeCode: z.string().optional(), status: z.string().optional(),
  leaveType: z.string().optional(), search: z.string().optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await leaveService.listLeave(listSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await leaveService.getLeaveSummary()); } catch (e) { next(e); }
}
export async function byDepartment(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await leaveService.getLeaveByDepartment()); } catch (e) { next(e); }
}
export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const d = await leaveService.getLeaveDetail(req.params.id);
    if (!d) { res.status(404).json({ success: false, error: 'Leave request not found', code: 'NOT_FOUND' }); return; }
    ok(res, d);
  } catch (e) { next(e); }
}

export const rejectSchema = z.object({ reason: z.string().min(3).max(500) });

export async function approve(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await leaveService.approveLeave(req.params.id, req.user?.id || null)); } catch (e) { next(e); }
}

export async function reject(req: Request, res: Response, next: NextFunction) {
  try {
    const { reason } = rejectSchema.parse(req.body);
    ok(res, await leaveService.rejectLeave(req.params.id, reason, req.user?.id || null));
  } catch (e) { next(e); }
}
