import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok, fail } from '../utils/apiResponse';
import * as clientService from '../services/clientService';

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(),
  country: z.string().optional(),
  industry: z.string().optional(),
  status: z.string().optional(),
  slaTier: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await clientService.listClients(listSchema.parse(req.query) as any)); } catch (e) { next(e); }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const c = await clientService.getClientDetail(req.params.code);
    if (!c) { fail(res, 'Client not found', 404, 'NOT_FOUND'); return; }
    ok(res, c);
  } catch (e) { next(e); }
}

export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await clientService.getClientsSummary()); } catch (e) { next(e); }
}