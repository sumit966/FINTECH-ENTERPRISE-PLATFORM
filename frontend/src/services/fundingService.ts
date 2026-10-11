import { api } from './api';

export interface FundingRecord {
  id: string;
  fundingCode: string;
  source: string;
  sourceType: string;
  country: string;
  amount: number;
  currency: string;
  fundingType: string;
  status: string;
  recordedAt: string;
  verifiedAt: string | null;
  approvedAt: string | null;
  notes: string | null;
  totalDisbursed: number;
  totalPlanned: number;
  disbursementCount: number;
  documentCount: number;
}

export interface FundingDetail extends FundingRecord {
  supportingDocumentUrl: string | null;
  pending: number;
  disbursements: { id: string; amount: number; expectedDate: string; receivedAt: string | null; status: string; reference: string | null; notes: string | null }[];
  documents: { id: string; title: string; category: string; url: string; verifiedAt: string | null }[];
}

export interface FundingSummary {
  total: number;
  received: number;
  pending: number;
  count: number;
  byStatus: { status: string; count: number; amount: number }[];
}

export const fundingService = {
  list: () => api.get<FundingRecord[]>('/funding'),
  summary: () => api.get<FundingSummary>('/funding/summary'),
  detail: (code: string) => api.get<FundingDetail>('/funding/' + code),
};