import { api } from './api';
export interface AutomationRule {
  id: string; code: string; name: string; description: string | null;
  trigger: string; triggerExpr: string | null; action: string;
  isEnabled: boolean; lastRunAt: string | null; lastStatus: string | null;
}
export interface AutomationRunLog {
  id: string; ruleCode: string; trigger: string; status: string;
  message: string | null; startedAt: string; completedAt: string | null;
}
export const automationService = {
  rules: () => api.get<AutomationRule[]>('/automation/rules'),
  logs: (limit = 50) => api.get<AutomationRunLog[]>('/automation/logs', { limit }),
  toggle: (id: string, enabled: boolean) => api.post<{ id: string; isEnabled: boolean }>('/automation/rules/' + id + '/toggle', { enabled }),
  simulate: (code: string) => api.post<AutomationRunLog>('/automation/rules/' + code + '/simulate'),
};