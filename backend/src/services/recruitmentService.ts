import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

// ---------- Jobs ----------
export interface ListJobsParams {
  page: number; pageSize: number; search?: string; status?: string; departmentCode?: string; locationCode?: string;
}

export async function listJobs(params: ListJobsParams) {
  const { page, pageSize, search, status, departmentCode, locationCode } = params;
  const where: Prisma.JobOpeningWhereInput = {};
  if (status) where.status = status as any;
  if (departmentCode) where.departmentId = (await prisma.department.findUnique({ where: { code: departmentCode } }))?.id;
  if (locationCode) where.locationId = (await prisma.location.findUnique({ where: { code: locationCode } }))?.id;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { jobCode: { contains: q, mode: 'insensitive' } },
      { title: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.jobOpening.count({ where }),
    prisma.jobOpening.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { postedAt: 'desc' },
      include: {
        _count: { select: { candidates: true } },
      },
    }),
  ]);

  const depts = await prisma.department.findMany();
  const locs = await prisma.location.findMany();
  const deptById = new Map(depts.map((d) => [d.id, d]));
  const locById = new Map(locs.map((l) => [l.id, l]));

  const items = rows.map((j) => ({
    id: j.id,
    jobCode: j.jobCode,
    title: j.title,
    departmentCode: deptById.get(j.departmentId)?.code || '—',
    departmentName: deptById.get(j.departmentId)?.name || '—',
    locationCode: locById.get(j.locationId)?.code || '—',
    locationCity: locById.get(j.locationId)?.city || '—',
    employmentType: j.employmentType,
    level: j.level,
    minExperience: j.minExperience,
    maxExperience: j.maxExperience,
    openings: j.openings,
    status: j.status,
    postedAt: j.postedAt,
    requiredSkills: j.requiredSkills,
    candidateCount: j._count.candidates,
  }));
  return paginated(items, page, pageSize, total);
}

// ---------- Candidates ----------
export interface ListCandidatesParams {
  page: number; pageSize: number; search?: string; stage?: string; jobCode?: string;
}

export async function listCandidates(params: ListCandidatesParams) {
  const { page, pageSize, search, stage, jobCode } = params;
  const where: Prisma.CandidateWhereInput = {};
  if (stage) where.stage = stage as any;
  if (jobCode) where.job = { jobCode };
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { candidateCode: { contains: q, mode: 'insensitive' } },
      { fullName: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.candidate.count({ where }),
    prisma.candidate.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { appliedAt: 'desc' },
      include: {
        job: { select: { jobCode: true, title: true } },
      },
    }),
  ]);

  const items = rows.map((c) => ({
    id: c.id,
    candidateCode: c.candidateCode,
    fullName: c.fullName,
    email: c.email,
    phone: c.phone,
    resumeUrl: c.resumeUrl,
    currentCompany: c.currentCompany,
    currentCtc: c.currentCtc ? Number(c.currentCtc) : null,
    expectedCtc: c.expectedCtc ? Number(c.expectedCtc) : null,
    noticePeriod: c.noticePeriod,
    source: c.source,
    stage: c.stage,
    score: c.score ? Number(c.score) : null,
    appliedAt: c.appliedAt,
    jobCode: c.job.jobCode,
    jobTitle: c.job.title,
  }));
  return paginated(items, page, pageSize, total);
}

export async function getCandidateDetail(candidateCode: string) {
  const c = await prisma.candidate.findUnique({
    where: { candidateCode },
    include: {
      job: true,
      interviews: {
        orderBy: { scheduledAt: 'desc' },
        include: {
          interviewer: { select: { id: true, employeeCode: true, fullName: true } },
        },
      },
      examAttempts: {
        orderBy: { startedAt: 'desc' },
        include: { assessment: { select: { assessmentCode: true, title: true, category: true } } },
      },
    },
  });
  if (!c) return null;

  return {
    id: c.id,
    candidateCode: c.candidateCode,
    fullName: c.fullName,
    email: c.email,
    phone: c.phone,
    resumeUrl: c.resumeUrl,
    currentCompany: c.currentCompany,
    currentCtc: c.currentCtc ? Number(c.currentCtc) : null,
    expectedCtc: c.expectedCtc ? Number(c.expectedCtc) : null,
    noticePeriod: c.noticePeriod,
    source: c.source,
    stage: c.stage,
    score: c.score ? Number(c.score) : null,
    appliedAt: c.appliedAt,
    job: { jobCode: c.job.jobCode, title: c.job.title, level: c.job.level, requiredSkills: c.job.requiredSkills },
    interviews: c.interviews.map((i) => ({
      id: i.id,
      round: i.round,
      scheduledAt: i.scheduledAt,
      durationMins: i.durationMins,
      mode: i.mode,
      status: i.status,
      score: i.score ? Number(i.score) : null,
      recommendation: i.recommendation,
      feedback: i.feedback,
      interviewer: i.interviewer ? { id: i.interviewer.id, employeeCode: i.interviewer.employeeCode, fullName: i.interviewer.fullName } : null,
    })),
    examAttempts: c.examAttempts.map((a) => ({
      id: a.id,
      attemptCode: a.attemptCode,
      assessmentCode: a.assessment.assessmentCode,
      assessmentTitle: a.assessment.title,
      assessmentCategory: a.assessment.category,
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
      score: a.score ? Number(a.score) : null,
      status: a.status,
    })),
  };
}

// ---------- Pipeline ----------
const PIPELINE_STAGES = ['APPLIED','SCREENING','ASSESSMENT','TECHNICAL_INTERVIEW','MANAGER_INTERVIEW','HR_INTERVIEW','SELECTED','OFFER','JOINED','REJECTED'];

export async function getPipeline() {
  const counts = await prisma.candidate.groupBy({
    by: ['stage'],
    _count: { _all: true },
  });
  const countByStage: Record<string, number> = {};
  for (const c of counts) countByStage[c.stage] = c._count._all;

  // For each stage, fetch a few sample candidates
  const stages: { stage: string; count: number; samples: { id: string; candidateCode: string; fullName: string; score: number | null; jobTitle: string }[] }[] = [];
  for (const stage of PIPELINE_STAGES) {
    const samples = await prisma.candidate.findMany({
      where: { stage: stage as any },
      take: 5,
      orderBy: { appliedAt: 'desc' },
      select: {
        id: true, candidateCode: true, fullName: true, score: true,
        job: { select: { title: true } },
      },
    });
    stages.push({
      stage,
      count: countByStage[stage] || 0,
      samples: samples.map((s) => ({
        id: s.id,
        candidateCode: s.candidateCode,
        fullName: s.fullName,
        score: s.score ? Number(s.score) : null,
        jobTitle: s.job.title,
      })),
    });
  }
  return { stages };
}

// ---------- Summary ----------
export async function getRecruitmentSummary() {
  const [totalJobs, openJobs, totalCandidates, byStage, bySource, recentInterviews, examAttempts] = await Promise.all([
    prisma.jobOpening.count(),
    prisma.jobOpening.count({ where: { status: 'OPEN' } }),
    prisma.candidate.count(),
    prisma.candidate.groupBy({ by: ['stage'], _count: { _all: true } }),
    prisma.candidate.groupBy({ by: ['source'], _count: { _all: true } }),
    prisma.interview.count({ where: { status: 'SCHEDULED' } }),
    prisma.examAttempt.count(),
  ]);
  const totalOpenings = await prisma.jobOpening.aggregate({ _sum: { openings: true }, where: { status: 'OPEN' } });

  return {
    totalJobs,
    openJobs,
    totalOpeningsRequested: totalOpenings._sum.openings || 0,
    totalCandidates,
    byStage: byStage.map((s) => ({ stage: s.stage, count: s._count._all })),
    bySource: bySource.map((s) => ({ source: s.source, count: s._count._all })),
    scheduledInterviews: recentInterviews,
    totalExamAttempts: examAttempts,
  };
}

// ---------- Interviews ----------
export async function listUpcomingInterviews(limit = 20) {
  const rows = await prisma.interview.findMany({
    where: { status: { in: ['SCHEDULED','COMPLETED'] } },
    take: limit,
    orderBy: { scheduledAt: 'desc' },
    include: {
      candidate: { select: { candidateCode: true, fullName: true } },
      interviewer: { select: { employeeCode: true, fullName: true } },
    },
  });
  return rows.map((i) => ({
    id: i.id,
    candidateCode: i.candidate.candidateCode,
    candidateName: i.candidate.fullName,
    round: i.round,
    scheduledAt: i.scheduledAt,
    durationMins: i.durationMins,
    mode: i.mode,
    status: i.status,
    score: i.score ? Number(i.score) : null,
    recommendation: i.recommendation,
    interviewerName: i.interviewer?.fullName || null,
    interviewerCode: i.interviewer?.employeeCode || null,
  }));
}