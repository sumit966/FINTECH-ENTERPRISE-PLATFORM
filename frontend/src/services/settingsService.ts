import { api } from './api';

export interface SystemOverview {
  runtime: {
    nodeVersion: string; platform: string; uptimeSeconds: number;
    environment: string; memoryMb: number;
  };
  database: {
    latencyMs: number; totalRows: number;
    tables: { label: string; model: string; count: number }[];
  };
}
export interface Integration {
  code: string; name: string; description: string; envVar: string;
  status: 'CONFIGURED' | 'INTEGRATION_REQUIRED';
}
export interface About {
  platform: string; company: string; founder: string;
  headquarters: string; locations: string[];
  version: string; build: string; license: string; description: string;
}
export const settingsService = {
  overview: () => api.get<SystemOverview>('/settings/overview'),
  integrations: () => api.get<Integration[]>('/settings/integrations'),
  about: () => api.get<About>('/settings/about'),
};