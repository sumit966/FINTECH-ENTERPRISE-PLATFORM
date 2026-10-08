// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Automation Rules (12)
// ============================================================================

export interface AutomationRuleData {
  code: string;
  name: string;
  description: string;
  trigger: 'SCHEDULE' | 'EVENT';
  triggerExpr: string;
  action: string;
  isEnabled: boolean;
}

export const automationRulesData: AutomationRuleData[] = [
  { code: 'AUTO-LEAVE-APPROVAL',   name: 'Leave approval reminder',       description: 'Notify managers about pending leave requests older than 24 hours.',   trigger: 'SCHEDULE', triggerExpr: '0 9 * * *',     action: 'NOTIFY_MANAGER',       isEnabled: true },
  { code: 'AUTO-PAYROLL-RUN',      name: 'Monthly payroll run',           description: 'Trigger the payroll processing workflow on the 28th.',                trigger: 'SCHEDULE', triggerExpr: '0 3 28 * *',    action: 'PROCESS_PAYROLL',      isEnabled: true },
  { code: 'AUTO-INTERVIEW-REM',    name: 'Interview reminder',            description: 'Send reminders to interviewers 24 hours before the interview.',       trigger: 'SCHEDULE', triggerExpr: '0 10 * * *',    action: 'SEND_REMINDER',        isEnabled: true },
  { code: 'AUTO-PROJECT-DEADLINE', name: 'Project deadline alert',        description: 'Alert project managers when a milestone is 7 days away.',             trigger: 'SCHEDULE', triggerExpr: '0 8 * * *',     action: 'ALERT_PM',             isEnabled: true },
  { code: 'AUTO-INVOICE-REM',      name: 'Invoice reminder',              description: 'Remind clients about invoices due in 3 days.',                        trigger: 'SCHEDULE', triggerExpr: '0 10 * * *',    action: 'EMAIL_CLIENT',         isEnabled: true },
  { code: 'AUTO-SECURITY-ALERT',   name: 'Security incident alert',       description: 'Escalate critical security events to the security team.',             trigger: 'EVENT',    triggerExpr: 'security.critical', action: 'PAGE_ONCALL',      isEnabled: true },
  { code: 'AUTO-ONBOARDING',       name: 'Employee onboarding',           description: 'Create onboarding checklist on the joining date.',                    trigger: 'EVENT',    triggerExpr: 'employee.created', action: 'CREATE_CHECKLIST',   isEnabled: true },
  { code: 'AUTO-OFFBOARDING',      name: 'Employee offboarding',          description: 'Create offboarding checklist when notice period starts.',             trigger: 'EVENT',    triggerExpr: 'employee.notice',  action: 'CREATE_CHECKLIST',   isEnabled: true },
  { code: 'AUTO-CERT-EXPIRY',      name: 'Certification expiry',          description: 'Notify employees 30 days before a certification expires.',            trigger: 'SCHEDULE', triggerExpr: '0 9 * * *',     action: 'NOTIFY_EMPLOYEE',      isEnabled: true },
  { code: 'AUTO-LICENSE-RENEWAL',  name: 'License renewal reminder',      description: 'Notify IT 60 days before a software license renews.',                 trigger: 'SCHEDULE', triggerExpr: '0 9 * * *',     action: 'NOTIFY_IT',            isEnabled: true },
  { code: 'AUTO-PROJECT-RISK',     name: 'Project risk alert',            description: 'Alert when a project risk score crosses 2.5.',                        trigger: 'EVENT',    triggerExpr: 'project.risk.high', action: 'ALERT_PM',          isEnabled: true },
  { code: 'AUTO-REVIEW-REM',       name: 'Performance review reminder',   description: 'Remind managers about upcoming performance reviews.',                 trigger: 'SCHEDULE', triggerExpr: '0 9 1 * *',     action: 'NOTIFY_MANAGER',       isEnabled: true },
];

if (automationRulesData.length !== 12) throw new Error('Expected 12 automation rules');