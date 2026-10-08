// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Engineering seeder (Section 11 Part 4E)
// Inserts: Repository, PullRequest, Build, TestRun, Deployment.
// Idempotent.
// ============================================================================
import { PrismaClient } from '@prisma/client';
import { repositoriesData } from '../database/data/repos.data';
import { pullRequestsData } from '../database/data/pull-requests.data';
import { buildsData } from '../database/data/builds.data';
import { deploymentsData } from '../database/data/deployments.data';

const prisma = new PrismaClient();

async function main() {
  // ---- Repositories ----
  console.log('>> Seeding repositories ...');
  const projects = await prisma.project.findMany({ select: { id: true, projectCode: true } });
  const projIdByCode = new Map(projects.map((p) => [p.projectCode, p.id]));

  let repoCount = 0;
  for (const r of repositoriesData) {
    const projectId = projIdByCode.get(r.projectCode) || null;
    await prisma.repository.upsert({
      where: { repoCode: r.repoCode },
      update: { name: r.name, projectId, url: r.url, language: r.language },
      create: {
        repoCode: r.repoCode,
        name: r.name,
        projectId,
        provider: r.provider,
        url: r.url,
        defaultBranch: r.defaultBranch,
        language: r.language,
        isPrivate: r.isPrivate,
      },
    });
    repoCount++;
  }
  console.log('  [OK] Repositories: ' + repoCount);

  const allRepos = await prisma.repository.findMany({ select: { id: true, repoCode: true } });
  const repoIdByCode = new Map(allRepos.map((r) => [r.repoCode, r.id]));

  const emps = await prisma.employee.findMany({ select: { id: true, employeeCode: true } });
  const empIdByCode = new Map(emps.map((e) => [e.employeeCode, e.id]));

  // ---- Pull Requests ----
  console.log('>> Seeding pull requests ...');
  let prCount = 0;
  for (const pr of pullRequestsData) {
    const repositoryId = repoIdByCode.get(pr.repoCode);
    if (!repositoryId) continue;
    const authorId = empIdByCode.get(pr.authorCode) || null;
    const reviewedByIds = pr.reviewedByCodes
      .map((c) => empIdByCode.get(c))
      .filter((x): x is string => Boolean(x));

    await prisma.pullRequest.upsert({
      where: { repositoryId_prNumber: { repositoryId, prNumber: pr.prNumber } },
      update: { status: pr.status, mergedAt: pr.mergedAt },
      create: {
        repositoryId,
        prNumber: pr.prNumber,
        title: pr.title,
        authorId,
        sourceBranch: pr.sourceBranch,
        targetBranch: pr.targetBranch,
        status: pr.status,
        additions: pr.additions,
        deletions: pr.deletions,
        reviewedBy: reviewedByIds,
        openedAt: pr.openedAt,
        mergedAt: pr.mergedAt,
      },
    });
    prCount++;
  }
  console.log('  [OK] Pull requests: ' + prCount);

  // ---- Builds + TestRuns ----
  console.log('>> Seeding builds and test runs ...');
  let buildCount = 0;
  let testRunCount = 0;
  for (const b of buildsData) {
    const repositoryId = repoIdByCode.get(b.repoCode);
    if (!repositoryId) continue;
    const triggeredBy = b.triggeredByCode || null;

    const build = await prisma.build.upsert({
      where: { buildCode: b.buildCode },
      update: { status: b.status, completedAt: b.completedAt, durationSec: b.durationSec },
      create: {
        buildCode: b.buildCode,
        repositoryId,
        branch: b.branch,
        commitSha: b.commitSha,
        status: b.status,
        durationSec: b.durationSec,
        triggeredBy,
        startedAt: b.startedAt,
        completedAt: b.completedAt,
      },
    });
    buildCount++;

    // TestRun has no natural unique key; find by buildId.
    const existing = await prisma.testRun.findFirst({ where: { buildId: build.id } });
    if (existing) {
      await prisma.testRun.update({
        where: { id: existing.id },
        data: {
          totalTests: b.testRun.totalTests,
          passed: b.testRun.passed,
          failed: b.testRun.failed,
          skipped: b.testRun.skipped,
          coveragePct: b.testRun.coveragePct,
          durationSec: b.testRun.durationSec,
        },
      });
    } else {
      await prisma.testRun.create({
        data: {
          buildId: build.id,
          totalTests: b.testRun.totalTests,
          passed: b.testRun.passed,
          failed: b.testRun.failed,
          skipped: b.testRun.skipped,
          coveragePct: b.testRun.coveragePct,
          durationSec: b.testRun.durationSec,
        },
      });
    }
    testRunCount++;
  }
  console.log('  [OK] Builds: ' + buildCount);
  console.log('  [OK] Test runs: ' + testRunCount);

  // ---- Deployments ----
  console.log('>> Seeding deployments ...');
  let depCount = 0;
  for (const d of deploymentsData) {
    const projectId = projIdByCode.get(d.projectCode) || null;
    await prisma.deployment.upsert({
      where: { deploymentCode: d.deploymentCode },
      update: { status: d.status, notes: d.notes },
      create: {
        deploymentCode: d.deploymentCode,
        projectId,
        environment: d.environment,
        version: d.version,
        status: d.status,
        deployedAt: d.deployedAt,
        deployedBy: d.deployedByCode,
        commitSha: d.commitSha,
        notes: d.notes,
      },
    });
    depCount++;
  }
  console.log('  [OK] Deployments: ' + depCount);

  console.log('Engineering seeding complete.');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });