import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok, fail } from '../utils/apiResponse';
import * as svc from '../services/examBuilderService';

export const createSchema = z.object({
  assessmentCode: z.string().min(2),
  title: z.string().min(2),
  description: z.string().optional(),
  durationMins: z.coerce.number().int().min(5).max(600),
  category: z.enum(['TECHNICAL', 'APTITUDE', 'CODING']),
  questionCodes: z.array(z.string()).min(1),
  passingMarks: z.coerce.number().int().min(0).optional(),
});

export async function list(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.listExams()); } catch (e) { next(e); }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const r = await svc.getExam(req.params.id);
    if (!r) { fail(res, 'Exam not found', 404, 'NOT_FOUND'); return; }
    ok(res, r);
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createSchema.parse(req.body);
    const r = await svc.createExam(parsed as any, req.user?.id || null);
    res.status(201).json({ success: true, data: r });
  } catch (e) { next(e); }
}

export async function publish(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.publishExam(req.params.id, req.user?.id || null)); } catch (e) { next(e); }
}

export async function unpublish(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.unpublishExam(req.params.id, req.user?.id || null)); } catch (e) { next(e); }
}

export async function questions(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.availableQuestions()); } catch (e) { next(e); }
}