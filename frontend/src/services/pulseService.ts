import { api } from './api';

export interface PulseOverview {
  headcount: number;
  activeProjects: number;
  totalProjects: number;
  revenueYtd: number;
  activeClients: number;
  openAlerts: number;
  payrollSpendYtd: number;
  openInvoices: number;
  overdueInvoices: number;
  avgProjectHealth: number;
  highRiskProjects: number;
  openSecurityEvents: number;
}

export interface HeadcountByLocation {
  code: string;
  name: string;
  city: string;
  count: number;
}

export interface HeadcountByDepartment {
  code: string;
  name: string;
  category: string;
  count: number;
}

export interface ProjectStatusCount {
  status: string;
  count: number;
}

export interface RecentProject {
  projectCode: string;
  name: string;
  status: string;
  progress: number;
  health: number;
  risk: number;
  budget: number;
  revenue: number;
  clientName: string;
  clientCountry: string;
}

export interface TopClient {
  clientCode: string;
  companyName: string;
  country: string;
  industry: string;
  revenue: number;
  slaTier: string;
  projectCount: number;
}

export interface AlertItem {
  code: string;
  title: string;
  severity: string;
  category: string;
  status: string;
  createdAt: string;
}

export interface PayrollTrendPoint {
  year: number;
  month: number;
  label: string;
  net: number;
  gross: number;
}

export const pulseService = {
  overview: () => api.get<PulseOverview>('/pulse/overview'),
  headcountByLocation: () => api.get<HeadcountByLocation[]>('/pulse/headcount-by-location'),
  headcountByDepartment: () => api.get<HeadcountByDepartment[]>('/pulse/headcount-by-department'),
  projectsByStatus: () => api.get<ProjectStatusCount[]>('/pulse/projects-by-status'),
  recentProjects: (limit = 10) => api.get<RecentProject[]>('/pulse/recent-projects', { limit }),
  topClients: (limit = 5) => api.get<TopClient[]>('/pulse/top-clients', { limit }),
  recentAlerts: (limit = 8) => api.get<AlertItem[]>('/pulse/recent-alerts', { limit }),
  payrollTrend: (months = 6) => api.get<PayrollTrendPoint[]>('/pulse/payroll-trend', { months }),
};