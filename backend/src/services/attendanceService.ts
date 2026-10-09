import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

export interface ListAttendanceParams {
  page: number; pageSize: number;
  employeeCode?: string; dateFrom?: string; dateTo?: string;
  status?: string; workMode?: string;
}

export async function listAttendance(params: ListAttendanceParams) {
  const { page, pageSize, employeeCode, dateFrom, dateTo, status, workMode } = params;
  const where: Prisma.AttendanceWhereInput = {};
  if (status) where.status = status as any;
  if (workMode) where.workMode = workMode;
  if (employeeCode) where.employee = { employeeCode };
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) (where.date as any).gte = new Date(dateFrom);
    if (dateTo) (where.date as any).lte = new Date(dateTo);
  }

  const [total, rows] = await Promise.all([
    prisma.attendance.count({ where }),
    prisma.attendance.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { date: 'desc' },
      include: {
        employee: {
          select: {
            employeeCode: true, fullName: true,
            location: { select: { code: true, city: true } },
            department: { select: { code: true, name: true } },
          },
        },
      },
    }),
  ]);

  const items = rows.map((a) => ({
    id: a.id,
    date: a.date,
    employeeCode: a.employee.employeeCode,
    employeeName: a.employee.fullName,
    locationCode: a.employee.location.code,
    locationCity: a.employee.location.city,
    departmentCode: a.employee.department.code,
    departmentName: a.employee.department.name,
    checkIn: a.checkIn,
    checkOut: a.checkOut,
    workingHours: a.workingHours ? Number(a.workingHours) : null,
    overtimeHours: a.overtimeHours ? Number(a.overtimeHours) : null,
    status: a.status,
    workMode: a.workMode,
  }));
  return paginated(items, page, pageSize, total);
}

export async function getAttendanceSummary() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [total, byStatus, byWorkMode, recent] = await Promise.all([
    prisma.attendance.count(),
    prisma.attendance.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.attendance.groupBy({ by: ['workMode'], _count: { _all: true } }),
    prisma.attendance.findFirst({ orderBy: { date: 'desc' }, select: { date: true } }),
  ]);

  let todayCount = 0;
  if (recent) {
    todayCount = await prisma.attendance.count({ where: { date: recent.date } });
  }

  // Status breakdown for the most recent day
  let todayBreakdown: { status: string; count: number }[] = [];
  if (recent) {
    const rows = await prisma.attendance.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: { date: recent.date },
    });
    todayBreakdown = rows.map((r) => ({ status: r.status, count: r._count._all }));
  }

  return {
    total,
    latestDate: recent?.date || null,
    latestDateCount: todayCount,
    latestDateBreakdown: todayBreakdown,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })).sort((a, b) => b.count - a.count),
    byWorkMode: byWorkMode.map((w) => ({ workMode: w.workMode, count: w._count._all })),
  };
}

export async function getAttendanceTrend(days: number = 14) {
  const rows = await prisma.attendance.groupBy({
    by: ['date', 'status'],
    _count: { _all: true },
    orderBy: { date: 'desc' },
    take: days * 5,
  });

  const byDate: Record<string, Record<string, number>> = {};
  const dateSet = new Set<string>();
  for (const r of rows) {
    const key = r.date.toISOString().slice(0, 10);
    dateSet.add(key);
    if (!byDate[key]) byDate[key] = {};
    byDate[key][r.status] = r._count._all;
  }
  return Array.from(dateSet).sort().slice(-days).map((k) => ({
    date: k,
    present: byDate[k].PRESENT || 0,
    wfh: byDate[k].WFH || 0,
    late: byDate[k].LATE || 0,
    absent: byDate[k].ABSENT || 0,
    holiday: byDate[k].HOLIDAY || 0,
    overtime: byDate[k].OVERTIME || 0,
  }));
}

export async function getAttendanceByDepartment() {
  const rows = await prisma.attendance.groupBy({
    by: ['status', 'employeeId'],
    _count: { _all: true },
  });
  const empDepts = await prisma.employee.findMany({
    select: { id: true, department: { select: { code: true, name: true } } },
  });
  const deptByEmp = new Map(empDepts.map((e) => [e.id, e.department]));

  const byDept: Record<string, { departmentCode: string; departmentName: string; present: number; absent: number; wfh: number; total: number }> = {};
  for (const r of rows) {
    const dept = deptByEmp.get(r.employeeId);
    if (!dept) continue;
    if (!byDept[dept.code]) byDept[dept.code] = { departmentCode: dept.code, departmentName: dept.name, present: 0, absent: 0, wfh: 0, total: 0 };
    byDept[dept.code].total += r._count._all;
    if (r.status === 'PRESENT') byDept[dept.code].present += r._count._all;
    if (r.status === 'ABSENT') byDept[dept.code].absent += r._count._all;
    if (r.status === 'WFH') byDept[dept.code].wfh += r._count._all;
  }
  return Object.values(byDept).sort((a, b) => b.total - a.total).slice(0, 15);
}