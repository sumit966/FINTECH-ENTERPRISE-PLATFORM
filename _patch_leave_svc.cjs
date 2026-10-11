const fs = require('fs');
const p = 'backend/src/services/leaveService.ts';
let s = fs.readFileSync(p, 'utf8');

// Append the three new functions at the end
const additions = `

// ---- Approval workflow --------------------------------------------------
// Approve and Reject both:
//   1) verify the request is still PENDING (409 otherwise)
//   2) set status + timestamp in a single update
//   3) write one auditLog row for the decision
// The actor's user id is passed from the controller (req.user.id).

export async function getLeaveDetail(id: string) {
  const l = await prisma.leave.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          employeeCode: true,
          fullName: true,
          email: true,
          manager: { select: { id: true, employeeCode: true, fullName: true, email: true } },
          department: { select: { code: true, name: true } },
          location: { select: { code: true, city: true } },
        },
      },
    },
  });
  if (!l) return null;

  // Audit trail: every auditLog row that references this leave record.
  const audit = await prisma.auditLog.findMany({
    where: { module: 'leave', recordId: id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, action: true, userId: true, createdAt: true, newValue: true },
  });

  return {
    id: l.id,
    employeeCode: l.employee.employeeCode,
    employeeName: l.employee.fullName,
    employeeEmail: l.employee.email,
    departmentCode: l.employee.department.code,
    departmentName: l.employee.department.name,
    locationCity: l.employee.location.city,
    manager: l.employee.manager
      ? {
          id: l.employee.manager.id,
          employeeCode: l.employee.manager.employeeCode,
          fullName: l.employee.manager.fullName,
          email: l.employee.manager.email,
        }
      : null,
    leaveType: l.leaveType,
    startDate: l.startDate,
    endDate: l.endDate,
    days: l.days,
    reason: l.reason,
    status: l.status,
    approvedAt: l.approvedAt,
    rejectionReason: l.rejectionReason,
    createdAt: l.createdAt,
    audit: audit.map((a) => ({
      id: a.id,
      action: a.action,
      userId: a.userId,
      at: a.createdAt,
      payload: a.newValue,
    })),
  };
}

export async function approveLeave(id: string, actorUserId: string | null) {
  const existing = await prisma.leave.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error('Leave request not found'), { status: 404, code: 'NOT_FOUND' });
  }
  if (existing.status !== 'PENDING') {
    throw Object.assign(new Error('Only PENDING requests can be approved'), { status: 409, code: 'CONFLICT' });
  }

  const now = new Date();
  const updated = await prisma.leave.update({
    where: { id },
    data: { status: 'APPROVED', approvedAt: now, rejectionReason: null },
  });

  await prisma.auditLog.create({
    data: {
      userId: actorUserId,
      action: 'APPROVE',
      module: 'leave',
      recordId: id,
      oldValue: { status: existing.status } as any,
      newValue: { status: 'APPROVED', at: now.toISOString() } as any,
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    approvedAt: updated.approvedAt,
    rejectionReason: updated.rejectionReason,
  };
}

export async function rejectLeave(id: string, reason: string, actorUserId: string | null) {
  if (!reason || reason.trim().length < 3) {
    throw Object.assign(new Error('Rejection reason is required (min 3 characters)'), { status: 422, code: 'VALIDATION' });
  }

  const existing = await prisma.leave.findUnique({ where: { id } });
  if (!existing) {
    throw Object.assign(new Error('Leave request not found'), { status: 404, code: 'NOT_FOUND' });
  }
  if (existing.status !== 'PENDING') {
    throw Object.assign(new Error('Only PENDING requests can be rejected'), { status: 409, code: 'CONFLICT' });
  }

  const now = new Date();
  const trimmed = reason.trim();
  const updated = await prisma.leave.update({
    where: { id },
    data: { status: 'REJECTED', approvedAt: now, rejectionReason: trimmed },
  });

  await prisma.auditLog.create({
    data: {
      userId: actorUserId,
      action: 'REJECT',
      module: 'leave',
      recordId: id,
      oldValue: { status: existing.status } as any,
      newValue: { status: 'REJECTED', reason: trimmed, at: now.toISOString() } as any,
    },
  });

  return {
    id: updated.id,
    status: updated.status,
    approvedAt: updated.approvedAt,
    rejectionReason: updated.rejectionReason,
  };
}
`;

s = s.replace(/\s*$/, '') + '\n' + additions.trimStart();
fs.writeFileSync(p, s);
console.log('leaveService.ts: added getLeaveDetail, approveLeave, rejectLeave');
