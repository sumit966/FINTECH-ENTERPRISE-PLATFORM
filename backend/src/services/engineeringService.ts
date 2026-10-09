import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { paginated } from '../utils/apiResponse';

// ---------- Repositories ----------
export async function listRepos(params: { page: number; pageSize: number; search?: string; language?: string; provider?: string }) {
  const { page, pageSize, search, language, provider } = params;
  const where: Prisma.RepositoryWhereInput = {};
  if (language) where.language = language;
  if (provider) where.provider = provider;
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { repoCode: { contains: q, mode: 'insensitive' } },
      { name: { contains: q, mode: 'insensitive' } },
    ];
  }
  const [total, rows] = await Promise.all([
    prisma.repository.count({ where }),
    prisma.repository.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { repoCode: 'asc' },
      include: {
        project: { select: { projectCode: true, name: true } },
        _count: { select: { pullRequests: true, builds: true } },
      },
    }),
  ]);
  const items = rows.map((r) => ({
    id: r.id, repoCode: r.repoCode, name: r.name, provider: r.provider,
    url: r.url, defaultBranch: r.defaultBranch, language: r.language, isPrivate: r.isPrivate,
    projectCode: r.project?.projectCode || null, projectName: r.project?.name || null,
    prCount: r._count.pullRequests, buildCount: r._count.builds,
  }));
  return paginated(items, page, pageSize, total);
}

export async function getRepoDetail(repoCode: string) {
  const r = await prisma.repository.findUnique({
    where: { repoCode },
    include: {
      project: { select: { projectCode: true, name: true, status: true } },
      pullRequests: { orderBy: { openedAt: 'desc' }, take: 50 },
      builds: {
        orderBy: { startedAt: 'desc' }, take: 30,
        include: { testRuns: { take: 1 } },
      },
    },
  });
  if (!r) return null;
  return {
    id: r.id, repoCode: r.repoCode, name: r.name, provider: r.provider,
    url: r.url, defaultBranch: r.defaultBranch, language: r.language, isPrivate: r.isPrivate,
    project: r.project ? { projectCode: r.project.projectCode, name: r.project.name, status: r.project.status } : null,
    pullRequests: r.pullRequests.map((pr) => ({
      id: pr.id, prNumber: pr.prNumber, title: pr.title,
      sourceBranch: pr.sourceBranch, targetBranch: pr.targetBranch,
      status: pr.status, additions: pr.additions, deletions: pr.deletions,
      openedAt: pr.openedAt, mergedAt: pr.mergedAt, reviewedBy: pr.reviewedBy,
    })),
    builds: r.builds.map((b) => ({
      id: b.id, buildCode: b.buildCode, branch: b.branch, commitSha: b.commitSha,
      status: b.status, durationSec: b.durationSec, startedAt: b.startedAt, completedAt: b.completedAt,
      testRun: b.testRuns[0] ? {
        totalTests: b.testRuns[0].totalTests, passed: b.testRuns[0].passed,
        failed: b.testRuns[0].failed, skipped: b.testRuns[0].skipped,
        coveragePct: b.testRuns[0].coveragePct ? Number(b.testRuns[0].coveragePct) : null,
        durationSec: b.testRuns[0].durationSec,
      } : null,
    })),
  };
}

// ---------- Pull Requests ----------
export async function listPullRequests(params: { page: number; pageSize: number; search?: string; status?: string; repoCode?: string }) {
  const { page, pageSize, search, status, repoCode } = params;
  const where: Prisma.PullRequestWhereInput = {};
  if (status) where.status = status;
  if (repoCode) where.repository = { repoCode };
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { repository: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }
  const [total, rows] = await Promise.all([
    prisma.pullRequest.count({ where }),
    prisma.pullRequest.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { openedAt: 'desc' },
      include: { repository: { select: { repoCode: true, name: true } } },
    }),
  ]);
  const items = rows.map((pr) => ({
    id: pr.id, prNumber: pr.prNumber, title: pr.title,
    repoCode: pr.repository.repoCode, repoName: pr.repository.name,
    sourceBranch: pr.sourceBranch, targetBranch: pr.targetBranch,
    status: pr.status, additions: pr.additions, deletions: pr.deletions,
    openedAt: pr.openedAt, mergedAt: pr.mergedAt,
  }));
  return paginated(items, page, pageSize, total);
}

// ---------- Builds ----------
export async function listBuilds(params: { page: number; pageSize: number; search?: string; status?: string; repoCode?: string }) {
  const { page, pageSize, search, status, repoCode } = params;
  const where: Prisma.BuildWhereInput = {};
  if (status) where.status = status;
  if (repoCode) where.repository = { repoCode };
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { buildCode: { contains: q, mode: 'insensitive' } },
      { commitSha: { contains: q, mode: 'insensitive' } },
      { repository: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }
  const [total, rows] = await Promise.all([
    prisma.build.count({ where }),
    prisma.build.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { startedAt: 'desc' },
      include: {
        repository: { select: { repoCode: true, name: true } },
        testRuns: { take: 1 },
      },
    }),
  ]);
  const items = rows.map((b) => ({
    id: b.id, buildCode: b.buildCode, branch: b.branch, commitSha: b.commitSha,
    status: b.status, durationSec: b.durationSec, triggeredBy: b.triggeredBy,
    startedAt: b.startedAt, completedAt: b.completedAt,
    repoCode: b.repository.repoCode, repoName: b.repository.name,
    testRun: b.testRuns[0] ? {
      totalTests: b.testRuns[0].totalTests, passed: b.testRuns[0].passed,
      failed: b.testRuns[0].failed, skipped: b.testRuns[0].skipped,
      coveragePct: b.testRuns[0].coveragePct ? Number(b.testRuns[0].coveragePct) : null,
      durationSec: b.testRuns[0].durationSec,
    } : null,
  }));
  return paginated(items, page, pageSize, total);
}

// ---------- Deployments ----------
export async function listDeployments(params: { page: number; pageSize: number; search?: string; status?: string; environment?: string; projectCode?: string }) {
  const { page, pageSize, search, status, environment, projectCode } = params;
  const where: Prisma.DeploymentWhereInput = {};
  if (status) where.status = status;
  if (environment) where.environment = environment;
  if (projectCode) where.project = { projectCode };
  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { deploymentCode: { contains: q, mode: 'insensitive' } },
      { version: { contains: q, mode: 'insensitive' } },
      { project: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }
  const [total, rows] = await Promise.all([
    prisma.deployment.count({ where }),
    prisma.deployment.findMany({
      where, skip: (page - 1) * pageSize, take: pageSize,
      orderBy: { deployedAt: 'desc' },
      include: { project: { select: { projectCode: true, name: true } } },
    }),
  ]);
  const items = rows.map((d) => ({
    id: d.id, deploymentCode: d.deploymentCode, environment: d.environment,
    version: d.version, status: d.status, deployedAt: d.deployedAt,
    deployedBy: d.deployedBy, commitSha: d.commitSha, notes: d.notes,
    projectCode: d.project?.projectCode || null, projectName: d.project?.name || null,
  }));
  return paginated(items, page, pageSize, total);
}

// ---------- Summary ----------
export async function getEngineeringSummary() {
  const [repoCount, prTotal, prByStatus, buildTotal, buildByStatus, deployTotal, deployByEnv,
    coverageAgg, languageBreakdown] = await Promise.all([
    prisma.repository.count(),
    prisma.pullRequest.count(),
    prisma.pullRequest.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.build.count(),
    prisma.build.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.deployment.count(),
    prisma.deployment.groupBy({ by: ['environment'], _count: { _all: true } }),
    prisma.testRun.aggregate({ _avg: { coveragePct: true } }),
    prisma.repository.groupBy({ by: ['language'], _count: { _all: true } }),
  ]);
  const buildsPassed = buildByStatus.find((b) => b.status === 'SUCCESS')?._count._all ?? 0;
  return {
    repoCount,
    prTotal,
    prOpen: prByStatus.find((p) => p.status === 'OPEN')?._count._all ?? 0,
    prMerged: prByStatus.find((p) => p.status === 'MERGED')?._count._all ?? 0,
    buildTotal,
    buildSuccess: buildsPassed,
    buildSuccessRate: buildTotal > 0 ? (buildsPassed / buildTotal) * 100 : 0,
    deployTotal,
    deployByEnv: deployByEnv.map((d) => ({ environment: d.environment, count: d._count._all })),
    averageCoverage: Number(coverageAgg._avg.coveragePct || 0),
    languageBreakdown: languageBreakdown.map((l) => ({ language: l.language, count: l._count._all })).sort((a, b) => b.count - a.count),
    prByStatus: prByStatus.map((p) => ({ status: p.status, count: p._count._all })),
    buildByStatus: buildByStatus.map((b) => ({ status: b.status, count: b._count._all })),
  };
}