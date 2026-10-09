import { api } from './api';

export interface EmployeeListItem {
  id: string;
  employeeCode: string;
  fullName: string;
  gender: string;
  email: string;
  phone: string;
  locationCode: string;
  locationCity: string;
  departmentCode: string;
  departmentName: string;
  teamCode: string | null;
  teamName: string | null;
  designation: string;
  employmentType: string;
  employmentStatus: string;
  experienceYears: number;
  joiningDate: string;
  basicSalary: number;
  netSalary: number;
  performanceScore: number | null;
  managerName: string | null;
  managerCode: string | null;
}

export interface EmployeeListResponse {
  items: EmployeeListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface EmployeeDetail extends EmployeeListItem {
  personalEmail: string | null;
  dateOfBirth: string;
  salaryGrade: string;
  hra: number;
  allowances: number;
  bonus: number;
  grossSalary: number;
  deductions: number;
  leaveBalance: number;
  costCenter: string | null;
  location: { code: string; name: string; city: string };
  department: { code: string; name: string; category: string };
  team: { code: string; name: string } | null;
  manager: { id: string; employeeCode: string; fullName: string } | null;
  teamLead: { id: string; employeeCode: string; fullName: string } | null;
  reports: { id: string; employeeCode: string; fullName: string }[];
  skills: { name: string; category: string; proficiency: number; yearsUsed: number | null }[];
  certifications: { code: string; name: string; issuer: string; issuedAt: string; expiresAt: string | null }[];
}

export interface EmployeeStats {
  total: number;
  byLocation: { code: string; city: string; count: number }[];
  byDepartment: { code: string; name: string; category: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byGrade: { grade: string; count: number }[];
  byGender: { gender: string; count: number }[];
}

export interface ListEmployeesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  locationCode?: string;
  departmentCode?: string;
  status?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export const employeeService = {
  list: (params: ListEmployeesParams) => api.get<EmployeeListResponse>('/employees', params as any),
  detail: (id: string) => api.get<EmployeeDetail>('/employees/' + id),
  stats: () => api.get<EmployeeStats>('/employees/stats'),
};