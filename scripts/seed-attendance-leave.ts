// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Attendance + Leave seeder
// Idempotent.
// ============================================================================
import { PrismaClient } from '@prisma/client';
import { attendanceData } from '../database/data/attendance.data';
import { leavesData } from '../database/data/leaves.data';

const prisma = new PrismaClient();

async function main() {
  console.log('>> Seeding attendance (' + attendanceData.length + ' rows) ...');

  const emps = await prisma.employee.findMany({ select: { id: true, employeeCode: true } });
  const empIdByCode = new Map(emps.map((e) => [e.employeeCode, e.id]));

  let attCount = 0;
  let attSkip = 0;

  for (const a of attendanceData) {
    const employeeId = empIdByCode.get(a.employeeCode);
    if (!employeeId) { attSkip++; continue; }
    try {
      await prisma.attendance.upsert({
        where: { employeeId_date: { employeeId, date: a.date } },
        update: {
          checkIn: a.checkIn,
          checkOut: a.checkOut,
          workingHours: a.workingHours,
          overtimeHours: a.overtimeHours,
          status: a.status,
          workMode: a.workMode,
          notes: a.notes,
        },
        create: {
          employeeId,
          date: a.date,
          checkIn: a.checkIn,
          checkOut: a.checkOut,
          workingHours: a.workingHours,
          overtimeHours: a.overtimeHours,
          status: a.status,
          workMode: a.workMode,
          notes: a.notes,
        },
      });
      attCount++;
    } catch (_e) { attSkip++; }
  }
  console.log('  [OK] Attendance rows: ' + attCount + ' (skipped: ' + attSkip + ')');

  console.log('>> Seeding leaves (' + leavesData.length + ' rows) ...');
  let leaveCount = 0;
  let leaveSkip = 0;

  for (const l of leavesData) {
    const employeeId = empIdByCode.get(l.employeeCode);
    if (!employeeId) { leaveSkip++; continue; }
    const approverId = l.approvedByCode ? empIdByCode.get(l.approvedByCode) : null;
    try {
      // No natural unique key on Leave; skip if a matching record exists.
      const existing = await prisma.leave.findFirst({
        where: { employeeId, startDate: l.startDate, leaveType: l.leaveType },
      });
      if (existing) { leaveSkip++; continue; }
      await prisma.leave.create({
        data: {
          employeeId,
          leaveType: l.leaveType,
          startDate: l.startDate,
          endDate: l.endDate,
          days: l.days,
          reason: l.reason,
          status: l.status,
          approvedById: approverId,
          approvedAt: l.approvedAt,
          rejectionReason: l.rejectionReason,
        },
      });
      leaveCount++;
    } catch (_e) { leaveSkip++; }
  }
  console.log('  [OK] Leave rows: ' + leaveCount + ' (skipped: ' + leaveSkip + ')');

  console.log('Attendance + Leave seeding complete.');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });