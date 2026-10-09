import { api } from './api';

export interface ExecutiveSnapshot {
  headcount: number;
  activeProjects: number;
  totalProjects: number;
  clients: number;
  revenuePaid: number;
  revenueInvoiced: number;
  payrollNetYtd: number;
  openInvoices: number;
  overdueInvoices: number;
  overdueAmount: number;
  openSecurity: number;
  criticalSecurity: number;
  attendanceThisMonth: number;
  onLeaveToday: number;
  avgProjectHealth: number;
  avgProjectRisk: number;
  recentAudit: { id: string; userEmail: string | null; action: string; module: string; createdAt: string }[];
}
export interface OrgTree {
  locations: { code: string; city: string; count: number }[];
  departments: { code: string; name: string; category: string; count: number }[];
  grid: { locationCode: string; departmentCode: string; count: number }[];
}
export interface RevenuePoint { label: string; revenue: number; payroll: number; }
export interface RiskRadar {
  highRiskProjects: { code: string; name: string; risk: string; status: string }[];
  overdueInvoices: { number: string; client: string; total: number; dueDate: string }[];
  criticalSecurity: { code: string; title: string; createdAt: string }[];
  pendingLeaves: { employee: string; code: string; from: string; to: string }[];
  delayedProjects: { code: string; name: string; progress: number }[];
}
export const execService = {
  snapshot: () => api.get<ExecutiveSnapshot>('/exec/snapshot'),
  orgTree: () => api.get<OrgTree>('/exec/org-tree'),
  revenueTrend: (months = 12) => api.get<RevenuePoint[]>('/exec/revenue-trend', { months }),
  riskRadar: () => api.get<RiskRadar>('/exec/risk-radar'),
};