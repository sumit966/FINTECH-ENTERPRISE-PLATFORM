import { Request, Response, NextFunction } from 'express';
import { ok, fail } from '../utils/apiResponse';
import * as svc from '../services/financialService';

export async function getFinancials(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await svc.getProjectFinancials(req.params.code);
    if (!data) { fail(res, 'Project not found', 404, 'NOT_FOUND'); return; }
    ok(res, data);
  } catch (e) { next(e); }
}