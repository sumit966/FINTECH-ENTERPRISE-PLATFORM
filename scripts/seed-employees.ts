// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Employee seeder (Section 11 Part 2)
// Inserts 500 employees, ~2,500 employee skills, ~500 employee certifications.
// Idempotent: safe to re-run.
// ============================================================================
import { PrismaClient } from '@prisma/client';
import {
  employeesData,
  skillsData,
  certificationsData,
} from '../database/data';

const prisma = new PrismaClient();

// Deterministic skill assignment per employee:
//   Pick 4 or 5 skills from the catalogue, offset by employee index.
// Deterministic cert assignment per employee:
//   Every 2nd employee gets 1 cert, cycling through the catalogue.

// Map: category -> skill names available.
const SKILLS_BY_CATEGORY: Record<string, string[]> = {};
for (const s of skillsData) {
  SKILLS_BY_CATEGORY[s.category] = SKILLS_BY_CATEGORY[s.category] || [];
  SKILLS_BY_CATEGORY[s.category].push(s.name);
}

function skillsForEmployee(idx: number): string[] {
  // Always give them 1 SOFT skill + 3-4 technical skills pulled from
  // rotating categories, so every employee has a plausible mix.
  const soft = SKILLS_BY_CATEGORY['SOFT'] || [];
  const techCategories = ['FRONTEND', 'BACKEND', 'DATABASE', 'CLOUD', 'AI_ML', 'SECURITY', 'DEVOPS', 'DATA'];
  const picks: string[] = [];

  // one SOFT
  if (soft.length > 0) picks.push(soft[idx % soft.length]);

  // 3 or 4 technical (alternates by index parity)
  const count = 3 + (idx % 2);
  for (let k = 0; k < count; k++) {
    const cat = techCategories[(idx + k) % techCategories.length];
    const list = SKILLS_BY_CATEGORY[cat] || [];
    if (list.length > 0) picks.push(list[(idx + k) % list.length]);
  }

  // Deduplicate and cap at 5
  return Array.from(new Set(picks)).slice(0, 5);
}

async function main() {
  console.log('>> Seeding employees ...');

  // ---- Lookups (id -> code) ----
  const locations = await prisma.location.findMany();
  const departments = await prisma.department.findMany();
  const teams = await prisma.team.findMany();
  const users = await prisma.user.findMany();

  const locId = new Map(locations.map((l) => [l.code, l.id]));
  const depId = new Map(departments.map((d) => [d.code, d.id]));
  const teamId = new Map(teams.map((t) => [t.code, t.id]));
  const userByEmail = new Map(users.map((u) => [u.email, u.id]));

  // ---- Pass 1: insert employees without manager/teamLead (self-refs) ----
  let inserted = 0;
  for (let i = 0; i < employeesData.length; i++) {
    const e = employeesData[i];
    const locationId = locId.get(e.locationCode);
    const departmentId = depId.get(e.departmentCode);
    const teamIdVal = e.teamCode ? teamId.get(e.teamCode) : null;
    if (!locationId || !departmentId) {
      throw new Error('Missing location/department for ' + e.employeeCode);
    }

    await prisma.employee.upsert({
      where: { employeeCode: e.employeeCode },
      update: {
        fullName: e.fullName,
        gender: e.gender,
        email: e.email,
        personalEmail: e.personalEmail,
        phone: e.phone,
        dateOfBirth: e.dateOfBirth,
        joiningDate: e.joiningDate,
        employmentType: e.employmentType,
        employmentStatus: e.employmentStatus,
        experienceYears: e.experienceYears,
        salaryGrade: e.salaryGrade,
        basicSalary: e.basicSalary,
        hra: e.hra,
        allowances: e.allowances,
        bonus: e.bonus,
        grossSalary: e.grossSalary,
        deductions: e.deductions,
        netSalary: e.netSalary,
        leaveBalance: e.leaveBalance,
        performanceScore: e.performanceScore,
        costCenter: e.costCenter,
        locationId,
        departmentId,
        teamId: teamIdVal,
      },
      create: {
        employeeCode: e.employeeCode,
        fullName: e.fullName,
        gender: e.gender,
        email: e.email,
        personalEmail: e.personalEmail,
        phone: e.phone,
        dateOfBirth: e.dateOfBirth,
        joiningDate: e.joiningDate,
        employmentType: e.employmentType,
        employmentStatus: e.employmentStatus,
        experienceYears: e.experienceYears,
        salaryGrade: e.salaryGrade,
        basicSalary: e.basicSalary,
        hra: e.hra,
        allowances: e.allowances,
        bonus: e.bonus,
        grossSalary: e.grossSalary,
        deductions: e.deductions,
        netSalary: e.netSalary,
        leaveBalance: e.leaveBalance,
        performanceScore: e.performanceScore,
        costCenter: e.costCenter,
        locationId,
        departmentId,
        teamId: teamIdVal,
      },
    });
    inserted++;
  }
  console.log('  [OK] Employees inserted: ' + inserted);

  // ---- Pass 2: resolve manager and teamLead (self-referential FKs) ----
  const codeToId = new Map<string, string>();
  const allEmps = await prisma.employee.findMany({ select: { id: true, employeeCode: true } });
  for (const e of allEmps) codeToId.set(e.employeeCode, e.id);

  let mgrUpdates = 0;
  for (const e of employeesData) {
    const selfId = codeToId.get(e.employeeCode);
    if (!selfId) continue;
    const managerId = e.managerCode ? codeToId.get(e.managerCode) : null;
    const teamLeadId = e.teamLeadCode ? codeToId.get(e.teamLeadCode) : null;
    await prisma.employee.update({
      where: { id: selfId },
      data: { managerId, teamLeadId },
    });
    mgrUpdates++;
  }
  console.log('  [OK] Manager/teamLead links: ' + mgrUpdates);

  // ---- Pass 3: link Users to Employees ----
  let userLinks = 0;
  for (const u of users) {
    const email = u.email;
    // find employee whose email matches
    const emp = await prisma.employee.findFirst({ where: { email } });
    if (emp) {
      await prisma.user.update({
        where: { id: u.id },
        data: { employeeId: emp.id },
      });
      userLinks++;
    }
  }
  console.log('  [OK] User<->Employee links: ' + userLinks);

  // ---- Pass 4: EmployeeSkill ----
  const allSkills = await prisma.skill.findMany();
  if (allSkills.length === 0) {
    // populate skill catalogue on the fly
    for (const s of skillsData) {
      await prisma.skill.upsert({
        where: { name: s.name },
        update: { category: s.category, description: s.description },
        create: { name: s.name, category: s.category, description: s.description },
      });
    }
    console.log('  [OK] Skills catalogue: ' + skillsData.length);
  }
  const skillByName = new Map((await prisma.skill.findMany()).map((s) => [s.name, s.id]));

  let skillCount = 0;
  for (let i = 0; i < employeesData.length; i++) {
    const e = employeesData[i];
    const empId = codeToId.get(e.employeeCode);
    if (!empId) continue;
    const picks = skillsForEmployee(i);
    for (const skillName of picks) {
      const sId = skillByName.get(skillName);
      if (!sId) continue;
      try {
        await prisma.employeeSkill.upsert({
          where: { employeeId_skillId: { employeeId: empId, skillId: sId } },
          update: {},
          create: {
            employeeId: empId,
            skillId: sId,
            proficiency: 1 + ((i + skillCount) % 5),
            yearsUsed: (e.experienceYears > 0 ? e.experienceYears / 2 : 0.5),
          },
        });
        skillCount++;
      } catch (_e) { /* ignore dupes */ }
    }
  }
  console.log('  [OK] EmployeeSkill rows: ' + skillCount);

  // ---- Pass 5: EmployeeCertification ----
  // Populate certification catalogue.
  for (const c of certificationsData) {
    await prisma.certification.upsert({
      where: { code: c.code },
      update: { name: c.name, issuer: c.issuer, validityMons: c.validityMons },
      create: { code: c.code, name: c.name, issuer: c.issuer, validityMons: c.validityMons },
    });
  }
  const certByCode = new Map((await prisma.certification.findMany()).map((c) => [c.code, c]));

  let certCount = 0;
  for (let i = 0; i < employeesData.length; i += 2) {
    const e = employeesData[i];
    const empId = codeToId.get(e.employeeCode);
    if (!empId) continue;
    const certCode = certificationsData[(i / 2) % certificationsData.length].code;
    const cert = certByCode.get(certCode);
    if (!cert) continue;
    const issuedAt = new Date(Date.UTC(2024, i % 12, 1 + (i % 28)));
    const expiresAt = cert.validityMons
      ? new Date(Date.UTC(2024 + Math.floor(cert.validityMons / 12), i % 12, 1 + (i % 28)))
      : null;
    try {
      await prisma.employeeCertification.upsert({
        where: { employeeId_certificationId: { employeeId: empId, certificationId: cert.id } },
        update: {},
        create: {
          employeeId: empId,
          certificationId: cert.id,
          issuedAt,
          expiresAt,
          credentialId: cert.code + '-' + e.employeeCode,
          status: 'ACTIVE',
        },
      });
      certCount++;
    } catch (_e) { /* ignore dupes */ }
  }
  console.log('  [OK] EmployeeCertification rows: ' + certCount);

  console.log('Employee seeding complete.');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });