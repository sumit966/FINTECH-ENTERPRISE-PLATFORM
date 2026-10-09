import { api } from './api';

export interface ProjectListItem {
  id: string;
  projectCode: string;
  name: string;
  clientCode: string;
  clientName: string;
  clientCountry: string;
  clientIndustry: string;
  slaTier: string;
  industry: string;
  country: string;
  status: string;
  progressPercent: number;
  budget: number;
  revenue: number;
  cost: number;
  profit: number;
  startDate: string;
  expectedEndDate: string;
  actualEndDate: string | null;
  healthScore: number | null;
  riskScore: number | null;
  projectManagerName: string | null;
  teamName: string | null;
  memberCount: number;
  taskCount: number;
  milestoneCount: number;
  riskCount: number;
  invoiceCount: number;
  techFrontend: string[];
  techBackend: string[];
  techCloud: string[];
}

export interface ProjectListResponse {
  items: ProjectListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ReferenceProject {
  name: string;
  repoUrl: string;
  description: string;
  architecture: string;
  techStack: {
    frontend: string[];
    backend: string[];
    database: string[];
    infrastructure: string[];
  };
  installSteps: string[];
  keyFeatures: string[];
}

export interface ProjectDetail extends ProjectListItem {
  reference: ReferenceProject | null;
  techDatabase: string[];
  techAI: string[];
  integrations: string[];
  apiStyle: string | null;
  environment: string;
  repository: string | null;
  securityStatus: string;
  qaStatus: string;
  client: {
    id: string;
    clientCode: string;
    companyName: string;
    country: string;
    industry: string;
    slaTier: string;
    healthScore: number | null;
  };
  location: { code: string; city: string } | null;
  team: { code: string; name: string } | null;
  projectManager: { id: string; employeeCode: string; fullName: string; email: string } | null;
  members: { id: string; employeeId: string; employeeCode: string; fullName: string; email: string; role: string; allocation: number }[];
  tasks: { id: string; taskCode: string; title: string; status: string; priority: string; estimateHrs: number | null; spentHrs: number | null; dueDate: string | null; completedAt: string | null }[];
  milestones: { id: string; title: string; dueDate: string; completedAt: string | null; status: string }[];
  risks: { id: string; title: string; description: string; severity: string; probability: number | null; impact: number | null; mitigation: string; status: string }[];
  invoices: { id: string; invoiceNumber: string; issueDate: string; dueDate: string; total: number; currency: string; status: string; paidAmount: number }[];
  repositories: { id: string; repoCode: string; name: string; url: string; language: string }[];
  deployments: { id: string; deploymentCode: string; environment: string; version: string; status: string; deployedAt: string }[];
}

export interface ProjectSummary {
  total: number;
  byStatus: { status: string; count: number }[];
  byIndustry: { industry: string; count: number }[];
  totalBudget: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  avgHealth: number;
  avgRisk: number;
  avgProgress: number;
  topClients: { clientCode: string; companyName: string; projectCount: number }[];
}

export const projectService = {
  list: (params: Record<string, any>) => api.get<ProjectListResponse>('/projects', params),
  detail: (code: string) => api.get<ProjectDetail>('/projects/' + code),
  summary: () => api.get<ProjectSummary>('/projects/summary'),
};