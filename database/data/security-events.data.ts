// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Security Events (60)
// ============================================================================

export type SecurityCategory = 'AUTH' | 'ACCESS' | 'VULN' | 'INCIDENT' | 'COMPLIANCE';
export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type SecurityStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED';

export interface SecurityEventData {
  eventCode: string;
  category: SecurityCategory;
  severity: SecuritySeverity;
  title: string;
  description: string;
  source: string;
  affectedAsset: string;
  status: SecurityStatus;
  resolvedAt: Date | null;
  createdAt: Date;
}

interface Template {
  category: SecurityCategory;
  severity: SecuritySeverity;
  title: string;
  description: string;
  source: string;
  affectedAsset: string;
}

const TEMPLATES: Template[] = [
  { category: 'AUTH',       severity: 'LOW',      title: 'Successful login from new IP',            description: 'User signed in from a previously unseen IP.',              source: 'auth-service',    affectedAsset: 'nexus-auth' },
  { category: 'AUTH',       severity: 'MEDIUM',   title: 'Multiple failed login attempts',          description: 'More than 5 failed login attempts for a single account.', source: 'auth-service',    affectedAsset: 'nexus-auth' },
  { category: 'ACCESS',     severity: 'MEDIUM',   title: 'Privilege escalation request',            description: 'Elevated IAM permissions were requested.',                source: 'iam-audit',       affectedAsset: 'aws-iam' },
  { category: 'VULN',       severity: 'HIGH',     title: 'Critical CVE in dependency',              description: 'Static analysis flagged a critical CVE in a runtime library.', source: 'snyk-scanner', affectedAsset: 'svc-payments' },
  { category: 'VULN',       severity: 'MEDIUM',   title: 'Outdated TLS certificate',                description: 'Certificate nearing expiry on an external endpoint.',      source: 'tls-monitor',     affectedAsset: 'api-gateway' },
  { category: 'INCIDENT',   severity: 'HIGH',     title: 'Anomalous outbound traffic',              description: 'Unusual outbound traffic volume detected from a node.',   source: 'netflow',         affectedAsset: 'k8s-node-07' },
  { category: 'COMPLIANCE', severity: 'LOW',      title: 'Policy deviation — MFA not enabled',      description: 'A non-admin user was found without MFA enabled.',          source: 'okta-audit',      affectedAsset: 'okta' },
  { category: 'ACCESS',     severity: 'LOW',      title: 'Access to production database',           description: 'Elevated production access used during a maintenance window.', source: 'db-audit',    affectedAsset: 'prod-pg' },
  { category: 'COMPLIANCE', severity: 'MEDIUM',   title: 'Data export from finance system',         description: 'Bulk export of finance records was initiated.',            source: 'finance-audit',   affectedAsset: 'erp' },
  { category: 'INCIDENT',   severity: 'CRITICAL', title: 'Suspected credential leak',               description: 'Secret scanner detected a leaked API key in a public repo.', source: 'github-scanner', affectedAsset: 'github' },
];

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 3600 * 1000);
}

export const securityEventsData: SecurityEventData[] = [];

for (let i = 0; i < 60; i++) {
  const t = TEMPLATES[i % TEMPLATES.length];
  const createdAt = new Date(Date.UTC(2024, (i % 12), 1 + (i % 28), 6 + (i % 10), (i * 7) % 60, 0));
  const resolvedAt = (i % 3 === 0) ? addDays(createdAt, 2) : null;
  const status: SecurityStatus = resolvedAt ? 'RESOLVED' : (i % 4 === 0 ? 'INVESTIGATING' : 'OPEN');

  securityEventsData.push({
    eventCode: 'SEC-' + String(i + 1).padStart(4, '0'),
    category: t.category,
    severity: t.severity,
    title: t.title,
    description: t.description,
    source: t.source,
    affectedAsset: t.affectedAsset,
    status,
    resolvedAt,
    createdAt,
  });
}

if (securityEventsData.length !== 60) throw new Error('Expected 60 security events');