export interface PermissionData {
  code: string; module: string;
  action: 'read' | 'create' | 'update' | 'delete' | 'approve' | 'export';
  description: string;
}
const modules = [
  'employees','departments','teams','attendance','leave','payroll','projects',
  'clients','finance','invoices','expenses','vendors','assets','recruitment',
  'exams','engineering','security','documents','knowledge','ai','analytics',
  'audit','settings',
] as const;
const actions: PermissionData['action'][] = ['read','create','update','delete','approve','export'];
export const permissionsData: PermissionData[] = modules.flatMap((m) =>
  actions.map((a) => ({
    code: `${m}.${a}`,
    module: m,
    action: a,
    description: `${a[0].toUpperCase() + a.slice(1)} ${m}`,
  }))
);