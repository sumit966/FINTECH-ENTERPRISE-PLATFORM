import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Attendance table integrity', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('45,000 attendance rows exist', async () => {
    const count = await prisma.attendance.count();
    expect(count).toBeGreaterThanOrEqual(45000);
  });

  test('unique constraint prevents duplicate check-in per day', async () => {
    const emp = await prisma.employee.findFirst();
    expect(emp).not.toBeNull();

    const date = new Date(Date.UTC(2020, 0, 1)); // a date no seeded row uses

    await prisma.attendance.deleteMany({ where: { employeeId: emp!.id, date } });

    await prisma.attendance.create({
      data: {
        employeeId: emp!.id,
        date,
        checkIn: new Date(Date.UTC(2020, 0, 1, 9, 0)),
        status: 'PRESENT',
        workMode: 'OFFICE',
        source: 'MANUAL',
      },
    });

    await expect(
      prisma.attendance.create({
        data: {
          employeeId: emp!.id,
          date,
          status: 'PRESENT',
          workMode: 'OFFICE',
          source: 'MANUAL',
        },
      })
    ).rejects.toThrow();

    await prisma.attendance.deleteMany({ where: { employeeId: emp!.id, date } });
  });
});