import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok } from '../utils/apiResponse';
import * as svc from '../services/biometricService';

export const createSchema = z.object({
  deviceCode: z.string().min(2),
  name: z.string().min(2),
  vendor: z.string().min(2),
  model: z.string().min(1),
  locationCode: z.string().min(2),
  ipAddress: z.string().optional(),
  integrationType: z.string().optional(),
  notes: z.string().optional(),
});

export async function list(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.listDevices()); } catch (e) { next(e); }
}
export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await svc.getSummary()); } catch (e) { next(e); }
}
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createSchema.parse(req.body);
    const r = await svc.createDevice(parsed, req.user?.id || null);
    res.status(201).json({ success: true, data: r });
  } catch (e) { next(e); }
}