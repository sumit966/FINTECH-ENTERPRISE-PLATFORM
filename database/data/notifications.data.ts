// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Notifications (400)
// ============================================================================

import { employeesData } from './employees.data';

export type NotificationType = 'LEAVE' | 'PAYROLL' | 'INTERVIEW' | 'PROJECT' | 'SECURITY' | 'INVOICE' | 'DEADLINE' | 'SYSTEM';

export interface NotificationData {
  userEmail: string;
  employeeCode: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  isRead: boolean;
  createdAt: Date;
}

interface Tmpl { type: NotificationType; title: string; body: string; link: string; }

const TEMPLATES: Tmpl[] = [
  { type: 'LEAVE',    title: 'Leave request pending approval', body: 'A team member has submitted a leave request awaiting your approval.', link: '/leave' },
  { type: 'PAYROLL',  title: 'Payslip available',              body: 'Your monthly payslip is now available in the portal.',               link: '/payroll' },
  { type: 'INTERVIEW',title: 'Interview scheduled',            body: 'You have been added to an interview panel scheduled for tomorrow.',  link: '/recruitment' },
  { type: 'PROJECT',  title: 'Project status updated',         body: 'A project you are a member of has changed status.',                   link: '/projects' },
  { type: 'SECURITY', title: 'Security event detected',        body: 'A security event has been logged and requires review.',               link: '/security' },
  { type: 'INVOICE',  title: 'Invoice approved',               body: 'An invoice has been approved and sent to the client.',                link: '/finance' },
  { type: 'DEADLINE', title: 'Deadline approaching',           body: 'A task assigned to you is due within 48 hours.',                       link: '/projects' },
  { type: 'SYSTEM',   title: 'System maintenance scheduled',   body: 'The platform will undergo maintenance this weekend.',                  link: '/settings' },
];

export const notificationsData: NotificationData[] = [];

for (let i = 0; i < 400; i++) {
  const emp = employeesData[(i * 7 + 5) % employeesData.length];
  const t = TEMPLATES[i % TEMPLATES.length];
  const isRead = i % 3 !== 0;
  const createdAt = new Date(Date.UTC(2024, 10, 1 + (i % 28), 9 + (i % 12), (i * 5) % 60, 0));

  notificationsData.push({
    userEmail: emp.email,
    employeeCode: emp.employeeCode,
    type: t.type,
    title: t.title,
    body: t.body,
    link: t.link,
    isRead,
    createdAt,
  });
}

if (notificationsData.length !== 400) throw new Error('Expected 400 notifications');