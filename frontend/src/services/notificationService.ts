import { api } from './api';

export interface NotificationRow {
  id: string; type: string; title: string; body: string; link: string | null;
  isRead: boolean; readAt: string | null; createdAt: string;
}
export interface NotificationListResponse {
  items: NotificationRow[];
  total: number; totalPages: number; page: number; pageSize: number;
  unreadCount: number;
}
export const notificationService = {
  list: (params: Record<string, any>) => api.get<NotificationListResponse>('/notifications', params),
  markRead: (id: string) => api.post<{ count: number }>('/notifications/' + id + '/read'),
  markAllRead: () => api.post<{ count: number }>('/notifications/read-all'),
};