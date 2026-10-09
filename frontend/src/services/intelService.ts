import { api } from './api';

export interface KpiSnapshot { id: string; value: number; capturedAt: string; }
export interface Kpi {
  id: string; code: string; name: string; category: string; unit: string;
  formula: string; targetValue: number | null; currentValue: number | null;
  trend: string | null; updatedAt: string;
  snapshots: KpiSnapshot[];
}
export interface CategoryScore {
  category: string; score: number | null; kpiCount: number;
  totalTarget: number; totalCurrent: number;
}
export interface OverallHealth {
  overallScore: number | null;
  categories: CategoryScore[];
}
export const intelService = {
  kpis: (category?: string) => api.get<Kpi[]>('/intel/kpis', category ? { category } : {}),
  kpiDetail: (code: string) => api.get<Kpi>('/intel/kpis/' + code),
  scores: () => api.get<CategoryScore[]>('/intel/scores'),
  health: () => api.get<OverallHealth>('/intel/health'),
};