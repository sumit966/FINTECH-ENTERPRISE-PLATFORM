// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Knowledge Articles (30)
// ============================================================================

export type KnowledgeCategory = 'POLICY' | 'SOP' | 'TECH' | 'HR' | 'SECURITY' | 'TRAINING';

export interface KnowledgeArticleData {
  slug: string;
  title: string;
  category: KnowledgeCategory;
  body: string;
  tags: string[];
  published: boolean;
  viewCount: number;
}

interface Tpl { slug: string; title: string; category: KnowledgeCategory; body: string; tags: string[]; }

const TEMPLATES: Tpl[] = [
  { slug: 'how-to-request-leave',          title: 'How to request leave',                category: 'SOP',      body: 'Log in, navigate to Leave, select the dates, submit, and wait for your manager to approve.',                 tags: ['leave','hr'] },
  { slug: 'how-to-raise-expense',          title: 'How to raise an expense',             category: 'SOP',      body: 'Open Finance > Expenses > New. Attach the receipt and submit before the monthly cut-off.',                  tags: ['expense','finance'] },
  { slug: 'code-review-guidelines',        title: 'Code review guidelines',              category: 'TECH',     body: 'Every PR requires at least one approving review. Focus on correctness, clarity, and tests.',                 tags: ['engineering','review'] },
  { slug: 'git-branching-strategy',        title: 'Git branching strategy',              category: 'TECH',     body: 'Use main for releases, develop for integration, feature/* for work in progress.',                            tags: ['git','engineering'] },
  { slug: 'incident-response-runbook',     title: 'Incident response runbook',           category: 'SECURITY', body: 'Declare an incident, page the on-call, follow the mitigation checklist, and write a postmortem.',            tags: ['security','incident'] },
  { slug: 'vpn-setup',                     title: 'VPN setup guide',                     category: 'TECH',     body: 'Install the corporate VPN client, sign in with SSO, and enable MFA.',                                        tags: ['vpn','it'] },
  { slug: 'password-policy',               title: 'Password policy',                     category: 'POLICY',   body: 'Minimum 12 characters, mixed case, number, symbol, rotated every 12 months, unique per service.',            tags: ['security','password'] },
  { slug: 'data-classification',           title: 'Data classification policy',          category: 'POLICY',   body: 'Public, Internal, Restricted. Restricted data must not leave approved environments.',                        tags: ['security','policy'] },
  { slug: 'onboarding-day-1',              title: 'Onboarding day 1 checklist',          category: 'HR',       body: 'Laptop collection, account creation, HR induction, team introduction, and first 1:1 with manager.',          tags: ['onboarding'] },
  { slug: 'performance-review-guide',      title: 'Performance review guide',            category: 'HR',       body: 'Self-review, manager review, calibration, and feedback conversation. Completed in the HR portal.',            tags: ['performance'] },
  { slug: 'aws-account-baseline',          title: 'AWS account baseline',                category: 'TECH',     body: 'MFA on root, no root access keys, CloudTrail enabled in all regions, SCPs applied.',                          tags: ['aws','cloud'] },
  { slug: 'kubernetes-troubleshooting',    title: 'Kubernetes troubleshooting',          category: 'TECH',     body: 'Check pod events, logs, resource quotas, and network policies before escalating.',                            tags: ['kubernetes'] },
  { slug: 'sql-query-optimization',        title: 'SQL query optimization',              category: 'TECH',     body: 'Use EXPLAIN ANALYZE, add appropriate indexes, avoid SELECT *, and paginate large result sets.',               tags: ['sql','performance'] },
  { slug: 'openai-usage-policy',           title: 'LLM and AI usage policy',             category: 'POLICY',   body: 'Never submit client-confidential data to external LLM providers without approval.',                          tags: ['ai','policy'] },
  { slug: 'frontend-accessibility',        title: 'Frontend accessibility checklist',    category: 'TECH',     body: 'Keyboard navigation, ARIA labels, contrast ratio, and screen-reader testing for all components.',             tags: ['a11y','frontend'] },
  { slug: 'mobile-release-checklist',      title: 'Mobile release checklist',            category: 'SOP',      body: 'Version bump, changelog, screenshots, store assets, staged rollout to 10% first.',                            tags: ['mobile','release'] },
  { slug: 'client-escalation',             title: 'Client escalation procedure',         category: 'SOP',      body: 'Notify the AM, log the issue, create a Slack channel, and provide hourly status updates.',                    tags: ['client'] },
  { slug: 'cloud-cost-optimisation',       title: 'Cloud cost optimisation',             category: 'TECH',     body: 'Right-size instances, use spot where possible, tag everything, review monthly.',                              tags: ['cloud','cost'] },
  { slug: 'gdpr-data-requests',            title: 'Handling GDPR data requests',         category: 'SECURITY', body: 'Log the request, verify identity, respond within 30 days, and document the outcome.',                        tags: ['gdpr','legal'] },
  { slug: 'new-hire-equipment',            title: 'New hire equipment checklist',        category: 'HR',       body: 'Laptop, monitor, headset, keyboard, mouse, security key, and account credentials.',                          tags: ['onboarding','it'] },
];

export const knowledgeArticlesData: KnowledgeArticleData[] = [];

for (let i = 0; i < 30; i++) {
  const t = TEMPLATES[i % TEMPLATES.length];
  const slugSuffix = i >= TEMPLATES.length ? '-' + (Math.floor(i / TEMPLATES.length) + 1) : '';
  knowledgeArticlesData.push({
    slug: t.slug + slugSuffix,
    title: t.title + (i >= TEMPLATES.length ? ' (Volume ' + (Math.floor(i / TEMPLATES.length) + 1) + ')' : ''),
    category: t.category,
    body: t.body,
    tags: t.tags,
    published: true,
    viewCount: 50 + ((i * 37) % 900),
  });
}

if (knowledgeArticlesData.length !== 30) throw new Error('Expected 30 knowledge articles');