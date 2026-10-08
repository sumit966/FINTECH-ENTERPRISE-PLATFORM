// ============================================================================
// NEXUS ENTERPRISE PLATFORM - 500 Employees (deterministic, fixed managers)
// All fields computed from employee index using fixed formulas.
// No Math.random, no Faker, no runtime randomness.
// ============================================================================

import { employeeNames, firstNameGender } from './employee-names.data';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNDISCLOSED';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN' | 'CONSULTANT';
export type EmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'NOTICE_PERIOD' | 'RESIGNED' | 'TERMINATED' | 'RETIRED';

export interface EmployeeData {
  employeeCode: string;
  fullName: string;
  gender: Gender;
  email: string;
  personalEmail: string;
  phone: string;
  dateOfBirth: Date;
  joiningDate: Date;
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  experienceYears: number;
  salaryGrade: string;
  basicSalary: number;
  hra: number;
  allowances: number;
  bonus: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  leaveBalance: number;
  performanceScore: number;
  costCenter: string;
  locationCode: string;
  departmentCode: string;
  teamCode: string | null;
  managerCode: string | null;
  teamLeadCode: string | null;
}

// ---- Fixed lookup tables --------------------------------------------------

const LOCATION_CODES = ['PUNE', 'BLR', 'NOIDA'];

const DEPARTMENT_CYCLE = [
  'BE','FE','FS','AIML','DATA','CLOUD','DEVOPS','SEC','QA','ENG',
  'BE','FE','FS','BE','AIML','DATA','CLOUD','SRE','SEC','QA',
  'ENG','BE','FE','FS','MOB','BE','AIML','DATA','CLOUD','DEVOPS',
];

const TEAM_BY_DEPT: Record<string, string[]> = {
  ENG:    ['TEAM-PLAT'],
  BE:     ['TEAM-PAY', 'TEAM-LEND'],
  FE:     ['TEAM-WEB'],
  FS:     ['TEAM-FS-1', 'TEAM-FS-2'],
  MOB:    ['TEAM-MOB'],
  AIML:   ['TEAM-AI-RAG', 'TEAM-AI-VIS'],
  DATA:   ['TEAM-DATA-1', 'TEAM-DATA-2'],
  CLOUD:  ['TEAM-CLD-AWS', 'TEAM-CLD-AZ'],
  DEVOPS: ['TEAM-DEVOPS'],
  SRE:    ['TEAM-SRE'],
  SEC:    ['TEAM-SEC'],
  QA:     ['TEAM-QA-1', 'TEAM-QA-2'],
};

function gradeFor(exp: number): string {
  if (exp >= 14) return 'L8';
  if (exp >= 11) return 'L7';
  if (exp >= 8)  return 'L6';
  if (exp >= 6)  return 'L5';
  if (exp >= 4)  return 'L4';
  if (exp >= 2)  return 'L3';
  if (exp >= 1)  return 'L2';
  return 'L1';
}

const BASE_BY_GRADE: Record<string, number> = {
  L1:  25000,
  L2:  35000,
  L3:  50000,
  L4:  70000,
  L5:  95000,
  L6: 125000,
  L7: 165000,
  L8: 210000,
};

function pad4(n: number): string { return String(n).padStart(4, '0'); }
function pad2(n: number): string { return String(n).padStart(2, '0'); }

function emailFor(name: string, code: string): string {
  const parts = name.toLowerCase().split(' ');
  return parts[0] + '.' + parts[1] + '.' + code.slice(-4) + '@fintechitsolutions.example';
}

function personalEmailFor(name: string, code: string): string {
  const parts = name.toLowerCase().split(' ');
  return parts[0] + parts[1] + code.slice(-2) + '@gmail.example';
}

function phoneFor(idx: number): string {
  return '+91-9' + String(800000000 + idx * 137).padStart(9, '0');
}

function dobFor(idx: number): Date {
  const year = 1980 + (idx % 24);
  const month = (idx % 12);
  const day = 1 + (idx % 28);
  return new Date(Date.UTC(year, month, day));
}

function joiningDateFor(idx: number): Date {
  const base = Date.UTC(2023, 0, 1);
  const dayOffset = idx % 700;
  return new Date(base + dayOffset * 24 * 3600 * 1000);
}

function experienceFor(idx: number): number {
  return 1 + ((idx * 7) % 15);
}

function performanceFor(idx: number): number {
  return 3.0 + ((idx * 13) % 200) / 100;
}

function leaveBalanceFor(idx: number): number {
  return 8 + (idx % 17);
}

// ---- Build the 500 employee records --------------------------------------

export const employeesData: EmployeeData[] = [];

for (let i = 0; i < 500; i++) {
  const employeeNumber = i + 1;
  const code = 'FITS-' + pad4(employeeNumber);
  const name = i === 0 ? 'Sumit Raj' : employeeNames[i - 1];

  const firstName = name.split(' ')[0];
  const gender: Gender = i === 0 ? 'MALE' : (firstNameGender[firstName] || 'MALE');

  const locationCode = i === 0 ? 'PUNE' : LOCATION_CODES[i % 3];
  const departmentCode = i === 0 ? 'ENG' : DEPARTMENT_CYCLE[i % DEPARTMENT_CYCLE.length];

  let teamCode: string | null = null;
  if (i !== 0) {
    const candidates = TEAM_BY_DEPT[departmentCode] || [];
    if (candidates.length > 0) {
      teamCode = candidates[i % candidates.length];
    }
  }

  const experience = i === 0 ? 8 : experienceFor(i);
  const grade = i === 0 ? 'L8' : gradeFor(experience);
  const base = i === 0 ? 250000 : (BASE_BY_GRADE[grade] || 50000);
  const hra = Math.round(base * 0.4);
  const allowances = Math.round(base * 0.15);
  const bonus = Math.round(base * 0.1);
  const gross = base + hra + allowances + bonus;
  const deductions = Math.round(gross * 0.12);
  const net = gross - deductions;

  const employmentType: EmploymentType = i === 0 ? 'FULL_TIME' : (i % 30 === 0 ? 'CONTRACT' : 'FULL_TIME');
  const status: EmploymentStatus = i % 50 === 49 ? 'PROBATION' : 'ACTIVE';

  employeesData.push({
    employeeCode: code,
    fullName: name,
    gender,
    email: i === 0 ? 'founder@fintechitsolutions.example' : emailFor(name, code),
    personalEmail: personalEmailFor(name, code),
    phone: phoneFor(i),
    dateOfBirth: dobFor(i),
    joiningDate: joiningDateFor(i),
    employmentType,
    employmentStatus: status,
    experienceYears: experience,
    salaryGrade: grade,
    basicSalary: base,
    hra,
    allowances,
    bonus,
    grossSalary: gross,
    deductions,
    netSalary: net,
    leaveBalance: leaveBalanceFor(i),
    performanceScore: performanceFor(i),
    costCenter: 'CC-' + departmentCode + '-' + pad2((i % 90) + 10),
    locationCode,
    departmentCode,
    teamCode,
    managerCode: null,
    teamLeadCode: null,
  });
}

// ---- Manager and Team Lead assignment ------------------------------------
// Group employees by team and department.
const byTeam: Record<string, EmployeeData[]> = {};
const byDept: Record<string, EmployeeData[]> = {};

for (const e of employeesData) {
  if (e.teamCode) {
    if (!byTeam[e.teamCode]) byTeam[e.teamCode] = [];
    byTeam[e.teamCode].push(e);
  }
  if (!byDept[e.departmentCode]) byDept[e.departmentCode] = [];
  byDept[e.departmentCode].push(e);
}

// One lead per team: the lowest-code member.
const teamLeads: Record<string, string> = {};
for (const teamCode of Object.keys(byTeam)) {
  teamLeads[teamCode] = byTeam[teamCode][0].employeeCode;
}
const allLeadCodes = new Set(Object.values(teamLeads));

// One manager per department: prefer a non-lead who isn't the founder.
// Excludes the founder from being a manager for any department.
const deptManagers: Record<string, string> = {};
for (const deptCode of Object.keys(byDept)) {
  const members = byDept[deptCode];
  const nonLead = members.find(
    (m) => !allLeadCodes.has(m.employeeCode) && m.employeeCode !== 'FITS-0001'
  );
  const fallback = members.find((m) => m.employeeCode !== 'FITS-0001') || members[0];
  deptManagers[deptCode] = (nonLead || fallback).employeeCode;
}

// Assign manager + teamLead, with self-reference guard.
for (const e of employeesData) {
  // Founder has no manager.
  if (e.employeeCode === 'FITS-0001') {
    e.managerCode = null;
    e.teamLeadCode = null;
    continue;
  }

  // The four exec users (FITS-0002..FITS-0005) report directly to the founder.
  if (['FITS-0002', 'FITS-0003', 'FITS-0004', 'FITS-0005'].includes(e.employeeCode)) {
    e.managerCode = 'FITS-0001';
    e.teamLeadCode = null;
    continue;
  }

  const isLead = e.teamCode ? teamLeads[e.teamCode] === e.employeeCode : false;

  // Department manager for this employee's department.
  let mgr = deptManagers[e.departmentCode] || 'FITS-0002';

  // Never self-reference.
  if (mgr === e.employeeCode) mgr = 'FITS-0001';

  if (isLead) {
    e.teamLeadCode = null;
    e.managerCode = mgr;
  } else if (e.teamCode) {
    e.teamLeadCode = teamLeads[e.teamCode];
    e.managerCode = mgr;
  } else {
    e.teamLeadCode = null;
    e.managerCode = mgr;
  }
}

// ---- Final self-manager cleanup pass -------------------------------------
// Belt and braces: if anything above still produced a self-reference, fix it.
for (const e of employeesData) {
  if (e.managerCode === e.employeeCode) {
    e.managerCode = e.employeeCode === 'FITS-0001' ? null : 'FITS-0001';
  }
  if (e.teamLeadCode === e.employeeCode) {
    e.teamLeadCode = null;
  }
}

// ---- Validation ----------------------------------------------------------

if (employeesData.length !== 500) {
  throw new Error('Expected 500 employees, got ' + employeesData.length);
}

const codes = new Set(employeesData.map((e) => e.employeeCode));
const emails = new Set(employeesData.map((e) => e.email));
const names = new Set(employeesData.map((e) => e.fullName));
const selfMgrs = employeesData.filter((e) => e.managerCode === e.employeeCode);

if (codes.size !== 500) throw new Error('Duplicate employee codes');
if (emails.size !== 500) throw new Error('Duplicate emails');
if (names.size !== 500) throw new Error('Duplicate names');
if (selfMgrs.length !== 0) throw new Error('Self-managed employees: ' + selfMgrs.length);