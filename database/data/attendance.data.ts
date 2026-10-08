// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Attendance (deterministic)
// Last 90 days x 500 employees = 45,000 rows. No randomness.
// ============================================================================

import { employeesData } from './employees.data';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_DEPARTURE' | 'HALF_DAY' | 'WFH' | 'HOLIDAY' | 'LEAVE' | 'OVERTIME';

export interface AttendanceData {
  employeeCode: string;
  date: Date;
  checkIn: Date | null;
  checkOut: Date | null;
  workingHours: number | null;
  overtimeHours: number | null;
  status: AttendanceStatus;
  workMode: 'OFFICE' | 'WFH' | 'HYBRID';
  notes: string;
}

// Last 90 days ending 2024-11-29.
const END_DATE = new Date(Date.UTC(2024, 10, 29)); // 2024-11-29
const DAYS = 90;

const DAYS_ARR: Date[] = [];
for (let d = DAYS - 1; d >= 0; d--) {
  DAYS_ARR.push(new Date(END_DATE.getTime() - d * 24 * 3600 * 1000));
}

// Fixed Indian public holidays in the window (2024-09-01 to 2024-11-29).
const HOLIDAYS = new Set<string>([
  '2024-09-16', // Milad-un-Nabi (approx)
  '2024-10-02', // Gandhi Jayanti
  '2024-10-12', // Dussehra (approx)
  '2024-10-31', // Diwali (approx)
  '2024-11-01', // Diwali/New Year (approx)
  '2024-11-15', // Guru Nanak Jayanti (approx)
]);

function ymd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function isWeekend(d: Date): boolean {
  const dow = d.getUTCDay();
  return dow === 0 || dow === 6; // Sunday or Saturday
}

export const attendanceData: AttendanceData[] = [];

for (let dayIdx = 0; dayIdx < DAYS_ARR.length; dayIdx++) {
  const day = DAYS_ARR[dayIdx];
  const key = ymd(day);
  const weekend = isWeekend(day);
  const holiday = HOLIDAYS.has(key);

  for (let i = 0; i < employeesData.length; i++) {
    const emp = employeesData[i];
    const idx = i + dayIdx * 7; // deterministic index

    // Weekends: HOLIDAY for all (no work).
    if (weekend) {
      attendanceData.push({
        employeeCode: emp.employeeCode,
        date: day,
        checkIn: null,
        checkOut: null,
        workingHours: null,
        overtimeHours: null,
        status: 'HOLIDAY',
        workMode: 'OFFICE',
        notes: 'Weekend',
      });
      continue;
    }

    // Public holidays: HOLIDAY.
    if (holiday) {
      attendanceData.push({
        employeeCode: emp.employeeCode,
        date: day,
        checkIn: null,
        checkOut: null,
        workingHours: null,
        overtimeHours: null,
        status: 'HOLIDAY',
        workMode: 'OFFICE',
        notes: 'Public holiday',
      });
      continue;
    }

    // Absent: 2% of employees each day (deterministic).
    if (idx % 50 === 3) {
      attendanceData.push({
        employeeCode: emp.employeeCode,
        date: day,
        checkIn: null,
        checkOut: null,
        workingHours: null,
        overtimeHours: null,
        status: 'ABSENT',
        workMode: 'OFFICE',
        notes: 'Unplanned absence',
      });
      continue;
    }

    // WFH: 15% of employees on any weekday.
    const isWfh = idx % 7 === 2;

    // Late arrival: 8% of on-site employees.
    const isLate = !isWfh && idx % 13 === 5;

    // Early departure: 5% of on-site employees.
    const isEarly = !isWfh && idx % 20 === 11;

    // Overtime: 6% of employees.
    const isOt = idx % 17 === 4;

    // Half day: 1.5%.
    const isHalf = idx % 65 === 9;

    let checkInHour = 9;
    let checkInMin = (idx % 4) * 5; // 0, 5, 10, 15
    if (isLate) { checkInHour = 10; checkInMin = (idx % 3) * 10; }
    if (isHalf) { checkInHour = 13; checkInMin = 0; }

    let checkOutHour = 18;
    let checkOutMin = (idx % 4) * 5;
    if (isEarly) { checkOutHour = 16; checkOutMin = 30; }
    if (isOt)    { checkOutHour = 21; checkOutMin = 0; }

    const checkIn = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), checkInHour, checkInMin));
    const checkOut = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), checkOutHour, checkOutMin));

    const hours = (checkOut.getTime() - checkIn.getTime()) / (3600 * 1000);
    const workingHours = Math.round(hours * 100) / 100;
    const overtimeHours = isOt ? 2.5 : 0;

    let status: AttendanceStatus;
    if (isHalf) status = 'HALF_DAY';
    else if (isOt) status = 'OVERTIME';
    else if (isLate) status = 'LATE';
    else if (isEarly) status = 'EARLY_DEPARTURE';
    else if (isWfh) status = 'WFH';
    else status = 'PRESENT';

    attendanceData.push({
      employeeCode: emp.employeeCode,
      date: day,
      checkIn: isHalf ? checkIn : checkIn,
      checkOut,
      workingHours,
      overtimeHours: isOt ? overtimeHours : null,
      status,
      workMode: isWfh ? 'WFH' : 'OFFICE',
      notes: isOt ? 'Approved overtime' : '',
    });
  }
}

if (attendanceData.length !== 90 * 500) throw new Error('Expected 45,000 attendance rows, got ' + attendanceData.length);