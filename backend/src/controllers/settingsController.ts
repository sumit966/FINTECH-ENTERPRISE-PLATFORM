import { Request, Response, NextFunction } from 'express';
import { ok } from '../utils/apiResponse';
import * as svc from '../services/settingsService';

export async function overview(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.getSystemOverview()); } catch (e) { next(e); }
}
export async function integrations(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.getIntegrations()); } catch (e) { next(e); }
}
export function about(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, svc.getAbout()); } catch (e) { next(e); }
}