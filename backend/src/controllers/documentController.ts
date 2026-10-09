import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok } from '../utils/apiResponse';
import * as docService from '../services/documentService';

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(), category: z.string().optional(), accessLevel: z.string().optional(),
});
export async function list(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await docService.listDocuments(listSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await docService.getDocumentsSummary()); } catch (e) { next(e); }
}