import { api } from './api';

export interface SecurityEventRow {
  id: string; eventCode: string; category: string; severity: string;
  title: string; description: string | null; source: string | null;
  affectedAsset: string | null; status: string;
  resolvedAt: string | null; createdAt: string;
}
export interface SecuritySummary {
  total: number; openCount: number; resolvedCount: number; criticalCount: number;
  securityScore: number;
  bySeverity: { severity: string; count: number }[];
  byCategory: { category: string; count: number }[];
  byStatus: { status: string; count: number }[];
  recent: { id: string; eventCode: string; title: string; severity: string; category: string; status: string; createdAt: string }[];
}
export const securityService = {
  list: (params: Record<string, any>) => api.get<{ items: SecurityEventRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/security/events', params),
  summary: () => api.get<SecuritySummary>('/security/summary'),
};