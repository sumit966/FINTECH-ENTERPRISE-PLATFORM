import { api } from './api';

export interface RepoRow {
  id: string; repoCode: string; name: string; provider: string; url: string;
  defaultBranch: string; language: string; isPrivate: boolean;
  projectCode: string | null; projectName: string | null;
  prCount: number; buildCount: number;
}
export interface RepoDetail extends RepoRow {
  project: { projectCode: string; name: string; status: string } | null;
  pullRequests: PRRow[];
  builds: BuildRow[];
}
export interface PRRow {
  id: string; prNumber: number; title: string;
  repoCode?: string; repoName?: string;
  sourceBranch: string; targetBranch: string;
  status: string; additions: number; deletions: number;
  openedAt: string; mergedAt: string | null; reviewedBy?: string[];
}
export interface TestRunData {
  totalTests: number; passed: number; failed: number; skipped: number;
  coveragePct: number | null; durationSec: number;
}
export interface BuildRow {
  id: string; buildCode: string; branch: string; commitSha: string;
  status: string; durationSec: number; triggeredBy: string | null;
  startedAt: string; completedAt: string | null;
  repoCode: string; repoName: string;
  testRun: TestRunData | null;
}
export interface DeploymentRow {
  id: string; deploymentCode: string; environment: string; version: string;
  status: string; deployedAt: string; deployedBy: string | null;
  commitSha: string | null; notes: string | null;
  projectCode: string | null; projectName: string | null;
}
export interface EngineeringSummary {
  repoCount: number; prTotal: number; prOpen: number; prMerged: number;
  buildTotal: number; buildSuccess: number; buildSuccessRate: number;
  deployTotal: number; averageCoverage: number;
  deployByEnv: { environment: string; count: number }[];
  languageBreakdown: { language: string; count: number }[];
  prByStatus: { status: string; count: number }[];
  buildByStatus: { status: string; count: number }[];
}

export const engineeringService = {
  summary: () => api.get<EngineeringSummary>('/engineering/summary'),
  repos: (params: Record<string, any>) => api.get<{ items: RepoRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/engineering/repos', params),
  repoDetail: (code: string) => api.get<RepoDetail>('/engineering/repos/' + code),
  pullRequests: (params: Record<string, any>) => api.get<{ items: PRRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/engineering/pull-requests', params),
  builds: (params: Record<string, any>) => api.get<{ items: BuildRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/engineering/builds', params),
  deployments: (params: Record<string, any>) => api.get<{ items: DeploymentRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/engineering/deployments', params),
};