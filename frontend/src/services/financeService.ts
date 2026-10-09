import { api } from './api';

export interface InvoiceRow {
  id: string;
  invoiceNumber: string;
  clientCode: string;
  clientName: string;
  clientCountry: string;
  projectCode: string | null;
  projectName: string | null;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  subtotal: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  currency: string;
  status: string;
}

export interface ExpenseRow {
  id: string;
  expenseCode: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  incurredAt: string;
  status: string;
  receiptUrl: string | null;
}

export interface FinanceSummary {
  totalInvoiced: number;
  totalSubtotal: number;
  totalTax: number;
  totalInvoiceCount: number;
  totalPaid: number;
  outstanding: number;
  overdueAmount: number;
  overdueCount: number;
  totalExpenses: number;
  totalExpenseCount: number;
  expensesMtd: number;
  projectRevenue: number;
  projectCost: number;
  projectProfit: number;
  projectBudget: number;
  profitMargin: number;
  ageing: { current: number; d30: number; d60: number; d90: number; d90plus: number };
}

export interface RevenueExpensePoint {
  label: string;
  revenue: number;
  expenses: number;
}

export interface ExpenseCategoryRow {
  category: string;
  total: number;
  count: number;
}

export const financeService = {
  summary: () => api.get<FinanceSummary>('/finance/summary'),
  revenueVsExpenses: (months = 12) => api.get<RevenueExpensePoint[]>('/finance/revenue-vs-expenses', { months }),
  expenseBreakdown: () => api.get<ExpenseCategoryRow[]>('/finance/expense-breakdown'),
  topClients: (limit = 10) => api.get<any[]>('/finance/top-clients', { limit }),
  invoices: (params: Record<string, any>) => api.get<{ items: InvoiceRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/finance/invoices', params),
  expenses: (params: Record<string, any>) => api.get<{ items: ExpenseRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/finance/expenses', params),
};