// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Recruitment seeder (Section 11 Part 4D)
// Inserts: JobOpening, Candidate, Interview, Question, Assessment,
//          AssessmentQuestion, ExamAttempt.
// Idempotent.
// ============================================================================
import { PrismaClient } from '@prisma/client';
import { jobsData } from '../database/data/jobs.data';
import { candidatesData } from '../database/data/candidates.data';
import { interviewsData } from '../database/data/interviews.data';
import { questionsData } from '../database/data/questions.data';
import { assessmentsData } from '../database/data/assessments.data';

const prisma = new PrismaClient();

async function main() {
  console.log('>> Seeding job openings ...');

  const depts = await prisma.department.findMany({ select: { id: true, code: true } });
  const deptIdByCode = new Map(depts.map((d) => [d.code, d.id]));
  const locs = await prisma.location.findMany({ select: { id: true, code: true } });
  const locIdByCode = new Map(locs.map((l) => [l.code, l.id]));

  let jobCount = 0;
  for (const j of jobsData) {
    const departmentId = deptIdByCode.get(j.departmentCode);
    const locationId = locIdByCode.get(j.locationCode);
    if (!departmentId || !locationId) continue;
    await prisma.jobOpening.upsert({
      where: { jobCode: j.jobCode },
      update: {
        title: j.title,
        status: j.status,
        openings: j.openings,
        requiredSkills: j.requiredSkills,
      },
      create: {
        jobCode: j.jobCode,
        title: j.title,
        departmentId,
        locationId,
        employmentType: j.employmentType,
        level: j.level,
        minExperience: j.minExperience,
        maxExperience: j.maxExperience,
        description: j.description,
        requiredSkills: j.requiredSkills,
        openings: j.openings,
        status: j.status,
        postedAt: j.postedAt,
      },
    });
    jobCount++;
  }
  console.log('  [OK] Job openings: ' + jobCount);

  // ---- Candidates ----
  console.log('>> Seeding candidates ...');
  const allJobs = await prisma.jobOpening.findMany({ select: { id: true, jobCode: true } });
  const jobIdByCode = new Map(allJobs.map((j) => [j.jobCode, j.id]));

  let candCount = 0;
  for (const c of candidatesData) {
    const jobId = jobIdByCode.get(c.jobCode);
    if (!jobId) continue;
    await prisma.candidate.upsert({
      where: { candidateCode: c.candidateCode },
      update: {
        stage: c.stage,
        score: c.score,
      },
      create: {
        candidateCode: c.candidateCode,
        jobId,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        resumeUrl: c.resumeUrl,
        currentCompany: c.currentCompany,
        currentCtc: c.currentCtc,
        expectedCtc: c.expectedCtc,
        noticePeriod: c.noticePeriod,
        source: c.source,
        stage: c.stage,
        score: c.score,
        appliedAt: c.appliedAt,
      },
    });
    candCount++;
  }
  console.log('  [OK] Candidates: ' + candCount);

  // ---- Interviews ----
  console.log('>> Seeding interviews ...');
  const allCands = await prisma.candidate.findMany({ select: { id: true, candidateCode: true } });
  const candIdByCode = new Map(allCands.map((c) => [c.candidateCode, c.id]));
  const emps = await prisma.employee.findMany({ select: { id: true, employeeCode: true } });
  const empIdByCode = new Map(emps.map((e) => [e.employeeCode, e.id]));

  let intCount = 0;
  for (const i of interviewsData) {
    const candidateId = candIdByCode.get(i.candidateCode);
    if (!candidateId) continue;
    const interviewerId = empIdByCode.get(i.interviewerCode) || null;

    // No natural unique key on Interview; find by candidateId + round + scheduledAt.
    const existing = await prisma.interview.findFirst({
      where: { candidateId, round: i.round, scheduledAt: i.scheduledAt },
    });
    if (existing) {
      await prisma.interview.update({
        where: { id: existing.id },
        data: { status: i.status, score: i.score, feedback: i.feedback, recommendation: i.recommendation },
      });
    } else {
      await prisma.interview.create({
        data: {
          candidateId,
          round: i.round,
          scheduledAt: i.scheduledAt,
          durationMins: i.durationMins,
          mode: i.mode,
          interviewerId,
          status: i.status,
          feedback: i.feedback,
          score: i.score,
          recommendation: i.recommendation,
        },
      });
    }
    intCount++;
  }
  console.log('  [OK] Interviews: ' + intCount);

  // ---- Questions ----
  console.log('>> Seeding questions ...');
  let qCount = 0;
  for (const q of questionsData) {
    await prisma.question.upsert({
      where: { questionCode: q.questionCode },
      update: {
        prompt: q.prompt,
        options: q.options,
        correctAnswer: q.correctAnswer,
      },
      create: {
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
        starterCode: q.starterCode,
      },
    });
    qCount++;
  }
  console.log('  [OK] Questions: ' + qCount);

  // ---- Assessments ----
  console.log('>> Seeding assessments ...');
  const allQs = await prisma.question.findMany({ select: { id: true, questionCode: true } });
  const qIdByCode = new Map(allQs.map((q) => [q.questionCode, q.id]));

  let asmCount = 0;
  let linkCount = 0;
  for (const a of assessmentsData) {
    const totalPoints = a.questionCodes.reduce((sum, qc) => {
      const q = questionsData.find((x) => x.questionCode === qc);
      return sum + (q ? q.points : 0);
    }, 0);

    const asm = await prisma.assessment.upsert({
      where: { assessmentCode: a.assessmentCode },
      update: { title: a.title, totalPoints, isActive: a.isActive },
      create: {
        assessmentCode: a.assessmentCode,
        title: a.title,
        description: a.description,
        durationMins: a.durationMins,
        totalPoints,
        category: a.category,
        isActive: a.isActive,
      },
    });
    asmCount++;

    for (let k = 0; k < a.questionCodes.length; k++) {
      const qId = qIdByCode.get(a.questionCodes[k]);
      if (!qId) continue;
      await prisma.assessmentQuestion.upsert({
        where: { assessmentId_questionId: { assessmentId: asm.id, questionId: qId } },
        update: { order: k + 1 },
        create: { assessmentId: asm.id, questionId: qId, order: k + 1 },
      });
      linkCount++;
    }
  }
  console.log('  [OK] Assessments: ' + asmCount);
  console.log('  [OK] AssessmentQuestion links: ' + linkCount);

  // ---- ExamAttempts (sample) ----
  console.log('>> Seeding sample exam attempts ...');
  const allAsm = await prisma.assessment.findMany({ select: { id: true, assessmentCode: true } });
  const asmIdByCode = new Map(allAsm.map((a) => [a.assessmentCode, a.id]));

  let attemptCount = 0;
  // Generate ~80 attempts: first 80 candidates attempt the aptitude test, others their domain test.
  for (let i = 0; i < 80; i++) {
    const cand = candidatesData[i];
    if (!cand) break;
    const candidateId = candIdByCode.get(cand.candidateCode);
    if (!candidateId) continue;

    let asmCode = 'ASM-APT-GENERAL';
    if (i % 6 === 0) asmCode = 'ASM-BE-SCREENER';
    else if (i % 6 === 1) asmCode = 'ASM-FE-SCREENER';
    else if (i % 6 === 2) asmCode = 'ASM-ML-SCREENER';
    else if (i % 6 === 3) asmCode = 'ASM-CLOUD-SCREENER';
    else if (i % 6 === 4) asmCode = 'ASM-SEC-SCREENER';

    const assessmentId = asmIdByCode.get(asmCode);
    if (!assessmentId) continue;

    const attemptCode = 'ATT-' + String(i + 1).padStart(4, '0');
    const score = 40 + ((i * 13) % 55); // 40-95
    const status = 'EVALUATED';

    await prisma.examAttempt.upsert({
      where: { attemptCode },
      update: { score, status },
      create: {
        attemptCode,
        assessmentId,
        candidateId,
        startedAt: new Date(Date.UTC(2024, i % 6, 1 + (i % 28), 10, 0, 0)),
        submittedAt: new Date(Date.UTC(2024, i % 6, 1 + (i % 28), 11, 0, 0)),
        status,
        score,
        totalPoints: 100,
      },
    });
    attemptCount++;
  }
  console.log('  [OK] ExamAttempts: ' + attemptCount);

  console.log('Recruitment seeding complete.');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });