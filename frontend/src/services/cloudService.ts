import { api } from './api';

export interface CloudProviderBlock {
  provider: string; region: string;
  services: { name: string; [key: string]: any }[];
  monthlyCost: number;
  environment: string;
}
export interface CloudOverview {
  label: string;
  providers: CloudProviderBlock[];
  totals: {
    monthlyCloudSpend: number;
    activeDeployments: number;
    activeProjectsUsingCloud: number;
    computeHoursMonth: number;
  };
}
export const cloudService = {
  overview: () => api.get<CloudOverview>('/cloud/overview'),
};