import { api } from './api';

export interface JobRow {
  id: string; jobCode: string; title: string;
  departmentCode: string; departmentName: string;
  locationCode: string; locationCity: string;
  employmentType: string; level: string;
  minExperience: number; maxExperience: number;
  openings: number; status: string; postedAt: string;
  requiredSkills: string[]; candidateCount: number;
}

export interface CandidateRow {
  id: string; candidateCode: string; fullName: string; email: string; phone: string;
  resumeUrl: string | null; currentCompany: string | null;
  currentCtc: number | null; expectedCtc: number | null;
  noticePeriod: number | null; source: string; stage: string;
  score: number | null; appliedAt: string;
  jobCode: string; jobTitle: string;
}

export interface CandidateDetail extends CandidateRow {
  job: { jobCode: string; title: string; level: string; requiredSkills: string[] };
  interviews: { id: string; round: string; scheduledAt: string; durationMins: number; mode: string; status: string; score: number | null; recommendation: string | null; feedback: string | null; interviewer: { id: string; employeeCode: string; fullName: string } | null }[];
  examAttempts: { id: string; attemptCode: string; assessmentCode: string; assessmentTitle: string; assessmentCategory: string; startedAt: string; submittedAt: string | null; score: number | null; status: string }[];
}

export interface PipelineStage {
  stage: string;
  count: number;
  samples: { id: string; candidateCode: string; fullName: string; score: number | null; jobTitle: string }[];
}

export interface RecruitmentSummary {
  totalJobs: number; openJobs: number; totalOpeningsRequested: number; totalCandidates: number;
  byStage: { stage: string; count: number }[];
  bySource: { source: string; count: number }[];
  scheduledInterviews: number;
  totalExamAttempts: number;
}

export const recruitmentService = {
  summary: () => api.get<RecruitmentSummary>('/recruitment/summary'),
  jobs: (params: Record<string, any>) => api.get<{ items: JobRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/recruitment/jobs', params),
  candidates: (params: Record<string, any>) => api.get<{ items: CandidateRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/recruitment/candidates', params),
  candidateDetail: (code: string) => api.get<CandidateDetail>('/recruitment/candidates/' + code),
  pipeline: () => api.get<{ stages: PipelineStage[] }>('/recruitment/pipeline'),
  interviews: (limit = 20) => api.get<any[]>('/recruitment/interviews', { limit }),
};