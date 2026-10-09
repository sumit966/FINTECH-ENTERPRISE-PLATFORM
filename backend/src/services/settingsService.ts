import { prisma } from '../config/prisma';
import { env } from '../config/env';

// Table row counts, one query per table for simplicity and correctness.
const TABLES: { model: string; label: string; count: () => Promise<number> }[] = [
  { model: 'User',                  label: 'Users',                  count: () => prisma.user.count() },
  { model: 'Role',                  label: 'Roles',                  count: () => prisma.role.count() },
  { model: 'Permission',            label: 'Permissions',            count: () => prisma.permission.count() },
  { model: 'Employee',              label: 'Employees',              count: () => prisma.employee.count() },
  { model: 'EmployeeSkill',         label: 'Employee Skills',        count: () => prisma.employeeSkill.count() },
  { model: 'EmployeeCertification', label: 'Employee Certifications',count: () => prisma.employeeCertification.count() },
  { model: 'Location',              label: 'Locations',              count: () => prisma.location.count() },
  { model: 'Department',            label: 'Departments',            count: () => prisma.department.count() },
  { model: 'Team',                  label: 'Teams',                  count: () => prisma.team.count() },
  { model: 'Payroll',               label: 'Payroll rows',           count: () => prisma.payroll.count() },
  { model: 'Attendance',            label: 'Attendance rows',        count: () => prisma.attendance.count() },
  { model: 'Leave',                 label: 'Leave requests',         count: () => prisma.leave.count() },
  { model: 'Client',                label: 'Clients',                count: () => prisma.client.count() },
  { model: 'Project',               label: 'Projects',               count: () => prisma.project.count() },
  { model: 'ProjectMember',         label: 'Project Members',        count: () => prisma.projectMember.count() },
  { model: 'ProjectTask',           label: 'Project Tasks',          count: () => prisma.projectTask.count() },
  { model: 'Invoice',               label: 'Invoices',               count: () => prisma.invoice.count() },
  { model: 'Vendor',                label: 'Vendors',                count: () => prisma.vendor.count() },
  { model: 'Asset',                 label: 'Assets',                 count: () => prisma.asset.count() },
  { model: 'License',               label: 'Licenses',               count: () => prisma.license.count() },
  { model: 'JobOpening',            label: 'Job openings',           count: () => prisma.jobOpening.count() },
  { model: 'Candidate',             label: 'Candidates',             count: () => prisma.candidate.count() },
  { model: 'Interview',             label: 'Interviews',             count: () => prisma.interview.count() },
  { model: 'Question',              label: 'Questions',              count: () => prisma.question.count() },
  { model: 'Assessment',            label: 'Assessments',            count: () => prisma.assessment.count() },
  { model: 'ExamAttempt',           label: 'Exam attempts',          count: () => prisma.examAttempt.count() },
  { model: 'Repository',            label: 'Repositories',           count: () => prisma.repository.count() },
  { model: 'PullRequest',           label: 'Pull requests',          count: () => prisma.pullRequest.count() },
  { model: 'Build',                 label: 'Builds',                 count: () => prisma.build.count() },
  { model: 'Deployment',            label: 'Deployments',            count: () => prisma.deployment.count() },
  { model: 'SecurityEvent',         label: 'Security events',        count: () => prisma.securityEvent.count() },
  { model: 'AuditLog',              label: 'Audit logs',             count: () => prisma.auditLog.count() },
  { model: 'Notification',          label: 'Notifications',          count: () => prisma.notification.count() },
  { model: 'CalendarEvent',         label: 'Calendar events',        count: () => prisma.calendarEvent.count() },
  { model: 'Document',              label: 'Documents',              count: () => prisma.document.count() },
  { model: 'KnowledgeArticle',      label: 'Knowledge articles',     count: () => prisma.knowledgeArticle.count() },
  { model: 'Kpi',                   label: 'KPIs',                   count: () => prisma.kpi.count() },
  { model: 'AutomationRule',        label: 'Automation rules',       count: () => prisma.automationRule.count() },
];

export async function getSystemOverview() {
  const startedAt = Date.now();
  const counts = await Promise.all(TABLES.map((t) => t.count()));
  const dbLatencyMs = Date.now() - startedAt;
  const tables = TABLES.map((t, i) => ({ label: t.label, model: t.model, count: counts[i] }));
  const totalRows = counts.reduce((s, c) => s + c, 0);

  return {
    runtime: {
      nodeVersion: process.version,
      platform: process.platform,
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.nodeEnv,
      memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    database: {
      latencyMs: dbLatencyMs,
      totalRows,
      tables,
    },
  };
}

function statusOf(configured: boolean): 'CONFIGURED' | 'INTEGRATION_REQUIRED' {
  return configured ? 'CONFIGURED' : 'INTEGRATION_REQUIRED';
}

export async function getIntegrations() {
  const integrations = [
    {
      code: 'AI_PROVIDER', name: 'AI Provider (OpenAI)',
      description: 'Enables LLM-backed answers in the AI Command Center.',
      envVar: 'AI_PROVIDER=openai & AI_API_KEY=...',
      status: statusOf(env.aiProvider === 'openai' && !!env.aiApiKey),
    },
    {
      code: 'EMAIL', name: 'Transactional Email',
      description: 'Sends approval, payroll, and interview emails.',
      envVar: 'EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD',
      status: statusOf(false),
    },
    {
      code: 'STORAGE', name: 'Object Storage',
      description: 'Hosts uploaded documents and receipts.',
      envVar: 'STORAGE_PROVIDER, STORAGE_KEY, STORAGE_SECRET',
      status: statusOf(false),
    },
    {
      code: 'GITHUB', name: 'GitHub Enterprise',
      description: 'Imports repositories, PRs, and builds.',
      envVar: 'GITHUB_TOKEN',
      status: statusOf(false),
    },
    {
      code: 'JIRA', name: 'Jira',
      description: 'Syncs tasks and sprints.',
      envVar: 'JIRA_TOKEN',
      status: statusOf(false),
    },
    {
      code: 'SLACK', name: 'Slack',
      description: 'Sends approval and alert notifications to channels.',
      envVar: 'SLACK_WEBHOOK',
      status: statusOf(false),
    },
    {
      code: 'AWS', name: 'AWS',
      description: 'Reads live cloud metrics for the Cloud dashboard.',
      envVar: 'AWS_ACCESS_KEY, AWS_SECRET_KEY',
      status: statusOf(false),
    },
    {
      code: 'AZURE', name: 'Azure',
      description: 'Reads live Azure metrics.',
      envVar: 'AZURE_KEY',
      status: statusOf(false),
    },
    {
      code: 'GCP', name: 'Google Cloud',
      description: 'Reads live GCP metrics.',
      envVar: 'GCP_KEY',
      status: statusOf(false),
    },
  ];
  return integrations;
}

export function getAbout() {
  return {
    platform: 'Nexus Enterprise Platform',
    company: 'FINTECH IT SOLUTIONS',
    founder: 'Sumit Kumar',
    headquarters: 'Pune, India',
    locations: ['Pune', 'Bangalore', 'Noida'],
    version: '1.0.0',
    build: 'prototype',
    license: 'MIT',
    description: 'One coherent ecosystem unifying People, Finance, Projects, Engineering, Intelligence, and Security.',
  };
}