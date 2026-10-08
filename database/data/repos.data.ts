// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Repositories (60, one per project)
// ============================================================================

import { projectsData } from './projects.data';

export interface RepositoryData {
  repoCode: string;
  name: string;
  projectCode: string;
  provider: 'GITHUB' | 'GITLAB' | 'BITBUCKET';
  url: string;
  defaultBranch: string;
  language: string;
  isPrivate: boolean;
}

function primaryLanguage(frontend: string[], backend: string[]): string {
  if (backend.length > 0) return backend[0];
  if (frontend.length > 0) return frontend[0];
  return 'TypeScript';
}

export const repositoriesData: RepositoryData[] = [];

for (let i = 0; i < projectsData.length; i++) {
  const p = projectsData[i];
  const name = p.projectCode.toLowerCase() + '-' + p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  repositoriesData.push({
    repoCode: 'REPO-' + p.projectCode.slice(-3),
    name,
    projectCode: p.projectCode,
    provider: 'GITHUB',
    url: 'https://github.example/nexus/' + name,
    defaultBranch: 'main',
    language: primaryLanguage(p.techFrontend, p.techBackend),
    isPrivate: true,
  });
}

if (repositoriesData.length !== 60) throw new Error('Expected 60 repositories');