import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

export interface ListLeaveParams {
  page: number; pageSize: number;
  employeeCode?: string; status?: string; leaveType?: string; search?: string;
}

export async function listLeave(params: ListLeaveParams) {
  const { page, pageSize, employeeCode, status, leaveType, search } = params;
  const where: Prisma.LeaveWhereInput = {};
  if (status) where.status = status as any;
  if (leaveType) where.leaveType = leaveType as any;
  if (employeeCode) where.employee = { employeeCode };
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { employee: { fullName: { contains: q, mode: 'insensitive' } } },
      { employee: { employeeCode: { contains: q, mode: 'insensitive' } } },
      { reason: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.leave.count({ where }),
    prisma.leave.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { startDate: 'desc' },
      include: {
        employee: {
          select: {
            employeeCode: true, fullName: true,
            department: { select: { code: true, name: true } },
            location: { select: { code: true, city: true } },
          },
        },
      },
    }),
  ]);

  const items = rows.map((l) => ({
    id: l.id,
    employeeCode: l.employee.employeeCode,
    employeeName: l.employee.fullName,
    departmentCode: l.employee.department.code,
    departmentName: l.employee.department.name,
    locationCity: l.employee.location.city,
    leaveType: l.leaveType,
    startDate: l.startDate,
    endDate: l.endDate,
    days: l.days,
    reason: l.reason,
    status: l.status,
    approvedAt: l.approvedAt,
    rejectionReason: l.rejectionReason,
  }));
  return paginated(items, page, pageSize, total);
}

export async function getLeaveSummary() {
  const [total, byStatus, byType, approvedDays] = await Promise.all([
    prisma.leave.count(),
    prisma.leave.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.leave.groupBy({ by: ['leaveType'], _count: { _all: true }, _sum: { days: true } }),
    prisma.leave.aggregate({ _sum: { days: true }, where: { status: 'APPROVED' } }),
  ]);

  return {
    total,
    totalDaysApproved: approvedDays._sum.days || 0,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
    byType: byType.map((t) => ({ leaveType: t.leaveType, count: t._count._all, days: t._sum.days || 0 })).sort((a, b) => b.count - a.count),
  };
}

export async function getLeaveByDepartment() {
  const rows = await prisma.leave.groupBy({
    by: ['employeeId'],
    _count: { _all: true },
    _sum: { days: true },
  });
  const emps = await prisma.employee.findMany({
    select: { id: true, department: { select: { code: true, name: true } } },
  });
  const deptByEmp = new Map(emps.map((e) => [e.id, e.department]));

  const byDept: Record<string, { departmentCode: string; departmentName: string; requests: number; days: number }> = {};
  for (const r of rows) {
    const dept = deptByEmp.get(r.employeeId);
    if (!dept) continue;
    if (!byDept[dept.code]) byDept[dept.code] = { departmentCode: dept.code, departmentName: dept.name, requests: 0, days: 0 };
    byDept[dept.code].requests += r._count._all;
    byDept[dept.code].days += r._sum.days || 0;
  }
  return Object.values(byDept).sort((a, b) => b.days - a.days);
}