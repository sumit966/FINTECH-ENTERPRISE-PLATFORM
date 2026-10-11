/**
 * scripts/seed.ts
 * Idempotent seed. Loads .env from repo root, backend, then database.
 */
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load .env BEFORE importing Prisma client (client reads DATABASE_URL at construction)
const envCandidates = [
  path.resolve(__dirname, '..', 'backend', '.env'),
  path.resolve(__dirname, '..', '.env'),
  path.resolve(__dirname, '..', 'database', '.env'),
];
const envFile = envCandidates.find((p) => fs.existsSync(p));
if (!envFile) {
  console.error('No .env found in backend/, root/, or database/');
  process.exit(1);
}
dotenv.config({ path: envFile });
console.log('Loaded env:', envFile);
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set after loading', envFile);
  process.exit(1);
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFunding(): Promise<number> {
  const existing = await prisma.fundingRecord.count();
  if (existing > 0) {
    console.log(`[funding] ${existing} records already present - skipping`);
    return 0;
  }
  const records = [
    { fundingCode: 'FND-001', source: 'Dubai Street-Food Company', sourceType: 'COMMERCIAL', country: 'UAE', amount: 250000000, currency: 'INR', fundingType: 'EQUITY' as const, status: 'RECORDED' as const, notes: 'Strategic investment from a Dubai-based street-food company. Source identity anonymised pending legal disclosure.' },
    { fundingCode: 'FND-002', source: 'College Institutional Funding', sourceType: 'INSTITUTIONAL', country: 'India', amount: 100000000, currency: 'INR', fundingType: 'GRANT' as const, status: 'RECORDED' as const, notes: 'Institutional funding for R&D collaboration. College name withheld pending signed agreement.' },
    { fundingCode: 'FND-003', source: 'Delhi Government / Startup India Innovation Cell', sourceType: 'GOVERNMENT', country: 'India', amount: 250000000, currency: 'INR', fundingType: 'GRANT' as const, status: 'RECORDED' as const, notes: 'Recorded under Startup India Innovation Cell programme. Not yet verified - no official grant letter on file.' },
  ];
  for (const r of records) await prisma.fundingRecord.create({ data: r });
  console.log(`[funding] created ${records.length} records`);
  return records.length;
}

async function main() {
  console.log('=== FINTECH ENTERPRISE PLATFORM :: seed ===');
  await seedFunding();
  const [employees, projects, payroll, attendance, funding] = await Promise.all([
    prisma.employee.count(),
    prisma.project.count(),
    prisma.payroll.count(),
    prisma.attendance.count(),
    prisma.fundingRecord.count(),
  ]);
  console.log('--- row counts ---');
  console.log('employees  :', employees);
  console.log('projects   :', projects);
  console.log('payroll    :', payroll);
  console.log('attendance :', attendance);
  console.log('funding    :', funding);
  console.log('=== done ===');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
