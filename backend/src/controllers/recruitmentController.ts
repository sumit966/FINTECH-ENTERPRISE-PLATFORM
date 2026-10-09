import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok, fail } from '../utils/apiResponse';
import * as recruitmentService from '../services/recruitmentService';

export const jobListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(), status: z.string().optional(),
  departmentCode: z.string().optional(), locationCode: z.string().optional(),
});
export const candidateListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(), stage: z.string().optional(), jobCode: z.string().optional(),
});

export async function jobs(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await recruitmentService.listJobs(jobListSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function candidates(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await recruitmentService.listCandidates(candidateListSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function candidateDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await recruitmentService.getCandidateDetail(req.params.code);
    if (!c) { fail(res, 'Candidate not found', 404, 'NOT_FOUND'); return; }
    ok(res, c);
  } catch (e) { next(e); }
}
export async function pipeline(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await recruitmentService.getPipeline()); } catch (e) { next(e); }
}
export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await recruitmentService.getRecruitmentSummary()); } catch (e) { next(e); }
}
export async function interviews(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await recruitmentService.listUpcomingInterviews(Math.min(50, Number(req.query.limit) || 20))); } catch (e) { next(e); }
}