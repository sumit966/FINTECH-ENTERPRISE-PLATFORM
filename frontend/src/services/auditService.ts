import { api } from './api';

export interface AuditLogRow {
  id: string;
  userEmail: string | null;
  userName: string | null;
  userId: string | null;
  action: string;
  module: string;
  recordId: string | null;
  oldValue: any;
  newValue: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}
export interface AuditSummary {
  total: number;
  last24h: number;
  last7d: number;
  byAction: { action: string; count: number }[];
  byModule: { module: string; count: number }[];
  topUsers: { userEmail: string | null; count: number }[];
}
export const auditService = {
  list: (params: Record<string, any>) => api.get<{ items: AuditLogRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/audit', params),
  summary: () => api.get<AuditSummary>('/audit/summary'),
};