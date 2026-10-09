import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok, fail } from '../utils/apiResponse';
import * as examService from '../services/examService';

export const qListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(), category: z.string().optional(),
  difficulty: z.string().optional(), type: z.string().optional(),
});
export const attemptListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(), status: z.string().optional(), assessmentCode: z.string().optional(),
});

export async function questions(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await examService.listQuestions(qListSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function assessments(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await examService.listAssessments()); } catch (e) { next(e); }
}
export async function assessmentDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const a = await examService.getAssessmentDetail(req.params.code);
    if (!a) { fail(res, 'Assessment not found', 404, 'NOT_FOUND'); return; }
    ok(res, a);
  } catch (e) { next(e); }
}
export async function attempts(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await examService.listAttempts(attemptListSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await examService.getExamsSummary()); } catch (e) { next(e); }
}