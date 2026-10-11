import { api } from './api';

export interface ExamListItem {
  id: string;
  assessmentCode: string;
  title: string;
  description: string | null;
  durationMins: number;
  totalPoints: number;
  category: string;
  isActive: boolean;
  questionCount: number;
  attemptCount: number;
  createdAt: string;
}

export interface ExamDetail {
  id: string;
  assessmentCode: string;
  title: string;
  description: string | null;
  durationMins: number;
  totalPoints: number;
  category: string;
  isActive: boolean;
  questions: { id: string; order: number; questionCode: string; type: string; category: string; difficulty: string; prompt: string; points: number }[];
}

export interface AvailableQuestion {
  id: string;
  questionCode: string;
  type: string;
  category: string;
  difficulty: string;
  prompt: string;
  points: number;
}

export const examBuilderService = {
  list: () => api.get<ExamListItem[]>('/exams/builder/list'),
  detail: (id: string) => api.get<ExamDetail>('/exams/builder/' + id),
  questions: () => api.get<AvailableQuestion[]>('/exams/builder/questions'),
  create: (input: any) => api.post<{ id: string; assessmentCode: string; title: string; totalPoints: number; questionCount: number }>('/exams/builder', input),
  publish: (id: string) => api.post<{ id: string; isActive: boolean }>('/exams/builder/' + id + '/publish'),
  unpublish: (id: string) => api.post<{ id: string; isActive: boolean }>('/exams/builder/' + id + '/unpublish'),
};