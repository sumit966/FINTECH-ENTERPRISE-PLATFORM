import { api } from './api';

export interface DocumentRow {
  id: string; documentCode: string; title: string; category: string;
  mimeType: string; sizeBytes: number; storageUrl: string;
  accessLevel: string; tags: string[]; version: number;
  ownerId: string | null; ownerCode: string | null; ownerName: string | null;
  createdAt: string; updatedAt: string;
}
export interface DocumentsSummary {
  total: number; totalSizeBytes: number;
  byCategory: { category: string; count: number }[];
  byAccessLevel: { accessLevel: string; count: number }[];
}
export const documentService = {
  list: (params: Record<string, any>) => api.get<{ items: DocumentRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/documents', params),
  summary: () => api.get<DocumentsSummary>('/documents/summary'),
};