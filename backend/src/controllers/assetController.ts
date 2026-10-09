import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok } from '../utils/apiResponse';
import * as assetService from '../services/assetService';

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(), type: z.string().optional(),
  status: z.string().optional(), locationCode: z.string().optional(),
});
export async function list(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await assetService.listAssets(listSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await assetService.getAssetsSummary()); } catch (e) { next(e); }
}