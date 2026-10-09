import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok, fail } from '../utils/apiResponse';
import * as svc from '../services/engineeringService';

const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(),
};
export const repoListSchema = z.object({ ...pagination, language: z.string().optional(), provider: z.string().optional() });
export const prListSchema = z.object({ ...pagination, status: z.string().optional(), repoCode: z.string().optional() });
export const buildListSchema = z.object({ ...pagination, status: z.string().optional(), repoCode: z.string().optional() });
export const deploymentListSchema = z.object({ ...pagination, status: z.string().optional(), environment: z.string().optional(), projectCode: z.string().optional() });

export async function repos(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.listRepos(repoListSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function repoDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const r = await svc.getRepoDetail(req.params.code);
    if (!r) { fail(res, 'Repository not found', 404, 'NOT_FOUND'); return; }
    ok(res, r);
  } catch (e) { next(e); }
}
export async function pullRequests(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.listPullRequests(prListSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function builds(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.listBuilds(buildListSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function deployments(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.listDeployments(deploymentListSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.getEngineeringSummary()); } catch (e) { next(e); }
}