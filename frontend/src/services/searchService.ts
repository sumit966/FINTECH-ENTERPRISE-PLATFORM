import { api } from './api';

export interface SearchHit {
  kind: 'employee' | 'project' | 'client' | 'candidate' | 'knowledge';
  id: string;
  code: string;
  title: string;
  subtitle: string;
  link: string;
}
export interface SearchResponse {
  hits: SearchHit[];
  took: number;
}
export const searchService = {
  search: (q: string) => api.get<SearchResponse>('/search', { q }),
};