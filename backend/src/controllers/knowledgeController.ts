import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok, fail } from '../utils/apiResponse';
import * as knowledgeService from '../services/knowledgeService';

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(), category: z.string().optional(),
});
export async function list(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await knowledgeService.listArticles(listSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const a = await knowledgeService.getArticle(req.params.slug);
    if (!a) { fail(res, 'Article not found', 404, 'NOT_FOUND'); return; }
    ok(res, a);
  } catch (e) { next(e); }
}
export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await knowledgeService.getKnowledgeSummary()); } catch (e) { next(e); }
}