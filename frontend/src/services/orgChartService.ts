import { api } from './api';

export interface OrgNode {
  id: string;
  employeeCode: string;
  fullName: string;
  designation: string;
  departmentCode: string;
  departmentName: string;
  locationCity: string;
  gender: string;
  directReportCount: number;
  reports: OrgNode[];
}
export interface OrgTreeResponse {
  roots: OrgNode[];
  totalNodes: number;
}
export const orgChartService = {
  tree: () => api.get<OrgTreeResponse>('/employees/org-tree'),
};