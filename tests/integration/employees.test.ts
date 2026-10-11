import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Employee creation workflow', () => {
  const testCode = 'FITS-TEST-' + Date.now();

  afterAll(async () => {
    await prisma.employee.deleteMany({ where: { employeeCode: { startsWith: 'FITS-TEST-' } } });
    await prisma.$disconnect();
  });

  test('can look up reference data (locations, departments)', async () => {
    const locations = await prisma.location.count();
    const departments = await prisma.department.count();
    expect(locations).toBeGreaterThan(0);
    expect(departments).toBeGreaterThan(0);
  });

  test('employee count is at least 500 (seeded dataset)', async () => {
    const count = await prisma.employee.count();
    expect(count).toBeGreaterThanOrEqual(500);
  });

  test('creates a deterministic employee row', async () => {
    const location = await prisma.location.findFirst();
    const department = await prisma.department.findFirst();
    expect(location).not.toBeNull();
    expect(department).not.toBeNull();

    const created = await prisma.employee.create({
      data: {
        employeeCode: testCode,
        fullName: 'Test Harness Employee',
        gender: 'OTHER',
        email: testCode.toLowerCase() + '@fintechitsolutions.in',
        phone: '+91-9000000000',
        dateOfBirth: new Date('1995-01-01'),
        joiningDate: new Date('2024-11-01'),
        employmentType: 'FULL_TIME',
        employmentStatus: 'PROBATION',
        experienceYears: 3,
        salaryGrade: 'L3',
        basicSalary: 50000,
        hra: 20000,
        allowances: 7500,
        bonus: 5000,
        grossSalary: 82500,
        deductions: 9900,
        netSalary: 72600,
        locationId: location!.id,
        departmentId: department!.id,
      },
    });

    expect(created.id).toBeTruthy();
    expect(created.employeeCode).toBe(testCode);
    expect(Number(created.netSalary)).toBe(72600);
  });

  test('rejects duplicate email at the database level', async () => {
    const first = await prisma.employee.findFirst({ where: { employeeCode: testCode } });
    expect(first).not.toBeNull();
    const location = await prisma.location.findFirst();
    const department = await prisma.department.findFirst();

    await expect(
      prisma.employee.create({
        data: {
          employeeCode: testCode + '-DUP',
          fullName: 'Duplicate Email Attempt',
          gender: 'OTHER',
          email: first!.email,
          phone: '+91-9000000001',
          dateOfBirth: new Date('1995-01-01'),
          joiningDate: new Date('2024-11-01'),
          employmentType: 'FULL_TIME',
          employmentStatus: 'PROBATION',
          experienceYears: 3,
          salaryGrade: 'L3',
          basicSalary: 50000,
          hra: 20000,
          allowances: 7500,
          bonus: 5000,
          grossSalary: 82500,
          deductions: 9900,
          netSalary: 72600,
          locationId: location!.id,
          departmentId: department!.id,
        },
      })
    ).rejects.toThrow();
  });
});