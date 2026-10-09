import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok, fail } from '../utils/apiResponse';
import * as projectService from '../services/projectService';

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  industry: z.string().optional(),
  clientCode: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await projectService.listProjects(listSchema.parse(req.query) as any)); } catch (e) { next(e); }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const p = await projectService.getProjectDetail(req.params.code);
    if (!p) { fail(res, 'Project not found', 404, 'NOT_FOUND'); return; }
    ok(res, p);
  } catch (e) { next(e); }
}

export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await projectService.getProjectsSummary()); } catch (e) { next(e); }
}