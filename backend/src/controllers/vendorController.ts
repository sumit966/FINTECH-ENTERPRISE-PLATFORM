import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok } from '../utils/apiResponse';
import * as vendorService from '../services/vendorService';

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(), category: z.string().optional(),
  status: z.string().optional(), country: z.string().optional(),
});
export const poListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(), status: z.string().optional(), vendorCode: z.string().optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await vendorService.listVendors(listSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function purchaseOrders(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await vendorService.listPurchaseOrders(poListSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await vendorService.getVendorsSummary()); } catch (e) { next(e); }
}