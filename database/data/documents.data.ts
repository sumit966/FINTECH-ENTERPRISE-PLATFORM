// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Documents (60)
// ============================================================================

import { employeesData } from './employees.data';

export type DocCategory = 'HR' | 'FINANCE' | 'LEGAL' | 'PROJECT' | 'TECHNICAL' | 'CLIENT';

export interface DocumentData {
  documentCode: string;
  title: string;
  category: DocCategory;
  mimeType: string;
  sizeBytes: number;
  storageUrl: string;
  ownerCode: string | null;
  accessLevel: string;
  tags: string[];
  version: number;
}

interface Tpl { title: string; category: DocCategory; mime: string; access: string; tags: string[]; }

const TEMPLATES: Tpl[] = [
  { title: 'Employee Handbook 2024',           category: 'HR',        mime: 'application/pdf', access: 'INTERNAL', tags: ['handbook','policy'] },
  { title: 'Leave Policy',                     category: 'HR',        mime: 'application/pdf', access: 'INTERNAL', tags: ['policy','leave'] },
  { title: 'Code of Conduct',                  category: 'HR',        mime: 'application/pdf', access: 'INTERNAL', tags: ['policy'] },
  { title: 'Employee Onboarding Checklist',    category: 'HR',        mime: 'application/pdf', access: 'INTERNAL', tags: ['onboarding'] },
  { title: 'Payslip template',                 category: 'FINANCE',   mime: 'application/pdf', access: 'INTERNAL', tags: ['payroll'] },
  { title: 'Budget FY2025',                    category: 'FINANCE',   mime: 'application/vnd.ms-excel', access: 'RESTRICTED', tags: ['budget','finance'] },
  { title: 'Q3 Financial Report',              category: 'FINANCE',   mime: 'application/pdf', access: 'RESTRICTED', tags: ['finance','report'] },
  { title: 'Invoices register',                category: 'FINANCE',   mime: 'application/vnd.ms-excel', access: 'RESTRICTED', tags: ['invoices'] },
  { title: 'Master Services Agreement',        category: 'LEGAL',     mime: 'application/pdf', access: 'RESTRICTED', tags: ['contract','client'] },
  { title: 'NDA template',                     category: 'LEGAL',     mime: 'application/pdf', access: 'RESTRICTED', tags: ['nda'] },
  { title: 'Data Processing Agreement',        category: 'LEGAL',     mime: 'application/pdf', access: 'RESTRICTED', tags: ['gdpr','dpa'] },
  { title: 'Privacy Policy',                   category: 'LEGAL',     mime: 'application/pdf', access: 'PUBLIC',     tags: ['privacy'] },
  { title: 'Project Statement of Work',        category: 'PROJECT',   mime: 'application/pdf', access: 'INTERNAL',   tags: ['sow','project'] },
  { title: 'Project Risk Register',            category: 'PROJECT',   mime: 'application/vnd.ms-excel', access: 'INTERNAL', tags: ['risk'] },
  { title: 'Milestone delivery tracker',       category: 'PROJECT',   mime: 'application/vnd.ms-excel', access: 'INTERNAL', tags: ['milestones'] },
  { title: 'Architecture Decision Record 001', category: 'TECHNICAL', mime: 'text/markdown', access: 'INTERNAL', tags: ['adr','architecture'] },
  { title: 'API Specification',                category: 'TECHNICAL', mime: 'application/yaml', access: 'INTERNAL', tags: ['api','spec'] },
  { title: 'Security runbook',                 category: 'TECHNICAL', mime: 'text/markdown', access: 'RESTRICTED', tags: ['security','runbook'] },
  { title: 'Deployment runbook',               category: 'TECHNICAL', mime: 'text/markdown', access: 'INTERNAL', tags: ['deployment'] },
  { title: 'Client quarterly review',          category: 'CLIENT',    mime: 'application/pdf', access: 'RESTRICTED', tags: ['client','review'] },
];

export const documentsData: DocumentData[] = [];

for (let i = 0; i < 60; i++) {
  const t = TEMPLATES[i % TEMPLATES.length];
  const owner = employeesData[(i * 7 + 3) % employeesData.length];
  documentsData.push({
    documentCode: 'DOC-' + String(i + 1).padStart(4, '0'),
    title: t.title + (i >= TEMPLATES.length ? ' (' + Math.floor(i / TEMPLATES.length + 1) + ')' : ''),
    category: t.category,
    mimeType: t.mime,
    sizeBytes: 50000 + ((i * 12345) % 5000000),
    storageUrl: 'https://storage.example/docs/DOC-' + String(i + 1).padStart(4, '0'),
    ownerCode: owner.employeeCode,
    accessLevel: t.access,
    tags: t.tags,
    version: 1 + (i % 4),
  });
}

if (documentsData.length !== 60) throw new Error('Expected 60 documents');