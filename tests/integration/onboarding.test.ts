import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Onboarding workflow', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('OnboardingRecord and OnboardingTask tables exist and are queryable', async () => {
    const records = await prisma.onboardingRecord.count();
    const tasks = await prisma.onboardingTask.count();
    expect(records).toBeGreaterThanOrEqual(0);
    expect(tasks).toBeGreaterThanOrEqual(0);
  });

  test('any onboarding record has a valid employee relation', async () => {
    const sample = await prisma.onboardingRecord.findFirst({
      include: { employee: true, tasks: true },
    });
    if (!sample) return; // no records yet — acceptable
    expect(sample.employee).toBeTruthy();
    expect(sample.employee.employeeCode).toBeTruthy();
  });
});