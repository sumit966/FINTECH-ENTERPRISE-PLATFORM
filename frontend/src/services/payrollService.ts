import { api } from './api';

export interface PayrollRow {
  id: string;
  payrollCode: string;
  employeeCode: string;
  employeeName: string;
  month: number;
  year: number;
  departmentCode: string;
  departmentName: string;
  locationCode: string;
  locationCity: string;
  basicSalary: number;
  hra: number;
  allowances: number;
  bonus: number;
  grossSalary: number;
  tax: number;
  deductions: number;
  netSalary: number;
  status: string;
  paymentDate: string | null;
  paymentMethod: string | null;
}

export interface PayrollListResponse {
  items: PayrollRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PayrollSummary {
  totalRows: number;
  paidRows: number;
  pendingRows: number;
  failedRows: number;
  totalGrossPaidYtd: number;
  totalNetPaidYtd: number;
  totalTaxYtd: number;
  latestPayrollPeriod: string | null;
  activeEmployeeCount: number;
}

export interface PayrollTrendPoint {
  year: number;
  month: number;
  label: string;
  gross: number;
  net: number;
  rowCount: number;
}

export interface PayrollDepartmentRow {
  departmentCode: string;
  totalNet: number;
  totalGross: number;
  totalTax: number;
  count: number;
}

export const payrollService = {
  list: (params: Record<string, any>) => api.get<PayrollListResponse>('/payroll', params),
  summary: () => api.get<PayrollSummary>('/payroll/summary'),
  trend: (months = 12) => api.get<PayrollTrendPoint[]>('/payroll/trend', { months }),
  byDepartment: (month: number, year: number) =>
    api.get<PayrollDepartmentRow[]>('/payroll/by-department', { month, year }),
  employeeHistory: (employeeCode: string, limit = 24) =>
    api.get<any[]>('/payroll/employee/' + employeeCode, { limit }),
};