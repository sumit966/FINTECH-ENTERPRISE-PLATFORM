import { api } from './api';

export interface QuestionRow {
  id: string; questionCode: string; type: string; category: string; difficulty: string;
  prompt: string; options: string[]; correctAnswer: string; explanation: string | null;
  points: number; timeLimitSec: number; hasStarterCode: boolean;
}

export interface AssessmentRow {
  id: string; assessmentCode: string; title: string; description: string | null;
  durationMins: number; totalPoints: number; category: string; isActive: boolean;
  questionCount: number; attemptCount: number;
}

export interface AssessmentDetail extends AssessmentRow {
  questions: { id: string; order: number; questionCode: string; type: string; category: string; difficulty: string; prompt: string; options: string[]; correctAnswer: string; explanation: string | null; points: number; timeLimitSec: number }[];
}

export interface AttemptRow {
  id: string; attemptCode: string;
  assessmentCode: string; assessmentTitle: string; assessmentCategory: string;
  candidateCode: string | null; candidateName: string | null;
  startedAt: string; submittedAt: string | null;
  status: string; score: number | null; totalPoints: number | null;
}

export interface ExamsSummary {
  totalQuestions: number; totalAssessments: number; totalAttempts: number; averageScore: number;
  byCategory: { category: string; count: number }[];
  byDifficulty: { difficulty: string; count: number }[];
  byType: { type: string; count: number }[];
}

export const examService = {
  summary: () => api.get<ExamsSummary>('/exams/summary'),
  questions: (params: Record<string, any>) => api.get<{ items: QuestionRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/exams/questions', params),
  assessments: () => api.get<AssessmentRow[]>('/exams/assessments'),
  assessmentDetail: (code: string) => api.get<AssessmentDetail>('/exams/assessments/' + code),
  attempts: (params: Record<string, any>) => api.get<{ items: AttemptRow[]; total: number; totalPages: number; page: number; pageSize: number }>('/exams/attempts', params),
};