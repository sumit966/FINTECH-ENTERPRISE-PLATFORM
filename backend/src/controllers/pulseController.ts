import { Request, Response, NextFunction } from 'express';
import { ok } from '../utils/apiResponse';
import * as pulseService from '../services/pulseService';

export async function overview(_req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await pulseService.getOverview());
  } catch (e) { next(e); }
}

export async function headcountByLocation(_req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await pulseService.getHeadcountByLocation());
  } catch (e) { next(e); }
}

export async function headcountByDepartment(_req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await pulseService.getHeadcountByDepartment());
  } catch (e) { next(e); }
}

export async function projectsByStatus(_req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, await pulseService.getProjectsByStatus());
  } catch (e) { next(e); }
}

export async function recentProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(50, Number(req.query.limit) || 10);
    ok(res, await pulseService.getRecentProjects(limit));
  } catch (e) { next(e); }
}

export async function topClients(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(20, Number(req.query.limit) || 5);
    ok(res, await pulseService.getTopClientsByRevenue(limit));
  } catch (e) { next(e); }
}

export async function recentAlerts(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(20, Number(req.query.limit) || 8);
    ok(res, await pulseService.getRecentAlerts(limit));
  } catch (e) { next(e); }
}

export async function payrollTrend(req: Request, res: Response, next: NextFunction) {
  try {
    const months = Math.min(24, Number(req.query.months) || 6);
    ok(res, await pulseService.getPayrollTrend(months));
  } catch (e) { next(e); }
}