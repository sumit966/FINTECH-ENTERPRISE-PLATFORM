import { api } from './api';

export interface AttendanceRow {
  id: string; date: string;
  employeeCode: string; employeeName: string;
  locationCode: string; locationCity: string;
  departmentCode: string; departmentName: string;
  checkIn: string | null; checkOut: string | null;
  workingHours: number | null; overtimeHours: number | null;
  status: string; workMode: string;
}

export interface AttendanceSummary {
  total: number;
  latestDate: string | null;
  latestDateCount: number;
  latestDateBreakdown: { status: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byWorkMode: { workMode: string; count: number }[];
}

export interface AttendanceTrendPoint {
  date: string; present: number; wfh: number; late: number; absent: number; holiday: number; overtime: number;
}

export interface AttendanceDepartmentRow {
  departmentCode: string; departmentName: string; present: number; absent: number; wfh: number; total: number;
}

export const attendanceService = {
  list: (params: Record<string, any>) => api.get<{ items: AttendanceRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/attendance', params),
  summary: () => api.get<AttendanceSummary>('/attendance/summary'),
  trend: (days = 14) => api.get<AttendanceTrendPoint[]>('/attendance/trend', { days }),
  byDepartment: () => api.get<AttendanceDepartmentRow[]>('/attendance/by-department'),
};