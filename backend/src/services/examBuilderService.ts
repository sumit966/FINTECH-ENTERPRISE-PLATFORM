import { prisma } from '../config/prisma';

export interface CreateExamInput {
  assessmentCode: string;
  title: string;
  description?: string;
  durationMins: number;
  category: 'TECHNICAL' | 'APTITUDE' | 'CODING';
  questionCodes: string[];
  passingMarks?: number;
}

export async function listExams() {
  const rows = await prisma.assessment.findMany({
    orderBy: { createdAt: 'desc' },
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
    createdAt: a.createdAt,
  }));
}

export async function getExam(id: string) {
  const a = await prisma.assessment.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { order: 'asc' },
        include: { question: true },
      },
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
    questions: a.questions.map((q) => ({
      id: q.question.id,
      order: q.order,
      questionCode: q.question.questionCode,
      type: q.question.type,
      category: q.question.category,
      difficulty: q.question.difficulty,
      prompt: q.question.prompt,
      points: q.question.points,
    })),
  };
}

export async function createExam(input: CreateExamInput, actorUserId: string | null) {
  // Uniqueness
  const existing = await prisma.assessment.findUnique({ where: { assessmentCode: input.assessmentCode } });
  if (existing) {
    throw Object.assign(new Error('Exam code already exists'), { status: 409, code: 'CONFLICT' });
  }

  // Look up questions
  const questions = await prisma.question.findMany({
    where: { questionCode: { in: input.questionCodes } },
  });
  if (questions.length !== input.questionCodes.length) {
    throw Object.assign(new Error('One or more question codes are invalid'), { status: 422, code: 'VALIDATION' });
  }

  const totalPoints = questions.reduce((s, q) => s + q.points, 0);

  const created = await prisma.assessment.create({
    data: {
      assessmentCode: input.assessmentCode,
      title: input.title,
      description: input.description || null,
      durationMins: input.durationMins,
      totalPoints,
      category: input.category,
      isActive: true,
    },
  });

  // Link questions
  for (let i = 0; i < input.questionCodes.length; i++) {
    const q = questions.find((x) => x.questionCode === input.questionCodes[i]);
    if (!q) continue;
    await prisma.assessmentQuestion.create({
      data: { assessmentId: created.id, questionId: q.id, order: i + 1 },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: actorUserId,
      action: 'CREATE',
      module: 'exams',
      recordId: created.id,
      newValue: { assessmentCode: created.assessmentCode, title: created.title, questionCount: questions.length } as any,
    },
  });

  return {
    id: created.id,
    assessmentCode: created.assessmentCode,
    title: created.title,
    totalPoints: created.totalPoints,
    questionCount: questions.length,
  };
}

export async function publishExam(id: string, actorUserId: string | null) {
  const updated = await prisma.assessment.update({
    where: { id },
    data: { isActive: true },
  });
  await prisma.auditLog.create({
    data: {
      userId: actorUserId,
      action: 'UPDATE',
      module: 'exams',
      recordId: id,
      newValue: { event: 'PUBLISHED', assessmentCode: updated.assessmentCode } as any,
    },
  });
  return { id: updated.id, isActive: updated.isActive };
}

export async function unpublishExam(id: string, actorUserId: string | null) {
  const updated = await prisma.assessment.update({
    where: { id },
    data: { isActive: false },
  });
  await prisma.auditLog.create({
    data: {
      userId: actorUserId,
      action: 'UPDATE',
      module: 'exams',
      recordId: id,
      newValue: { event: 'UNPUBLISHED', assessmentCode: updated.assessmentCode } as any,
    },
  });
  return { id: updated.id, isActive: updated.isActive };
}

export async function availableQuestions() {
  const rows = await prisma.question.findMany({
    orderBy: { questionCode: 'asc' },
    select: { id: true, questionCode: true, type: true, category: true, difficulty: true, prompt: true, points: true },
  });
  return rows;
}