import { api } from './api';
export interface BiometricDevice {
  id: string; deviceCode: string; name: string; vendor: string; model: string;
  locationCode: string; ipAddress: string | null; integrationType: string;
  status: string; lastSyncAt: string | null; notes: string | null;
}
export interface BiometricSummary {
  total: number; connected: number; integrationRequired: number; error: number;
}
export const biometricService = {
  list: () => api.get<BiometricDevice[]>('/biometric'),
  summary: () => api.get<BiometricSummary>('/biometric/summary'),
  create: (input: any) => api.post<{ id: string; deviceCode: string }>('/biometric', input),
};