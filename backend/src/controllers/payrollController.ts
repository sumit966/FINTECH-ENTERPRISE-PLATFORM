import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok } from '../utils/apiResponse';
import * as payrollService from '../services/payrollService';

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  departmentCode: z.string().optional(),
  locationCode: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await payrollService.listPayroll(listSchema.parse(req.query) as any)); } catch (e) { next(e); }
}

export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await payrollService.getPayrollSummary()); } catch (e) { next(e); }
}

export async function trend(req: Request, res: Response, next: NextFunction) {
  try {
    const months = Math.min(24, Number(req.query.months) || 12);
    ok(res, await payrollService.getPayrollMonthlyTrend(months));
  } catch (e) { next(e); }
}

export async function byDepartment(req: Request, res: Response, next: NextFunction) {
  try {
    const month = Number(req.query.month) || new Date().getUTCMonth() + 1;
    const year = Number(req.query.year) || new Date().getUTCFullYear();
    ok(res, await payrollService.getPayrollByDepartment(month, year));
  } catch (e) { next(e); }
}

export async function employeeHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(60, Number(req.query.limit) || 24);
    ok(res, await payrollService.getEmployeePayrollHistory(req.params.employeeCode, limit));
  } catch (e) { next(e); }
}