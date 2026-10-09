import { Response } from 'express';

export function ok<T>(res: Response, data: T, status: number = 200): Response {
  return res.status(status).json({ success: true, data });
}

export function created<T>(res: Response, data: T): Response {
  return ok(res, data, 201);
}

export function fail(res: Response, error: string, status: number = 400, code?: string): Response {
  return res.status(status).json({ success: false, error, code });
}

export interface PaginatedPayload<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function paginated<T>(items: T[], page: number, pageSize: number, total: number): PaginatedPayload<T> {
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function parsePagination(query: any): { page: number; pageSize: number; skip: number; take: number } {
  const page = Math.max(1, Number(query.page) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(query.pageSize) || 20));
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}