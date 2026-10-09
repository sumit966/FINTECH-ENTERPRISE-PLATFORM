import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

// ---------- Questions ----------
export interface ListQuestionsParams {
  page: number; pageSize: number;
  search?: string; category?: string; difficulty?: string; type?: string;
}

export async function listQuestions(params: ListQuestionsParams) {
  const { page, pageSize, search, category, difficulty, type } = params;
  const where: Prisma.QuestionWhereInput = {};
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;
  if (type) where.type = type as any;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { questionCode: { contains: q, mode: 'insensitive' } },
      { prompt: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { questionCode: 'asc' },
    }),
  ]);

  const items = rows.map((q) => ({
    id: q.id,
    questionCode: q.questionCode,
    type: q.type,
    category: q.category,
    difficulty: q.difficulty,
    prompt: q.prompt,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    points: q.points,
    timeLimitSec: q.timeLimitSec,
    hasStarterCode: !!q.starterCode,
  }));
  return paginated(items, page, pageSize, total);
}

// ---------- Assessments ----------
export async function listAssessments() {
  const rows = await prisma.assessment.findMany({
    orderBy: { assessmentCode: 'asc' },
    include: { _count: { select: { questions: true, attempts: true } } },
  });
  return rows.map((a) => ({
    id: a.id,
    assessmentCode: a.assessmentCode,
    title: a.title,
    description: a.description,
    durationMins: a.durationMins,
    totalPoints: a.totalPoints,
    category: a.category,
    isActive: a.isActive,
    questionCount: a._count.questions,
    attemptCount: a._count.attempts,
  }));
}

export async function getAssessmentDetail(assessmentCode: string) {
  const a = await prisma.assessment.findUnique({
    where: { assessmentCode },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { question: true },
      },
      _count: { select: { attempts: true } },
    },
  });
  if (!a) return null;

  return {
    id: a.id,
    assessmentCode: a.assessmentCode,
    title: a.title,
    description: a.description,
    durationMins: a.durationMins,
    totalPoints: a.totalPoints,
    category: a.category,
    isActive: a.isActive,
    attemptCount: a._count.attempts,
    questions: a.questions.map((aq) => ({
      id: aq.question.id,
      order: aq.order,
      questionCode: aq.question.questionCode,
      type: aq.question.type,
      category: aq.question.category,
      difficulty: aq.question.difficulty,
      prompt: aq.question.prompt,
      options: aq.question.options,
      correctAnswer: aq.question.correctAnswer,
      explanation: aq.question.explanation,
      points: aq.question.points,
      timeLimitSec: aq.question.timeLimitSec,
    })),
  };
}

// ---------- Attempts ----------
export interface ListAttemptsParams {
  page: number; pageSize: number;
  search?: string; status?: string; assessmentCode?: string;
}

export async function listAttempts(params: ListAttemptsParams) {
  const { page, pageSize, search, status, assessmentCode } = params;
  const where: Prisma.ExamAttemptWhereInput = {};
  if (status) where.status = status as any;
  if (assessmentCode) where.assessment = { assessmentCode };
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { attemptCode: { contains: q, mode: 'insensitive' } },
      { candidate: { fullName: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.examAttempt.count({ where }),
    prisma.examAttempt.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { startedAt: 'desc' },
      include: {
        assessment: { select: { assessmentCode: true, title: true, category: true } },
        candidate: { select: { candidateCode: true, fullName: true } },
      },
    }),
  ]);

  const items = rows.map((a) => ({
    id: a.id,
    attemptCode: a.attemptCode,
    assessmentCode: a.assessment.assessmentCode,
    assessmentTitle: a.assessment.title,
    assessmentCategory: a.assessment.category,
    candidateCode: a.candidate?.candidateCode || null,
    candidateName: a.candidate?.fullName || null,
    startedAt: a.startedAt,
    submittedAt: a.submittedAt,
    status: a.status,
    score: a.score ? Number(a.score) : null,
    totalPoints: a.totalPoints,
  }));
  return paginated(items, page, pageSize, total);
}

// ---------- Summary ----------
export async function getExamsSummary() {
  const [totalQ, byCategory, byDifficulty, byType, totalA, totalAttempts, avgScore] = await Promise.all([
    prisma.question.count(),
    prisma.question.groupBy({ by: ['category'], _count: { _all: true } }),
    prisma.question.groupBy({ by: ['difficulty'], _count: { _all: true } }),
    prisma.question.groupBy({ by: ['type'], _count: { _all: true } }),
    prisma.assessment.count(),
    prisma.examAttempt.count(),
    prisma.examAttempt.aggregate({ _avg: { score: true } }),
  ]);

  return {
    totalQuestions: totalQ,
    totalAssessments: totalA,
    totalAttempts,
    averageScore: Number(avgScore._avg.score || 0),
    byCategory: byCategory.map((c) => ({ category: c.category, count: c._count._all })).sort((a, b) => b.count - a.count),
    byDifficulty: byDifficulty.map((d) => ({ difficulty: d.difficulty, count: d._count._all })),
    byType: byType.map((t) => ({ type: t.type, count: t._count._all })),
  };
}