import { api } from './api';

export interface OnboardingListItem {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  email: string;
  departmentName: string;
  departmentCode: string;
  locationCity: string;
  joiningDate: string;
  currentStage: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  totalTasks: number;
  completedTasks: number;
  progress: number;
}

export interface OnboardingDetail {
  id: string;
  employee: {
    id: string;
    employeeCode: string;
    fullName: string;
    email: string;
    phone: string;
    joiningDate: string;
    departmentName: string;
    departmentCode: string;
    teamName: string | null;
    locationCity: string;
    managerName: string | null;
  };
  currentStage: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  notes: string | null;
  stages: {
    key: string;
    title: string;
    isCurrent: boolean;
    isComplete: boolean;
    tasks: { id: string; title: string; description: string | null; isComplete: boolean; completedAt: string | null; assignedTo: string | null }[];
  }[];
}

export const onboardingService = {
  list: (params: Record<string, any>) => api.get<{ items: OnboardingListItem[]; total: number; totalPages: number; page: number; pageSize: number }>('/onboarding', params),
  detail: (id: string) => api.get<OnboardingDetail>('/onboarding/' + id),
  start: (employeeCode: string) => api.post<{ id: string }>('/onboarding/start', { employeeCode }),
  completeTask: (taskId: string) => api.post<{ id: string; isComplete: boolean }>('/onboarding/tasks/' + taskId + '/complete'),
};