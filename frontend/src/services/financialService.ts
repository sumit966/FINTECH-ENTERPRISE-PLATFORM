import { api } from './api';

export interface ProjectFinancials {
  projectCode: string;
  projectName: string;
  currency: string;
  contractValue: number;
  approvedBudget: number;
  actualExpenditure: number;
  forecastCost: number;
  recognizedRevenue: number;
  invoicedRevenue: number;
  collected: number;
  outstanding: number;
  employeeCost: number;
  cloudCost: number;
  licenseCost: number;
  vendorCost: number;
  otherCost: number;
  totalProjectCost: number;
  grossProfit: number;
  projectContribution: number;
  contributionMargin: number;
  budgetVariance: number;
  estimateToComplete: number;
  monthlySpend: { label: string; amount: number }[];
  invoiceCollection: { label: string; invoiced: number; collected: number }[];
  dataAvailability: {
    hasInvoices: boolean;
    hasMembers: boolean;
    hasExpenses: boolean;
    hasAssets: boolean;
    hasLicenses: boolean;
  };
}

export const financialService = {
  getProjectFinancials: (projectCode: string) =>
    api.get<ProjectFinancials>('/projects/' + projectCode + '/financials'),
};