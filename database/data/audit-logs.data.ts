// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Audit Logs (500)
// ============================================================================

import { employeesData } from './employees.data';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'LOGIN' | 'LOGOUT' | 'EXPORT';

export interface AuditLogData {
  userEmail: string;
  action: AuditAction;
  module: string;
  recordId: string | null;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

const MODULES = ['employees','payroll','projects','clients','invoices','recruitment','security','settings','leave','documents','assets'];
const ACTIONS: AuditAction[] = ['CREATE','UPDATE','DELETE','APPROVE','LOGIN','LOGOUT','EXPORT'];
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) Safari/17.0',
  'Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0',
];

function ipFor(i: number): string {
  const a = 10;
  const b = 20 + (i % 40);
  const c = (i * 7) % 255;
  const d = (i * 13) % 255;
  return a + '.' + b + '.' + c + '.' + d;
}

export const auditLogsData: AuditLogData[] = [];

for (let i = 0; i < 500; i++) {
  const emp = employeesData[(i * 7 + 3) % employeesData.length];
  const action = ACTIONS[i % ACTIONS.length];
  const module = MODULES[i % MODULES.length];
  const createdAt = new Date(Date.UTC(2024, (i % 12), 1 + (i % 28), 6 + (i % 12), (i * 5) % 60, (i * 11) % 60));

  auditLogsData.push({
    userEmail: emp.email,
    action,
    module,
    recordId: action === 'LOGIN' || action === 'LOGOUT' ? null : module.toUpperCase().slice(0, 4) + '-' + String((i * 17) % 9999).padStart(4, '0'),
    ipAddress: ipFor(i),
    userAgent: USER_AGENTS[i % USER_AGENTS.length],
    createdAt,
  });
}

if (auditLogsData.length !== 500) throw new Error('Expected 500 audit logs');