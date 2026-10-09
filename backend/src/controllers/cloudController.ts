import { Request, Response, NextFunction } from 'express';
import { ok } from '../utils/apiResponse';
import * as cloudService from '../services/cloudService';

export async function overview(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await cloudService.getCloudOverview()); } catch (e) { next(e); }
}