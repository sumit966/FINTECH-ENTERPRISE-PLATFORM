import { api } from './api';

export interface CalendarEvent {
  id: string; title: string; description: string | null; category: string;
  startAt: string; endAt: string; allDay: boolean;
  location: string | null; projectId: string | null; clientId: string | null;
}
export interface CalendarSummary {
  total: number;
  byCategory: { category: string; count: number }[];
  upcoming: { id: string; title: string; category: string; startAt: string; allDay: boolean; location: string | null }[];
}
export const calendarService = {
  list: (params: { from?: string; to?: string; category?: string }) => api.get<CalendarEvent[]>('/calendar', params),
  summary: () => api.get<CalendarSummary>('/calendar/summary'),
};