import { Request, Response, NextFunction } from 'express';
import { ok } from '../utils/apiResponse';
import * as svc from '../services/execService';

export async function snapshot(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.getExecutiveSnapshot()); } catch (e) { next(e); }
}
export async function orgTree(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.getOrgTree()); } catch (e) { next(e); }
}
export async function revenueTrend(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.getRevenueTrend(Math.min(24, Number(req.query.months) || 12))); } catch (e) { next(e); }
}
export async function riskRadar(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.getRiskRadar()); } catch (e) { next(e); }
}