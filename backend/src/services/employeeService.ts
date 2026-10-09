import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

export interface ListEmployeesParams {
  page: number;
  pageSize: number;
  search?: string;
  locationCode?: string;
  departmentCode?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export async function listEmployees(params: ListEmployeesParams) {
  const { page, pageSize, search, locationCode, departmentCode, status, sortBy, sortDir } = params;

  const where: Prisma.EmployeeWhereInput = {};
  if (locationCode) where.location = { code: locationCode };
  if (departmentCode) where.department = { code: departmentCode };
  if (status) where.employmentStatus = status as any;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { employeeCode: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q } },
    ];
  }

  const allowedSort: Record<string, keyof Prisma.EmployeeOrderByWithRelationInput> = {
    employeeCode: 'employeeCode', fullName: 'fullName', joiningDate: 'joiningDate',
    basicSalary: 'basicSalary', performanceScore: 'performanceScore',
  };
  const orderByField = allowedSort[sortBy || 'employeeCode'] || 'employeeCode';
  const orderByDir = sortDir === 'desc' ? 'desc' : 'asc';

  const [total, rows] = await Promise.all([
    prisma.employee.count({ where }),
    prisma.employee.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { [orderByField]: orderByDir },
      include: {
        location: { select: { code: true, city: true } },
        department: { select: { code: true, name: true } },
        team: { select: { code: true, name: true } },
        manager: { select: { employeeCode: true, fullName: true } },
      },
    }),
  ]);

  const items = rows.map((e) => ({
    id: e.id, employeeCode: e.employeeCode, fullName: e.fullName, gender: e.gender,
    email: e.email, phone: e.phone,
    locationCode: e.location.code, locationCity: e.location.city,
    departmentCode: e.department.code, departmentName: e.department.name,
    teamCode: e.team?.code || null, teamName: e.team?.name || null,
    designation: e.salaryGrade, employmentType: e.employmentType,
    employmentStatus: e.employmentStatus, experienceYears: e.experienceYears,
    joiningDate: e.joiningDate, basicSalary: Number(e.basicSalary), netSalary: Number(e.netSalary),
    performanceScore: e.performanceScore ? Number(e.performanceScore) : null,
    managerName: e.manager?.fullName || null, managerCode: e.manager?.employeeCode || null,
  }));
  return paginated(items, page, pageSize, total);
}

export async function getEmployeeById(id: string) {
  const e = await prisma.employee.findUnique({
    where: { id },
    include: {
      location: true, department: true, team: true,
      manager: { select: { id: true, employeeCode: true, fullName: true } },
      teamLead: { select: { id: true, employeeCode: true, fullName: true } },
      reports: { select: { id: true, employeeCode: true, fullName: true } },
      skills: { include: { skill: true } },
      certifications: { include: { certification: true } },
    },
  });
  if (!e) return null;
  return {
    id: e.id, employeeCode: e.employeeCode, fullName: e.fullName, gender: e.gender,
    email: e.email, personalEmail: e.personalEmail, phone: e.phone,
    dateOfBirth: e.dateOfBirth, joiningDate: e.joiningDate,
    employmentType: e.employmentType, employmentStatus: e.employmentStatus,
    experienceYears: e.experienceYears, salaryGrade: e.salaryGrade,
    basicSalary: Number(e.basicSalary), hra: Number(e.hra), allowances: Number(e.allowances),
    bonus: Number(e.bonus), grossSalary: Number(e.grossSalary), deductions: Number(e.deductions),
    netSalary: Number(e.netSalary), leaveBalance: e.leaveBalance,
    performanceScore: e.performanceScore ? Number(e.performanceScore) : null,
    costCenter: e.costCenter,
    location: { code: e.location.code, name: e.location.name, city: e.location.city },
    department: { code: e.department.code, name: e.department.name, category: e.department.category },
    team: e.team ? { code: e.team.code, name: e.team.name } : null,
    manager: e.manager ? { id: e.manager.id, employeeCode: e.manager.employeeCode, fullName: e.manager.fullName } : null,
    teamLead: e.teamLead ? { id: e.teamLead.id, employeeCode: e.teamLead.employeeCode, fullName: e.teamLead.fullName } : null,
    reports: e.reports.map((r) => ({ id: r.id, employeeCode: r.employeeCode, fullName: r.fullName })),
    skills: e.skills.map((s) => ({ name: s.skill.name, category: s.skill.category, proficiency: s.proficiency, yearsUsed: s.yearsUsed ? Number(s.yearsUsed) : null })),
    certifications: e.certifications.map((c) => ({
      code: c.certification.code, name: c.certification.name, issuer: c.certification.issuer,
      issuedAt: c.issuedAt, expiresAt: c.expiresAt,
    })),
  };
}

export async function getEmployeeStats() {
  const [byLocation, byDepartment, byStatus, byGrade, byGender, total] = await Promise.all([
    prisma.location.findMany({ select: { code: true, city: true, _count: { select: { employees: true } } } }),
    prisma.department.findMany({ where: { isActive: true }, select: { code: true, name: true, category: true, _count: { select: { employees: true } } } }),
    prisma.employee.groupBy({ by: ['employmentStatus'], _count: { _all: true } }),
    prisma.employee.groupBy({ by: ['salaryGrade'], _count: { _all: true } }),
    prisma.employee.groupBy({ by: ['gender'], _count: { _all: true } }),
    prisma.employee.count(),
  ]);
  return {
    total,
    byLocation: byLocation.map((l) => ({ code: l.code, city: l.city, count: l._count.employees })),
    byDepartment: byDepartment.map((d) => ({ code: d.code, name: d.name, category: d.category, count: d._count.employees })).sort((a, b) => b.count - a.count),
    byStatus: byStatus.map((s) => ({ status: s.employmentStatus, count: s._count._all })),
    byGrade: byGrade.map((g) => ({ grade: g.salaryGrade, count: g._count._all })).sort((a, b) => a.grade.localeCompare(b.grade)),
    byGender: byGender.map((g) => ({ gender: g.gender, count: g._count._all })),
  };
}

// ---- Org Tree -----------------------------------------------------------
export interface OrgNode {
  id: string;
  employeeCode: string;
  fullName: string;
  designation: string;
  departmentCode: string;
  departmentName: string;
  locationCity: string;
  gender: string;
  directReportCount: number;
  reports: OrgNode[];
}

export async function getOrgTree() {
  const emps = await prisma.employee.findMany({
    where: { employmentStatus: { in: ['ACTIVE', 'PROBATION'] } },
    select: {
      id: true, employeeCode: true, fullName: true, salaryGrade: true,
      gender: true, managerId: true,
      department: { select: { code: true, name: true } },
      location: { select: { city: true } },
    },
    orderBy: { employeeCode: 'asc' },
  });

  const byId = new Map<string, OrgNode>();
  const childrenOf = new Map<string | null, string[]>();

  for (const e of emps) {
    byId.set(e.id, {
      id: e.id,
      employeeCode: e.employeeCode,
      fullName: e.fullName,
      designation: e.salaryGrade,
      departmentCode: e.department.code,
      departmentName: e.department.name,
      locationCity: e.location.city,
      gender: e.gender,
      directReportCount: 0,
      reports: [],
    });
    const parentId = e.managerId || null;
    if (!childrenOf.has(parentId)) childrenOf.set(parentId, []);
    childrenOf.get(parentId)!.push(e.id);
  }

  // Attach children and count direct reports
  for (const [parentId, childIds] of childrenOf.entries()) {
    if (!parentId) continue;
    const parent = byId.get(parentId);
    if (!parent) continue;
    parent.reports = childIds.map((id) => byId.get(id)!).filter(Boolean);
    parent.directReportCount = parent.reports.length;
  }

  // Roots: founder (FITS-0001) plus anyone without a manager
  const roots: OrgNode[] = [];
  for (const [parentId, childIds] of childrenOf.entries()) {
    if (parentId === null) {
      for (const id of childIds) {
        const n = byId.get(id);
        if (n) roots.push(n);
      }
    }
  }

  return { roots, totalNodes: emps.length };
}