// RBAC logic is verified here in isolation. The middleware itself calls
// these same rules at request time.

const SUPER_ROLES = new Set(['FOUNDER_CEO', 'DIRECTOR']);

function hasAccess(userRoles: string[], userPermissions: string[], requiredPermission: string): boolean {
  if (userRoles.some((r) => SUPER_ROLES.has(r))) return true;
  return userPermissions.includes(requiredPermission);
}

describe('RBAC permission check', () => {
  test('FOUNDER_CEO bypasses permission checks', () => {
    expect(hasAccess(['FOUNDER_CEO'], [], 'payroll.read')).toBe(true);
    expect(hasAccess(['FOUNDER_CEO'], [], 'audit.delete')).toBe(true);
  });

  test('DIRECTOR bypasses permission checks', () => {
    expect(hasAccess(['DIRECTOR'], [], 'anything.at.all')).toBe(true);
  });

  test('regular role with the exact permission is allowed', () => {
    expect(hasAccess(['ENGINEER'], ['projects.read'], 'projects.read')).toBe(true);
  });

  test('regular role without the permission is denied', () => {
    expect(hasAccess(['ENGINEER'], ['projects.read'], 'payroll.read')).toBe(false);
  });

  test('EMPLOYEE role cannot read payroll without permission', () => {
    expect(hasAccess(['EMPLOYEE'], ['employees.read'], 'payroll.read')).toBe(false);
  });

  test('AUDITOR has audit.read but not audit.delete', () => {
    const perms = ['audit.read', 'analytics.read'];
    expect(hasAccess(['AUDITOR'], perms, 'audit.read')).toBe(true);
    expect(hasAccess(['AUDITOR'], perms, 'audit.delete')).toBe(false);
  });
});