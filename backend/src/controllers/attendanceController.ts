import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ok } from '../utils/apiResponse';
import * as attendanceService from '../services/attendanceService';

export const listSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(20),
  employeeCode: z.string().optional(), dateFrom: z.string().optional(), dateTo: z.string().optional(),
  status: z.string().optional(), workMode: z.string().optional(),
});

export async function list(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await attendanceService.listAttendance(listSchema.parse(req.query) as any)); } catch (e) { next(e); }
}
export async function summary(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await attendanceService.getAttendanceSummary()); } catch (e) { next(e); }
}
export async function trend(req: Request, res: Response, next: NextFunction) {
  try { ok(res, await attendanceService.getAttendanceTrend(Math.min(30, Number(req.query.days) || 14))); } catch (e) { next(e); }
}
export async function byDepartment(_req: Request, res: Response, next: NextFunction) {
  try { ok(res, await attendanceService.getAttendanceByDepartment()); } catch (e) { next(e); }
}