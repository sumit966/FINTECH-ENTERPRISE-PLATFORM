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
// ---- Approval workflow --------------------------------------------------
// Approve and Reject both:
//   1) verify the request is still PENDING (409 otherwise)
//   2) set status + timestamp in a single update
//   3) write one auditLog row for the decision
// The actor's user id is passed from the controller (req.user.id).

export async function getLeaveDetail(id: string) {
  const l = await prisma.leave.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          employeeCode: true,
          fullName: true,
          email: true,
          manager: { select: { id: true, employeeCode: true, fullName: true, email: true } },
          department: { select: { code: true, name: true } },
          location: { select: { code: true, city: true } },
        },
      },
    },
  });
  if (!l) return null;

  // Audit trail: every auditLog row that references this leave record.
  const audit = await prisma.auditLog.findMany({
    where: { module: 'leave', recordId: id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, action: true, userId: true, createdAt: true, newValue: true },
  });

  return {
    id: l.id,
    employeeCode: l.employee.employeeCode,
    employeeName: l.employee.fullName,
    employeeEmail: l.employee.email,
    departmentCode: l.employee.department.code,
    departmentName: l.employee.department.name,
    locationCity: l.employee.location.city,
    manager: l.employee.manager
      ? {
          id: l.employee.manager.id,
          employeeCode: l.employee.manager.employeeCode,
          fullName: l.employee.manager.fullName,
          email: l.employee.manager.email,
        }
      : null,
    leaveType: l.leaveType,
    startDate: l.startDate,
    endDate: l.endDate,
    days: l.days,
    reason: l.reason,
    status: l.status,
    approvedAt: l.approvedAt,
    rejectionReason: l.rejectionReason,
    createdAt: l.createdAt,
    audit: audit.map((a) => ({
      id: a.id,
      action: a.action,
      userId: a.userId,
      at: a.createdAt,
      payload: a.newValue,
    })),
  };
}

export async function approveLeave(id: string, actorUserId: string | null) {
  const existing = await prisma.leave.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error('Leave request not found'), { status: 404, code: 'NOT_FOUND' });
  }
  if (existing.status !== 'PENDING') {
    throw Object.assign(new Error('Only PENDING requests can be approved'), { status: 409, code: 'CONFLICT' });
  }

  const now = new Date();
  const updated = await prisma.leave.update({
    where: { id },
    data: { status: 'APPROVED', approvedAt: now, rejectionReason: null },
  });

  await prisma.auditLog.create({
    data: {
      userId: actorUserId,
      action: 'APPROVE',
      module: 'leave',
      recordId: id,
      oldValue: { status: existing.status } as any,
      newValue: { status: 'APPROVED', at: now.toISOString() } as any,
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    approvedAt: updated.approvedAt,
    rejectionReason: updated.rejectionReason,
  };
}

export async function rejectLeave(id: string, reason: string, actorUserId: string | null) {
  if (!reason || reason.trim().length < 3) {
    throw Object.assign(new Error('Rejection reason is required (min 3 characters)'), { status: 422, code: 'VALIDATION' });
  }

  const existing = await prisma.leave.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error('Leave request not found'), { status: 404, code: 'NOT_FOUND' });
  }
  if (existing.status !== 'PENDING') {
    throw Object.assign(new Error('Only PENDING requests can be rejected'), { status: 409, code: 'CONFLICT' });
  }

  const now = new Date();
  const trimmed = reason.trim();
  const updated = await prisma.leave.update({
    where: { id },
    data: { status: 'REJECTED', approvedAt: now, rejectionReason: trimmed },
  });

  await prisma.auditLog.create({
    data: {
      userId: actorUserId,
      action: 'REJECT',
      module: 'leave',
      recordId: id,
      oldValue: { status: existing.status } as any,
      newValue: { status: 'REJECTED', reason: trimmed, at: now.toISOString() } as any,
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    approvedAt: updated.approvedAt,
    rejectionReason: updated.rejectionReason,
  };
}
