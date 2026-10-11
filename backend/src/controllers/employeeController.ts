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

export const createSchema = z.object({
  fullName: z.string().min(2).max(120),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNDISCLOSED']),
  email: z.string().email(),
  personalEmail: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(6).max(30),
  dateOfBirth: z.string().min(4),
  joiningDate: z.string().min(4),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'CONSULTANT']),
  employmentStatus: z.enum(['ACTIVE', 'PROBATION', 'ON_LEAVE', 'NOTICE_PERIOD']),
  experienceYears: z.coerce.number().int().min(0).max(60),
  salaryGrade: z.string().min(1).max(10),
  basicSalary: z.coerce.number().min(0),
  locationCode: z.string().min(1),
  departmentCode: z.string().min(1),
  teamCode: z.string().optional().or(z.literal('')),
  managerCode: z.string().optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
});

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createSchema.parse(req.body);
    const actorUserId = req.user?.id || null;
    const result = await employeeService.createEmployee(parsed as any, actorUserId);
    res.status(201).json({ success: true, data: result });
  } catch (e) { next(e); }
}

export async function nextCode(_req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, { employeeCode: await employeeService.generateNextEmployeeCode() });
  } catch (e) { next(e); }
}