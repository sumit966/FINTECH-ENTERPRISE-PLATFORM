import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok } from '../utils/apiResponse';
import * as financeService from '../services/financeService';

export const invoiceListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  status: z.string().optional(), currency: z.string().optional(),
  clientCode: z.string().optional(), search: z.string().optional(),
  year: z.coerce.number().int().optional(),
});

export const expenseListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  category: z.string().optional(), status: z.string().optional(), search: z.string().optional(),
});

export async function invoices(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await financeService.listInvoices(invoiceListSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function expenses(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await financeService.listExpenses(expenseListSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await financeService.getFinanceSummary()); } catch (e) { next(e); }
}
export async function revenueVsExpenses(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await financeService.getRevenueVsExpenses(Math.min(24, Number(req.query.months) || 12))); } catch (e) { next(e); }
}
export async function expenseBreakdown(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await financeService.getExpenseBreakdown()); } catch (e) { next(e); }
}
export async function topClients(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await financeService.getTopClientsByRevenue(Math.min(20, Number(req.query.limit) || 10))); } catch (e) { next(e); }
}