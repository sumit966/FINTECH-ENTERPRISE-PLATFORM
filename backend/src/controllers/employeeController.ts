import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok, fail } from '../utils/apiResponse';
import * as employeeService from '../services/employeeService';

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  search: z.string().optional(),
  locationCode: z.string().optional(),
  departmentCode: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const params = listQuerySchema.parse(req.query);
    ok(res, await employeeService.listEmployees(params as any));
  } catch (e) { next(e); }
}

export async function detail(req: Request, res: Response, next: NextFunction) {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    if (!employee) { fail(res, 'Employee not found', 404, 'NOT_FOUND'); return; }
    ok(res, employee);
  } catch (e) { next(e); }
}

export async function stats(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await employeeService.getEmployeeStats()); } catch (e) { next(e); }
}

export async function orgTree(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await employeeService.getOrgTree()); } catch (e) { next(e); }
}