import { Request, Response, NextFunction } from 'express';
import { ok, fail } from '../utils/apiResponse';
import * as svc from '../services/fundingService';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try { await svc.ensureFundingSeeded(); ok(res, await svc.listFunding()); } catch (e) { next(e); }
}

export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { await svc.ensureFundingSeeded(); ok(res, await svc.getFundingSummary()); } catch (e) { next(e); }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const r = await svc.getFundingDetail(req.params.code);
    if (!r) { fail(res, 'Funding record not found', 404, 'NOT_FOUND'); return; }
    ok(res, r);
  } catch (e) { next(e); }
}