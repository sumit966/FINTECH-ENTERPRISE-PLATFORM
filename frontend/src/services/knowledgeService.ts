import { api } from './api';

export interface KnowledgeRow {
  id: string; slug: string; title: string; category: string;
  body: string; tags: string[]; published: boolean; viewCount: number;
  createdAt: string; updatedAt: string;
}
export interface KnowledgeSummary {
  total: number;
  byCategory: { category: string; count: number; totalViews: number }[];
  topViewed: { slug: string; title: string; viewCount: number; category: string }[];
}
export const knowledgeService = {
  list: (params: Record<string, any>) => api.get<{ items: KnowledgeRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/knowledge', params),
  detail: (slug: string) => api.get<KnowledgeRow>('/knowledge/' + slug),
  summary: () => api.get<KnowledgeSummary>('/knowledge/summary'),
};