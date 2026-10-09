import { api } from './api';

export interface LicenseRow {
  id: string; licenseCode: string; product: string; vendorId: string | null;
  seats: number; usedSeats: number; costPerSeat: number; currency: string;
  totalCost: number; purchasedAt: string; renewalAt: string; status: string;
  utilisation: number; daysToRenewal: number;
}
export interface LicenseSummary {
  total: number; totalSeats: number; usedSeats: number;
  overallUtilisation: number; totalCost: number; expiringIn60Days: number;
  byStatus: { status: string; count: number }[];
}
export const licenseService = {
  list: (params: Record<string, any>) => api.get<{ items: LicenseRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/licenses', params),
  summary: () => api.get<LicenseSummary>('/licenses/summary'),
};