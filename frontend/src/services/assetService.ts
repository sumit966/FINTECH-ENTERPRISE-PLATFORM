import { api } from './api';

export interface AssetRow {
  id: string; assetCode: string; type: string; brand: string; model: string;
  serialNumber: string; assignedToId: string | null; assignedToCode: string | null;
  assignedToName: string | null; locationCode: string | null; locationCity: string | null;
  purchasedAt: string; warrantyUntil: string | null; status: string; cost: number;
}
export interface AssetSummary {
  total: number; totalValue: number; avgCost: number; expiringWarrantyCount: number;
  byType: { type: string; count: number; totalValue: number }[];
  byStatus: { status: string; count: number }[];
}
export const assetService = {
  list: (params: Record<string, any>) => api.get<{ items: AssetRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/assets', params),
  summary: () => api.get<AssetSummary>('/assets/summary'),
};