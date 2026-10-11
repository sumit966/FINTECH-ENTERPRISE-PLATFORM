const fs = require('fs');
const p = 'src/pages/hr/LeavePage.tsx';
let s = fs.readFileSync(p, 'utf8');

// Fix 1: roles are objects with a .code field. Read .code.
s = s.replace(
  "user.roles.some((r) => SUPER_ROLES.has(r))",
  "user.roles.some((r: any) => SUPER_ROLES.has(typeof r === 'string' ? r : r.code))"
);

fs.writeFileSync(p, s);
console.log('LeavePage.tsx: roles check fixed');
