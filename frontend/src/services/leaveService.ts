import { api } from './api';

export interface LeaveRow {
  id: string;
  employeeCode: string; employeeName: string;
  departmentCode: string; departmentName: string;
  locationCity: string;
  leaveType: string; startDate: string; endDate: string;
  days: number; reason: string | null; status: string;
  approvedAt: string | null; rejectionReason: string | null;
}

export interface LeaveSummary {
  total: number;
  totalDaysApproved: number;
  byStatus: { status: string; count: number }[];
  byType: { leaveType: string; count: number; days: number }[];
}

export interface LeaveDepartmentRow {
  departmentCode: string; departmentName: string; requests: number; days: number;
}

export interface LeaveDetail extends LeaveRow {
  employeeEmail: string;
  manager: { id: string; employeeCode: string; fullName: string; email: string } | null;
  createdAt: string;
  audit: { id: string; action: string; userId: string | null; at: string; payload: any }[];
}

export const leaveService = {
  list: (params: Record<string, any>) => api.get<{ items: LeaveRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/leave', params),
  summary: () => api.get<LeaveSummary>('/leave/summary'),
  byDepartment: () => api.get<LeaveDepartmentRow[]>('/leave/by-department'),
  detail: (id: string) => api.get<LeaveDetail>('/leave/' + id),
  approve: (id: string) => api.post<{ id: string; status: string; approvedAt: string }>('/leave/' + id + '/approve'),
  reject: (id: string, reason: string) => api.post<{ id: string; status: string; approvedAt: string; rejectionReason: string }>('/leave/' + id + '/reject', { reason }),
};
