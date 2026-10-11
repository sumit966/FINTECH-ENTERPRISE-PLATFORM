import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Funding records', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('funding table exists and is queryable', async () => {
    const count = await prisma.fundingRecord.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('if 3 prototype records exist, total is Rs 60 Cr', async () => {
    const rows = await prisma.fundingRecord.findMany();
    if (rows.length === 0) return; // not yet seeded

    const total = rows.reduce((s, r) => s + Number(r.amount), 0);

    // The 3 prototype records sum to 25 + 10 + 25 = 60 Cr
    if (rows.length === 3) {
      expect(total).toBe(600000000);
    } else {
      expect(total).toBeGreaterThan(0);
    }
  });

  test('no funding record is marked VERIFIED without documentation evidence', async () => {
    const verified = await prisma.fundingRecord.findMany({
      where: { status: { in: ['VERIFIED', 'APPROVED', 'DISBURSED', 'RECEIVED'] } },
      include: { documents: true },
    });
    for (const r of verified) {
      // If a record claims verified-or-beyond, it must have at least one document
      expect(r.documents.length).toBeGreaterThan(0);
    }
  });
});