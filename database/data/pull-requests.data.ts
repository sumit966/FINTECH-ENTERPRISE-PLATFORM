// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Pull Requests (deterministic, 3 per repo)
// ============================================================================

import { repositoriesData } from './repos.data';
import { employeesData } from './employees.data';

export type PRStatus = 'OPEN' | 'MERGED' | 'CLOSED';

export interface PullRequestData {
  repoCode: string;
  prNumber: number;
  title: string;
  authorCode: string;
  sourceBranch: string;
  targetBranch: string;
  status: PRStatus;
  additions: number;
  deletions: number;
  reviewedByCodes: string[];
  openedAt: Date;
  mergedAt: Date | null;
}

const PR_TITLES = [
  'feat: add core module implementation',
  'fix: resolve null pointer in handler',
  'chore: upgrade dependencies and lockfile',
];

const PR_BRANCHES = ['feature/core', 'fix/handler', 'chore/deps'];

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 3600 * 1000);
}

export const pullRequestsData: PullRequestData[] = [];

for (let i = 0; i < repositoriesData.length; i++) {
  const r = repositoriesData[i];
  for (let k = 0; k < 3; k++) {
    const authorIdx = 12 + ((i * 5 + k * 3) % 200);
    const reviewer1Idx = 12 + ((i * 7 + k * 11) % 200);
    const reviewer2Idx = 12 + ((i * 11 + k * 5) % 200);
    const status: PRStatus = k === 0 ? 'MERGED' : (k === 1 ? 'MERGED' : 'OPEN');
    const openedAt = addDays(new Date(Date.UTC(2024, 0, 1)), (i * 7 + k * 3) % 300);
    const mergedAt = status === 'MERGED' ? addDays(openedAt, 2 + (k % 3)) : null;

    pullRequestsData.push({
      repoCode: r.repoCode,
      prNumber: 100 + i * 3 + k,
      title: PR_TITLES[k],
      authorCode: employeesData[authorIdx].employeeCode,
      sourceBranch: PR_BRANCHES[k],
      targetBranch: 'main',
      status,
      additions: 50 + ((i * 17 + k * 41) % 800),
      deletions: 20 + ((i * 13 + k * 29) % 400),
      reviewedByCodes: [employeesData[reviewer1Idx].employeeCode, employeesData[reviewer2Idx].employeeCode],
      openedAt,
      mergedAt,
    });
  }
}

if (pullRequestsData.length !== 180) throw new Error('Expected 180 pull requests, got ' + pullRequestsData.length);