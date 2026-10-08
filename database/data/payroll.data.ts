// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Payroll (deterministic)
// 24 months x 500 employees = 12,000 rows, all computed deterministically.
// Period: 2023-01 through 2024-12.
// ============================================================================

import { employeesData } from './employees.data';

export type PayrollStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';

export interface PayrollData {
  payrollCode: string;
  employeeCode: string;
  month: number;
  year: number;
  basicSalary: number;
  hra: number;
  allowances: number;
  bonus: number;
  grossSalary: number;
  tax: number;
  deductions: number;
  netSalary: number;
  status: PayrollStatus;
  paymentDate: Date | null;
  paymentMethod: string;
  department: string;
  location: string;
}

const MONTHS: { year: number; month: number }[] = [];
for (let y = 2023; y <= 2024; y++) {
  for (let m = 1; m <= 12; m++) {
    MONTHS.push({ year: y, month: m });
  }
}

function pad2(n: number): string { return String(n).padStart(2, '0'); }

function bonusMultiplierFor(month: number): number {
  return (month % 3 === 0) ? 1.0 : 0.0;
}

const CURRENT_YEAR = 2024;
const CURRENT_MONTH = 12;

function statusFor(month: number, year: number, idx: number): PayrollStatus {
  const period = year * 100 + month;
  const current = CURRENT_YEAR * 100 + CURRENT_MONTH;
  if (period >= current) return 'PENDING';
  if (period === current - 1) return (idx % 20 === 0) ? 'PROCESSING' : 'PAID';
  if (period < current - 1) return (idx % 50 === 7) ? 'FAILED' : 'PAID';
  return 'PAID';
}

export const payrollData: PayrollData[] = [];

for (let p = 0; p < MONTHS.length; p++) {
  const { year, month } = MONTHS[p];
  for (let i = 0; i < employeesData.length; i++) {
    const emp = employeesData[i];

    const yearMultiplier = year === 2024 ? 1.10 : 1.0;
    const basic = Math.round(emp.basicSalary * yearMultiplier);
    const hra = Math.round(emp.hra * yearMultiplier);
    const allowances = Math.round(emp.allowances * yearMultiplier);
    const bonus = Math.round(emp.bonus * bonusMultiplierFor(month));
    const gross = basic + hra + allowances + bonus;

    const taxRate = gross >= 100000 ? 0.15 : (gross >= 60000 ? 0.12 : 0.10);
    const tax = Math.round(gross * taxRate);
    const deductions = tax + Math.round(gross * 0.02);
    const net = gross - deductions;

    const status = statusFor(month, year, i);
    const paymentDate = status === 'PAID' ? new Date(Date.UTC(year, month - 1, 28)) : null;
    const paymentMethod = (i % 3 === 0) ? 'NEFT' : (i % 3 === 1 ? 'IMPS' : 'UPI');

    payrollData.push({
      payrollCode: 'PAY-' + year + '-' + pad2(month) + '-' + emp.employeeCode,
      employeeCode: emp.employeeCode,
      month,
      year,
      basicSalary: basic,
      hra,
      allowances,
      bonus,
      grossSalary: gross,
      tax,
      deductions,
      netSalary: net,
      status,
      paymentDate,
      paymentMethod,
      department: emp.departmentCode,
      location: emp.locationCode,
    });
  }
}

if (payrollData.length !== 24 * 500) throw new Error('Expected 12,000 payroll rows, got ' + payrollData.length);