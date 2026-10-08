// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Leave records (deterministic)
// ~1,500 records across 24 months, 3 per employee on average.
// ============================================================================

import { employeesData } from './employees.data';

export type LeaveType = 'CASUAL' | 'SICK' | 'EARNED' | 'OPTIONAL_HOLIDAY' | 'UNPAID' | 'WFH';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveData {
  employeeCode: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: LeaveStatus;
  approvedByCode: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
}

const LEAVE_TYPES: LeaveType[] = ['CASUAL', 'SICK', 'EARNED', 'OPTIONAL_HOLIDAY', 'UNPAID'];
const REASONS: Record<LeaveType, string> = {
  CASUAL:           'Personal reasons',
  SICK:             'Medical leave',
  EARNED:           'Planned vacation',
  OPTIONAL_HOLIDAY: 'Optional holiday observance',
  UNPAID:           'Unpaid personal time',
  WFH:              'Work from home',
};

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 3600 * 1000);
}

export const leavesData: LeaveData[] = [];

// Window: 2023-01-01 through 2024-12-15
const START = Date.UTC(2023, 0, 1);
const END = Date.UTC(2024, 11, 15);

for (let i = 0; i < employeesData.length; i++) {
  const emp = employeesData[i];
  // 3 leaves per employee on average. Some get 2, some get 4.
  const count = 2 + (i % 3);

  for (let k = 0; k < count; k++) {
    const typeIdx = (i + k * 5) % LEAVE_TYPES.length;
    const leaveType = LEAVE_TYPES[typeIdx];

    // Deterministic start date within the window.
    const dayOffset = (i * 17 + k * 41) % Math.floor((END - START) / (24 * 3600 * 1000));
    const startDate = addDays(new Date(START), dayOffset);

    // Duration: 1-5 days deterministic.
    const days = 1 + ((i + k) % 5);
    const endDate = addDays(startDate, days - 1);

    // Status: most past leaves are APPROVED. Future ones might be PENDING.
    const now = Date.UTC(2024, 11, 1);
    let status: LeaveStatus;
    if (startDate.getTime() < now) {
      status = (i + k) % 20 === 0 ? 'REJECTED' : 'APPROVED';
    } else {
      status = (i + k) % 4 === 0 ? 'PENDING' : 'APPROVED';
    }

    const approved = status === 'APPROVED';
    const rejected = status === 'REJECTED';

    // Manager approval chain
    const manager = emp.managerCode || 'FITS-0002';

    leavesData.push({
      employeeCode: emp.employeeCode,
      leaveType,
      startDate,
      endDate,
      days,
      reason: REASONS[leaveType],
      status,
      approvedByCode: approved ? manager : null,
      approvedAt: approved ? addDays(startDate, -2) : null,
      rejectionReason: rejected ? 'Insufficient notice period' : null,
    });
  }
}

console.log('Generated ' + leavesData.length + ' leave records');