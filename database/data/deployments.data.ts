// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Deployments (deterministic, 2 per project)
// ============================================================================

import { projectsData } from './projects.data';
import { employeesData } from './employees.data';

export type DeploymentStatus = 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';
export type Environment = 'DEV' | 'STAGING' | 'UAT' | 'PROD';

export interface DeploymentData {
  deploymentCode: string;
  projectCode: string;
  environment: Environment;
  version: string;
  status: DeploymentStatus;
  deployedAt: Date;
  deployedByCode: string;
  commitSha: string;
  notes: string;
}

const ENV_CYCLE: Environment[] = ['STAGING', 'PROD'];

function hexSha(seed: number): string {
  const base = 'abcdef' + String(seed * 7654321).padStart(10, '0');
  return (base + base + base + base).slice(0, 40);
}

function versionString(i: number, k: number): string {
  const major = 1 + (i % 3);
  const minor = k * 5 + (i % 10);
  const patch = (i * 3 + k * 7) % 30;
  return major + '.' + minor + '.' + patch;
}

export const deploymentsData: DeploymentData[] = [];

for (let i = 0; i < projectsData.length; i++) {
  const p = projectsData[i];
  for (let k = 0; k < 2; k++) {
    const idx = i * 2 + k;
    const environment = ENV_CYCLE[k];
    // Status: recent deployments are likely SUCCESS; older ones may fail.
    let status: DeploymentStatus = 'SUCCESS';
    if (idx % 40 === 7) status = 'FAILED';
    else if (idx % 50 === 13) status = 'ROLLED_BACK';

    const deployedAt = new Date(Date.UTC(2024, 0, 1 + ((i * 11 + k * 5) % 300), 14 + k, 0, 0));

    deploymentsData.push({
      deploymentCode: 'DEP-' + String(idx + 1).padStart(5, '0'),
      projectCode: p.projectCode,
      environment,
      version: versionString(i, k),
      status,
      deployedAt,
      deployedByCode: employeesData[12 + ((idx * 7) % 200)].employeeCode,
      commitSha: hexSha(idx + 1),
      notes: environment === 'PROD' ? 'Production release' : 'Staging validation',
    });
  }
}

if (deploymentsData.length !== 120) throw new Error('Expected 120 deployments, got ' + deploymentsData.length);