import { api } from './api';

export interface VendorRow {
  id: string; vendorCode: string; name: string; category: string;
  contactName: string; email: string; phone: string;
  country: string; gstNumber: string | null; status: string;
  rating: number | null; poCount: number;
}
export interface PurchaseOrderRow {
  id: string; poNumber: string; title: string; description: string | null;
  amount: number; currency: string; issuedAt: string; deliveredAt: string | null;
  status: string; vendorCode: string; vendorName: string; vendorCountry: string;
}
export interface VendorSummary {
  total: number; poTotal: number; totalPoValue: number;
  byCategory: { category: string; count: number }[];
  byCountry: { country: string; count: number }[];
  byStatus: { status: string; count: number }[];
}
export const vendorService = {
  list: (params: Record<string, any>) => api.get<{ items: VendorRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/vendors', params),
  purchaseOrders: (params: Record<string, any>) => api.get<{ items: PurchaseOrderRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/vendors/purchase-orders', params),
  summary: () => api.get<VendorSummary>('/vendors/summary'),
};