const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
(async () => {
  const p = new PrismaClient();
  const pending = await p.leave.findFirst({
    where: { status: 'PENDING' },
    select: { id: true, employeeId: true, leaveType: true, days: true },
  });
  console.log('One pending leave:', JSON.stringify(pending, null, 2));
  const count = await p.leave.count({ where: { status: 'PENDING' } });
  console.log('Total pending:', count);
  await p.$disconnect();
})();
