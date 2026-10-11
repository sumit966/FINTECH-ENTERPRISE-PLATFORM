import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Payroll latest-first ordering', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('12,000 payroll rows exist (24 months x 500 employees)', async () => {
    const count = await prisma.payroll.count();
    expect(count).toBeGreaterThanOrEqual(12000);
  });

  test('default query returns year desc, month desc', async () => {
    const rows = await prisma.payroll.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      take: 10,
    });
    expect(rows.length).toBeGreaterThan(0);

    for (let i = 1; i < rows.length; i++) {
      const prev = rows[i - 1];
      const curr = rows[i];
      const prevKey = prev.year * 100 + prev.month;
      const currKey = curr.year * 100 + curr.month;
      expect(prevKey).toBeGreaterThanOrEqual(currKey);
    }
  });

  test('latest period is the maximum year-month in the table', async () => {
    const latest = await prisma.payroll.findFirst({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    expect(latest).not.toBeNull();

    const all = await prisma.payroll.findMany({ select: { year: true, month: true } });
    const maxKey = Math.max(...all.map((r) => r.year * 100 + r.month));
    expect(latest!.year * 100 + latest!.month).toBe(maxKey);
  });
});