const fs = require('fs');
const p = 'src/services/leaveService.ts';
let s = fs.readFileSync(p, 'utf8');

if (!s.includes('export interface LeaveDetail')) {
  s = s.replace(
    /export const leaveService = \{/,
    `export interface LeaveDetail extends LeaveRow {
  employeeEmail: string;
  manager: { id: string; employeeCode: string; fullName: string; email: string } | null;
  createdAt: string;
  audit: { id: string; action: string; userId: string | null; at: string; payload: any }[];
}

export const leaveService = {`
  );
}

if (!s.includes('detail: (id')) {
  s = s.replace(
    /byDepartment: \(\) => api\.get<LeaveDepartmentRow\[\]>\(.leave\/by-department.\)/,
    `byDepartment: () => api.get<LeaveDepartmentRow[]>('/leave/by-department'),
  detail: (id: string) => api.get<LeaveDetail>('/leave/' + id),
  approve: (id: string) => api.post<{ id: string; status: string; approvedAt: string }>('/leave/' + id + '/approve'),
  reject: (id: string, reason: string) => api.post<{ id: string; status: string; approvedAt: string; rejectionReason: string }>('/leave/' + id + '/reject', { reason })`
  );
}

fs.writeFileSync(p, s);
console.log('leaveService.ts (frontend) patched');
