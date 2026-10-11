import { prisma } from '../config/prisma';

export const STAGES: { key: string; title: string; tasks: { title: string; description: string }[] }[] = [
  {
    key: 'OFFER_ACCEPTED',
    title: 'Offer Accepted',
    tasks: [
      { title: 'Confirm offer acceptance', description: 'Candidate has signed and returned the offer letter.' },
      { title: 'Log joining date', description: 'Record the official date of joining in the HRMS.' },
    ],
  },
  {
    key: 'PERSONAL_DETAILS',
    title: 'Personal Details',
    tasks: [
      { title: 'Collect personal information', description: 'Name, DOB, contact, emergency contact, address.' },
      { title: 'Verify personal email', description: 'Send a verification link to the personal email.' },
    ],
  },
  {
    key: 'DOCUMENTS',
    title: 'Employment Documents',
    tasks: [
      { title: 'PAN and Aadhaar', description: 'Collect and verify identity documents.' },
      { title: 'Education certificates', description: 'Collect highest degree and mark sheets.' },
      { title: 'Previous employment proof', description: 'Relieving letter and payslips if applicable.' },
    ],
  },
  {
    key: 'DEPT_ASSIGNMENT',
    title: 'Department Assignment',
    tasks: [
      { title: 'Assign department', description: 'HR assigns the correct department.' },
      { title: 'Assign team', description: 'Assign to a specific team within the department.' },
    ],
  },
  {
    key: 'MANAGER_ASSIGNMENT',
    title: 'Manager Assignment',
    tasks: [
      { title: 'Assign reporting manager', description: 'Set the direct manager.' },
      { title: 'Introduce to team lead', description: 'Notify the team lead of the new joiner.' },
    ],
  },
  {
    key: 'ACCOUNT_SETUP',
    title: 'Account Setup',
    tasks: [
      { title: 'Corporate email', description: 'Provision @fintechitsolutions.in mailbox.' },
      { title: 'SSO account', description: 'Create SSO credentials with MFA.' },
      { title: 'Shared drive access', description: 'Grant access to team drives.' },
    ],
  },
  {
    key: 'ASSET_ASSIGNMENT',
    title: 'Asset Assignment',
    tasks: [
      { title: 'Laptop allocation', description: 'Assign a laptop from inventory.' },
      { title: 'Accessories', description: 'Headset, keyboard, mouse, security key.' },
    ],
  },
  {
    key: 'POLICY_ACK',
    title: 'Policy Acknowledgment',
    tasks: [
      { title: 'Code of conduct', description: 'Read and acknowledge.' },
      { title: 'Leave and attendance policy', description: 'Read and acknowledge.' },
      { title: 'Information security policy', description: 'Read and acknowledge.' },
    ],
  },
  {
    key: 'ORIENTATION',
    title: 'Orientation',
    tasks: [
      { title: 'Company overview session', description: 'Attend the intro session.' },
      { title: 'Team introduction', description: 'Meet the team and manager.' },
    ],
  },
  {
    key: 'COMPLETE',
    title: 'Onboarding Complete',
    tasks: [
      { title: 'Final sign-off', description: 'HR marks onboarding complete.' },
    ],
  },
];

export async function listOnboarding(params: { status?: string; page: number; pageSize: number }) {
  const where: any = {};
  if (params.status) where.status = params.status;

  const [total, rows] = await Promise.all([
    prisma.onboardingRecord.count({ where }),
    prisma.onboardingRecord.findMany({
      where,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      orderBy: { startedAt: 'desc' },
      include: {
        employee: {
          select: {
            id: true, employeeCode: true, fullName: true, email: true, joiningDate: true,
            department: { select: { code: true, name: true } },
            location: { select: { city: true } },
          },
        },
        tasks: { select: { id: true, isComplete: true } },
      },
    }),
  ]);

  const items = rows.map((r) => {
    const done = r.tasks.filter((t) => t.isComplete).length;
    const total = r.tasks.length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    return {
      id: r.id,
      employeeId: r.employee.id,
      employeeCode: r.employee.employeeCode,
      employeeName: r.employee.fullName,
      email: r.employee.email,
      departmentName: r.employee.department.name,
      departmentCode: r.employee.department.code,
      locationCity: r.employee.location.city,
      joiningDate: r.employee.joiningDate,
      currentStage: r.currentStage,
      status: r.status,
      startedAt: r.startedAt,
      completedAt: r.completedAt,
      totalTasks: total,
      completedTasks: done,
      progress,
    };
  });

  return {
    items,
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
  };
}

export async function getOnboardingDetail(id: string) {
  const r = await prisma.onboardingRecord.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          id: true, employeeCode: true, fullName: true, email: true, phone: true,
          joiningDate: true,
          department: { select: { code: true, name: true } },
          team: { select: { code: true, name: true } },
          location: { select: { city: true } },
          manager: { select: { employeeCode: true, fullName: true } },
        },
      },
      tasks: { orderBy: { createdAt: 'asc' } },
    },
  });
  if (!r) return null;

  // Group tasks by stage in canonical order
  const byStage = STAGES.map((s) => {
    const stageTasks = r.tasks.filter((t) => t.stage === s.key);
    return {
      key: s.key,
      title: s.title,
      isCurrent: r.currentStage === s.key,
      isComplete: stageTasks.length > 0 && stageTasks.every((t) => t.isComplete),
      tasks: stageTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        isComplete: t.isComplete,
        completedAt: t.completedAt,
        assignedTo: t.assignedTo,
      })),
    };
  });

  return {
    id: r.id,
    employee: {
      id: r.employee.id,
      employeeCode: r.employee.employeeCode,
      fullName: r.employee.fullName,
      email: r.employee.email,
      phone: r.employee.phone,
      joiningDate: r.employee.joiningDate,
      departmentName: r.employee.department.name,
      departmentCode: r.employee.department.code,
      teamName: r.employee.team?.name || null,
      locationCity: r.employee.location.city,
      managerName: r.employee.manager?.fullName || null,
    },
    currentStage: r.currentStage,
    status: r.status,
    startedAt: r.startedAt,
    completedAt: r.completedAt,
    notes: r.notes,
    stages: byStage,
  };
}

export async function startOnboarding(employeeCode: string, actorUserId: string | null) {
  const employee = await prisma.employee.findUnique({
    where: { employeeCode },
    select: { id: true, employeeCode: true, fullName: true },
  });
  if (!employee) throw Object.assign(new Error('Employee not found'), { status: 404, code: 'NOT_FOUND' });

  const existing = await prisma.onboardingRecord.findUnique({ where: { employeeId: employee.id } });
  if (existing) throw Object.assign(new Error('Onboarding already exists for this employee'), { status: 409, code: 'CONFLICT' });

  const record = await prisma.onboardingRecord.create({
    data: {
      employeeId: employee.id,
      currentStage: 'OFFER_ACCEPTED',
      status: 'IN_PROGRESS',
    },
  });

  // Create tasks for every stage up front. First stage tasks are active.
  const taskData: any[] = [];
  for (const stage of STAGES) {
    for (const t of stage.tasks) {
      taskData.push({
        recordId: record.id,
        stage: stage.key,
        title: t.title,
        description: t.description,
      });
    }
  }
  await prisma.onboardingTask.createMany({ data: taskData });

  await prisma.auditLog.create({
    data: {
      userId: actorUserId,
      action: 'CREATE',
      module: 'onboarding',
      recordId: record.id,
      newValue: { employeeCode: employee.employeeCode, event: 'ONBOARDING_STARTED' } as any,
    },
  });

  return { id: record.id, employeeCode: employee.employeeCode, currentStage: record.currentStage };
}

export async function completeTask(taskId: string, actorUserId: string | null) {
  const task = await prisma.onboardingTask.findUnique({ where: { id: taskId } });
  if (!task) throw Object.assign(new Error('Task not found'), { status: 404, code: 'NOT_FOUND' });
  if (task.isComplete) return { id: task.id, isComplete: true };

  const updated = await prisma.onboardingTask.update({
    where: { id: taskId },
    data: { isComplete: true, completedAt: new Date(), completedBy: actorUserId },
  });

  // Auto-advance the record's currentStage if all tasks of that stage are done.
  const siblings = await prisma.onboardingTask.findMany({ where: { recordId: task.recordId, stage: task.stage } });
  const stageDone = siblings.every((t) => t.isComplete);

  const record = await prisma.onboardingRecord.findUnique({ where: { id: task.recordId } });
  if (record && stageDone && record.currentStage === task.stage) {
    const idx = STAGES.findIndex((s) => s.key === task.stage);
    const nextStage = idx >= 0 && idx + 1 < STAGES.length ? STAGES[idx + 1].key : 'COMPLETE';
    await prisma.onboardingRecord.update({
      where: { id: record.id },
      data: {
        currentStage: nextStage as any,
        status: nextStage === 'COMPLETE' ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: nextStage === 'COMPLETE' ? new Date() : null,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: actorUserId,
      action: 'UPDATE',
      module: 'onboarding',
      recordId: task.recordId,
      newValue: { taskId, event: 'TASK_COMPLETED' } as any,
    },
  });

  return { id: updated.id, isComplete: true };
}