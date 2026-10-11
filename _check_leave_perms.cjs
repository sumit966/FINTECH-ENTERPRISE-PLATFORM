const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './backend/.env' });
(async () => {
  const p = new PrismaClient();
  // All permissions mentioning leave
  const perms = await p.permission.findMany({
    where: { code: { contains: 'leave', mode: 'insensitive' } },
    select: { code: true, description: true },
  });
  console.log('=== permissions matching "leave" ===');
  console.log(JSON.stringify(perms, null, 2));

  // Which roles have those permissions
  for (const perm of perms) {
    const roles = await p.rolePermission.findMany({
      where: { permission: { code: perm.code } },
      include: { role: { select: { code: true } } },
    });
    console.log(perm.code, '->', roles.map((r) => r.role.code).join(', '));
  }

  await p.$disconnect();
})();
