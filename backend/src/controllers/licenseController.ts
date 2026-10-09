import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok } from '../utils/apiResponse';
import * as licenseService from '../services/licenseService';

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(), status: z.string().optional(),
});
export async function list(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await licenseService.listLicenses(listSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await licenseService.getLicensesSummary()); } catch (e) { next(e); }
}