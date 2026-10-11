const fs = require('fs');
const p = 'src/services/payrollService.ts';
let s = fs.readFileSync(p, 'utf8');

// Extend PayrollSummary interface with the new fields
const before = `export interface PayrollSummary {
  totalRows: number;
  paidRows: number;
  pendingRows: number;
  failedRows: number;
  totalGrossPaidYtd: number;
  totalNetPaidYtd: number;
  totalTaxYtd: number;
  latestPayrollPeriod: string | null;
  activeEmployeeCount: number;
}`;

const after = `export interface PayrollSummary {
  totalRows: number;
  paidRows: number;
  pendingRows: number;
  failedRows: number;
  // Lifetime (not YTD) — renamed to match the data reality
  totalGrossPaidLifetime: number;
  totalNetPaidLifetime: number;
  totalTaxLifetime: number;
  // Backwards-compatible aliases
  totalGrossPaidYtd: number;
  totalNetPaidYtd: number;
  totalTaxYtd: number;
  latestPayrollPeriod: string | null;
  earliestPayrollPeriod: string | null;
  periodLabel: string | null;
  activeEmployeeCount: number;
  founderExcluded?: boolean;
  founderEmployeeCode?: string;
}`;

if (s.includes(before)) {
  s = s.replace(before, after);
  console.log('PayrollSummary interface extended');
} else {
  // Fallback: inject fields after totalTaxYtd
  s = s.replace(
    /(totalTaxYtd:\s*number;)/,
    `$1
  totalGrossPaidLifetime?: number;
  totalNetPaidLifetime?: number;
  totalTaxLifetime?: number;
  earliestPayrollPeriod?: string | null;
  periodLabel?: string | null;
  founderExcluded?: boolean;
  founderEmployeeCode?: string;`
  );
  console.log('PayrollSummary interface extended (fallback)');
}

fs.writeFileSync(p, s);
