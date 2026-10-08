// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Foundation Seeder (Part 1)
// Inserts: Location, Department, Team, Role, Permission, RolePermission, User, UserRole
// Idempotent: safe to re-run.
// ============================================================================
import { PrismaClient } from '@prisma/client';
import {
  locationsData,
  departmentsData,
  teamsData,
  rolesData,
  permissionsData,
  usersData,
} from '../database/data';

const prisma = new PrismaClient();

// Role-to-permission map (RBAC rulebook)
const rolePermissionMap: Record<string, string[]> = {
  FOUNDER_CEO: ['*'],
  DIRECTOR: ['*'],
  DEPT_HEAD: [
    'employees.read','employees.update','departments.read','teams.read',
    'attendance.read','leave.read','leave.approve','payroll.read',
    'projects.read','projects.update','clients.read','finance.read',
    'invoices.read','expenses.read','expenses.approve','vendors.read',
    'assets.read','recruitment.read','exams.read','engineering.read',
    'security.read','documents.read','documents.create','knowledge.read',
    'ai.read','analytics.read','audit.read',
  ],
  SENIOR_MANAGER: [
    'employees.read','departments.read','teams.read','attendance.read',
    'leave.read','leave.approve','payroll.read','projects.read',
    'projects.update','clients.read','expenses.approve','assets.read',
    'recruitment.read','engineering.read','documents.read','knowledge.read',
    'ai.read','analytics.read',
  ],
  HR_MANAGER: [
    'employees.read','employees.create','employees.update','employees.export',
    'departments.read','teams.read','attendance.read','attendance.create',
    'attendance.update','leave.read','leave.approve','payroll.read',
    'recruitment.read','recruitment.create','recruitment.update',
    'recruitment.approve','exams.read','exams.create','documents.read',
    'documents.create','knowledge.read','analytics.read','audit.read',
  ],
  FINANCE_MANAGER: [
    'employees.read','payroll.read','payroll.create','payroll.update',
    'payroll.approve','payroll.export','finance.read','finance.create',
    'finance.update','finance.approve','finance.export','invoices.read',
    'invoices.create','invoices.update','invoices.approve','invoices.export',
    'expenses.read','expenses.approve','vendors.read','vendors.create',
    'vendors.update','projects.read','clients.read','analytics.read',
    'audit.read',
  ],
  ENGINEERING_MANAGER: [
    'employees.read','employees.update','teams.read','teams.update',
    'projects.read','projects.create','projects.update','projects.approve',
    'projects.export','engineering.read','engineering.create',
    'engineering.update','assets.read','documents.read','knowledge.read',
    'ai.read','analytics.read','security.read','security.update',
  ],
  MANAGER: [
    'employees.read','teams.read','attendance.read','leave.read',
    'leave.approve','projects.read','projects.update','expenses.approve',
    'documents.read','knowledge.read','ai.read','analytics.read',
  ],
  PROJECT_MANAGER: [
    'employees.read','teams.read','projects.read','projects.create',
    'projects.update','projects.approve','projects.export','clients.read',
    'finance.read','expenses.read','documents.read','documents.create',
    'analytics.read',
  ],
  OPS_MANAGER: [
    'employees.read','teams.read','attendance.read','leave.read',
    'leave.approve','projects.read','assets.read','assets.update',
    'vendors.read','documents.read','analytics.read',
  ],
  TEAM_LEAD: [
    'employees.read','teams.read','attendance.read','leave.read',
    'leave.approve','projects.read','projects.update','engineering.read',
    'documents.read','knowledge.read','ai.read',
  ],
  RECRUITER: [
    'recruitment.read','recruitment.create','recruitment.update',
    'recruitment.approve','exams.read','exams.create','documents.read',
    'employees.read','departments.read','analytics.read',
  ],
  ENGINEER: [
    'projects.read','engineering.read','documents.read','knowledge.read',
    'ai.read','analytics.read','employees.read',
  ],
  QA: [
    'projects.read','engineering.read','documents.read','knowledge.read',
    'ai.read','employees.read',
  ],
  EMPLOYEE: [
    'employees.read','attendance.read','leave.read','leave.create',
    'payroll.read','projects.read','documents.read','knowledge.read',
    'ai.read',
  ],
  CLIENT: [],
  CANDIDATE: [],
  AUDITOR: [
    'audit.read','analytics.read','finance.read','payroll.read',
    'projects.read','employees.read','documents.read','security.read',
  ],
};

async function main() {
  console.log('>> Seeding foundation data ...');

  // 1. Locations
  for (const loc of locationsData) {
    await prisma.location.upsert({
      where: { code: loc.code },
      update: {
        name: loc.name, city: loc.city, state: loc.state,
        country: loc.country, address: loc.address, timezone: loc.timezone,
      },
      create: {
        code: loc.code, name: loc.name, city: loc.city, state: loc.state,
        country: loc.country, address: loc.address, timezone: loc.timezone,
      },
    });
  }
  console.log('  [OK] Locations: ' + locationsData.length);

  // 2. Departments
  for (const dep of departmentsData) {
    await prisma.department.upsert({
      where: { code: dep.code },
      update: {
        name: dep.name, category: dep.category,
        description: dep.description, costCenter: dep.costCenter,
      },
      create: {
        code: dep.code, name: dep.name, category: dep.category,
        description: dep.description, costCenter: dep.costCenter,
      },
    });
  }
  console.log('  [OK] Departments: ' + departmentsData.length);

  // 3. Teams
  const departments = await prisma.department.findMany();
  const depByCode = new Map(departments.map((d) => [d.code, d.id]));
  for (const team of teamsData) {
    const departmentId = depByCode.get(team.departmentCode);
    if (!departmentId) {
      throw new Error('Team ' + team.code + ' references missing department ' + team.departmentCode);
    }
    await prisma.team.upsert({
      where: { code: team.code },
      update: { name: team.name, departmentId },
      create: { code: team.code, name: team.name, departmentId },
    });
  }
  console.log('  [OK] Teams: ' + teamsData.length);

  // 4. Roles
  for (const role of rolesData) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name, description: role.description, level: role.level,
      },
      create: {
        code: role.code, name: role.name,
        description: role.description, level: role.level,
      },
    });
  }
  console.log('  [OK] Roles: ' + rolesData.length);

  // 5. Permissions
  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { module: p.module, action: p.action, description: p.description },
      create: { code: p.code, module: p.module, action: p.action, description: p.description },
    });
  }
  console.log('  [OK] Permissions: ' + permissionsData.length);

  // 6. RolePermission links
  const allRoles = await prisma.role.findMany();
  const allPerms = await prisma.permission.findMany();
  const roleByCode = new Map(allRoles.map((r) => [r.code, r]));
  const permByCode = new Map(allPerms.map((p) => [p.code, p]));

  let linkCount = 0;
  for (const entry of Object.entries(rolePermissionMap)) {
    const roleCode = entry[0];
    const perms = entry[1];
    const role = roleByCode.get(roleCode);
    if (!role) continue;
    const expanded = perms.includes('*')
      ? allPerms.map((p) => p.code)
      : perms;
    for (const permCode of expanded) {
      const perm = permByCode.get(permCode);
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
      linkCount++;
    }
  }
  console.log('  [OK] RolePermission links: ' + linkCount);

  // 7. Users
  if (usersData[0].passwordHash.indexOf('REPLACE_WITH_REAL_BCRYPT_HASH') !== -1) {
    console.warn('  [SKIP] Users - DEMO_PASSWORD_HASHES.default is still the placeholder.');
    console.warn('    Run: cd backend && npx ts-node ..\\scripts\\generate-hashes.ts');
  } else {
    for (const u of usersData) {
      const role = roleByCode.get(u.roleCode);
      if (!role) {
        throw new Error('User ' + u.email + ' references missing role ' + u.roleCode);
      }
      const user = await prisma.user.upsert({
        where: { email: u.email },
        update: { fullName: u.fullName, passwordHash: u.passwordHash },
        create: {
          email: u.email, fullName: u.fullName,
          passwordHash: u.passwordHash,
        },
      });
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
      });
    }
    console.log('  [OK] Users: ' + usersData.length);
  }

  console.log('Foundation seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });