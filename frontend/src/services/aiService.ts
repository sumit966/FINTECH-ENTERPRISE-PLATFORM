import { api } from './api';

export interface AiAnswer {
  question: string;
  answer: string;
  rows?: Record<string, any>[];
  kind: 'text' | 'table';
  provider: string;
}
export const aiService = {
  ask: (question: string) => api.post<AiAnswer>('/ai/ask', { question }),
  provider: () => api.get<{ provider: string }>('/ai/provider'),
};