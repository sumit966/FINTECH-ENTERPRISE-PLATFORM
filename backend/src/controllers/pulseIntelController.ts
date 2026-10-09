import { Request, Response, NextFunction } from 'express';
import { ok, fail } from '../utils/apiResponse';
import * as svc from '../services/pulseIntelService';

export async function kpis(req: Request, res: Response, next: NextFunction) {
  try {
    const category = req.query.category as string | undefined;
    ok(res, await svc.listKpis({ category }));
  } catch (e) { next(e); }
}

export async function kpiDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const k = await svc.getKpiByCode(req.params.code);
    if (!k) { fail(res, 'KPI not found', 404, 'NOT_FOUND'); return; }
    ok(res, k);
  } catch (e) { next(e); }
}

export async function scores(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.getCategoryScores()); } catch (e) { next(e); }
}

export async function health(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.getOverallHealth()); } catch (e) { next(e); }
}