// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Builds + Test Runs (deterministic)
// 3 builds per repository = 180 builds, each with a matching test run.
// ============================================================================

import { repositoriesData } from './repos.data';
import { employeesData } from './employees.data';

export type BuildStatus = 'SUCCESS' | 'FAILED' | 'RUNNING' | 'CANCELLED';

export interface TestRunData {
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  coveragePct: number;
  durationSec: number;
}

export interface BuildData {
  buildCode: string;
  repoCode: string;
  branch: string;
  commitSha: string;
  status: BuildStatus;
  durationSec: number;
  triggeredByCode: string;
  startedAt: Date;
  completedAt: Date | null;
  testRun: TestRunData;
}

const BRANCHES = ['main', 'develop', 'feature/core'];
const STATUS_CYCLE: BuildStatus[] = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED'];

function hexSha(seed: number): string {
  // Deterministic 40-char hex string.
  const base = 'abcdef' + String(seed * 1234567).padStart(10, '0');
  return (base + base + base + base).slice(0, 40);
}

function addMinutes(base: Date, mins: number): Date {
  return new Date(base.getTime() + mins * 60 * 1000);
}

export const buildsData: BuildData[] = [];

for (let i = 0; i < repositoriesData.length; i++) {
  const r = repositoriesData[i];
  for (let k = 0; k < 3; k++) {
    const idx = i * 3 + k;
    const status = STATUS_CYCLE[idx % STATUS_CYCLE.length];
    const duration = 120 + ((idx * 17) % 480);
    const startedAt = new Date(Date.UTC(2024, 0, 1 + ((i * 5 + k * 3) % 300), 8 + (k * 4), 0, 0));
    const completedAt = status === 'RUNNING' ? null : addMinutes(startedAt, Math.floor(duration / 60));

    const totalTests = 200 + ((idx * 13) % 400);
    const failed = status === 'FAILED' ? 3 + (idx % 8) : 0;
    const skipped = idx % 12;
    const passed = totalTests - failed - skipped;
    const coverage = 70 + ((idx * 7) % 25);

    buildsData.push({
      buildCode: 'BLD-' + String(idx + 1).padStart(5, '0'),
      repoCode: r.repoCode,
      branch: BRANCHES[k],
      commitSha: hexSha(idx + 1),
      status,
      durationSec: duration,
      triggeredByCode: employeesData[12 + ((idx * 7) % 200)].employeeCode,
      startedAt,
      completedAt,
      testRun: {
        totalTests,
        passed,
        failed,
        skipped,
        coveragePct: coverage,
        durationSec: Math.floor(duration * 0.6),
      },
    });
  }
}

if (buildsData.length !== 180) throw new Error('Expected 180 builds, got ' + buildsData.length);