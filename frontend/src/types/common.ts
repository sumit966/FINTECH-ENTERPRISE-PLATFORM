// Shared frontend types.

export interface UserRole {
  code: string;
  name: string;
  level: number;
}

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  roles: UserRole[];
  permissions: string[];
  employeeId: string | null;
  employeeCode: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type SortDirection = 'asc' | 'desc';

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: SortDirection;
  [key: string]: any;
}