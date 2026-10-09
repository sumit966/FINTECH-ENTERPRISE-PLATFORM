import { api } from './api';

export interface ClientListItem {
  id: string;
  clientCode: string;
  companyName: string;
  country: string;
  industry: string;
  billingTerms: string;
  slaTier: string;
  contractValue: number;
  revenue: number;
  healthScore: number | null;
  status: string;
  accountManagerName: string | null;
  projectCount: number;
  contactCount: number;
  contractCount: number;
  invoiceCount: number;
}

export interface ClientListResponse {
  items: ClientListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ClientDetail extends ClientListItem {
  accountManager: { id: string; employeeCode: string; fullName: string; email: string } | null;
  contacts: { id: string; fullName: string; title: string; email: string; phone: string | null; isPrimary: boolean }[];
  contracts: { id: string; contractCode: string; title: string; startDate: string; endDate: string; value: number; currency: string; status: string }[];
  projects: { id: string; projectCode: string; name: string; status: string; progressPercent: number; budget: number; revenue: number; healthScore: number | null }[];
  invoices: { id: string; invoiceNumber: string; issueDate: string; dueDate: string; total: number; paidAmount: number; currency: string; status: string }[];
  invoiceTotals: { totalInvoiced: number; totalPaid: number; invoiceCount: number };
}

export interface ClientSummary {
  total: number;
  byCountry: { country: string; count: number }[];
  byIndustry: { industry: string; count: number }[];
  byStatus: { status: string; count: number }[];
  bySlaTier: { tier: string; count: number }[];
  totalRevenue: number;
  totalContractValue: number;
  topClients: { clientCode: string; companyName: string; country: string; industry: string; revenue: number; slaTier: string }[];
}

export const clientService = {
  list: (params: Record<string, any>) => api.get<ClientListResponse>('/clients', params),
  detail: (code: string) => api.get<ClientDetail>('/clients/' + code),
  summary: () => api.get<ClientSummary>('/clients/summary'),
};