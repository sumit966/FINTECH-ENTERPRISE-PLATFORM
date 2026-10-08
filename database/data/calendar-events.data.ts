// ============================================================================
// NEXUS ENTERPRISE PLATFORM - Calendar Events (100)
// ============================================================================

export type EventCategory = 'INTERVIEW' | 'MEETING' | 'MILESTONE' | 'RELEASE' | 'HOLIDAY' | 'LEAVE' | 'TRAINING' | 'REVIEW' | 'PAYROLL' | 'CLIENT';

export interface CalendarEventData {
  title: string;
  description: string;
  category: EventCategory;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  location: string;
}

function d(y: number, m: number, day: number, h: number = 0): Date {
  return new Date(Date.UTC(y, m - 1, day, h, 0, 0));
}

export const calendarEventsData: CalendarEventData[] = [
  // Indian public holidays 2024-2025
  { title: 'Republic Day',           description: 'National holiday',                 category: 'HOLIDAY', startAt: d(2025,1,26),  endAt: d(2025,1,27),  allDay: true,  location: 'All India' },
  { title: 'Holi',                   description: 'Festival of colours',              category: 'HOLIDAY', startAt: d(2025,3,14),  endAt: d(2025,3,15),  allDay: true,  location: 'All India' },
  { title: 'Good Friday',            description: 'Christian holiday',                category: 'HOLIDAY', startAt: d(2025,4,18),  endAt: d(2025,4,19),  allDay: true,  location: 'All India' },
  { title: 'Independence Day',       description: 'National holiday',                 category: 'HOLIDAY', startAt: d(2025,8,15),  endAt: d(2025,8,16),  allDay: true,  location: 'All India' },
  { title: 'Gandhi Jayanti',         description: 'National holiday',                 category: 'HOLIDAY', startAt: d(2025,10,2),  endAt: d(2025,10,3),  allDay: true,  location: 'All India' },
  { title: 'Diwali',                 description: 'Festival of lights',               category: 'HOLIDAY', startAt: d(2025,10,20), endAt: d(2025,10,22), allDay: true,  location: 'All India' },
  { title: 'Christmas',              description: 'Christian holiday',                category: 'HOLIDAY', startAt: d(2025,12,25), endAt: d(2025,12,26), allDay: true,  location: 'All India' },

  // Payroll dates
  { title: 'Payroll cut-off',        description: 'Monthly payroll input deadline',   category: 'PAYROLL', startAt: d(2025,1,25,18),  endAt: d(2025,1,25,19),  allDay: false, location: 'Online' },
  { title: 'Payroll processing',     description: 'Payroll run for the month',        category: 'PAYROLL', startAt: d(2025,1,28,9),   endAt: d(2025,1,28,18),  allDay: false, location: 'Finance' },
  { title: 'Payroll cut-off',        description: 'Monthly payroll input deadline',   category: 'PAYROLL', startAt: d(2025,2,25,18),  endAt: d(2025,2,25,19),  allDay: false, location: 'Online' },
  { title: 'Payroll processing',     description: 'Payroll run for the month',        category: 'PAYROLL', startAt: d(2025,2,28,9),   endAt: d(2025,2,28,18),  allDay: false, location: 'Finance' },

  // Quarterly board meetings
  { title: 'Q1 Board meeting',       description: 'Executive and board alignment',    category: 'MEETING', startAt: d(2025,4,15,10), endAt: d(2025,4,15,13), allDay: false, location: 'Pune HQ' },
  { title: 'Q2 Board meeting',       description: 'Executive and board alignment',    category: 'MEETING', startAt: d(2025,7,15,10), endAt: d(2025,7,15,13), allDay: false, location: 'Pune HQ' },
  { title: 'Q3 Board meeting',       description: 'Executive and board alignment',    category: 'MEETING', startAt: d(2025,10,15,10),endAt: d(2025,10,15,13),allDay: false, location: 'Pune HQ' },

  // Learning / training
  { title: 'AI/ML internal workshop',description: 'Team workshop on RAG systems',     category: 'TRAINING',startAt: d(2025,2,10,9),  endAt: d(2025,2,10,17),  allDay: false, location: 'Bangalore' },
  { title: 'Security awareness',     description: 'Annual security training',         category: 'TRAINING',startAt: d(2025,5,20,10), endAt: d(2025,5,20,12),  allDay: false, location: 'Online' },
  { title: 'Cloud certification bootcamp', description: 'AWS cert prep',              category: 'TRAINING',startAt: d(2025,6,3,9),   endAt: d(2025,6,7,17),   allDay: false, location: 'Pune' },
];

// Add generated repeating events: weekly all-hands, monthly reviews, recurring releases.
// This brings us to 100 events total.
let counter = calendarEventsData.length;

// 12 weekly all-hands (Jan-Mar 2025)
for (let w = 0; w < 12; w++) {
  const start = new Date(Date.UTC(2025, 0, 6 + w * 7, 17, 0, 0));
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  calendarEventsData.push({
    title: 'Weekly All-Hands',
    description: 'Company-wide weekly update',
    category: 'MEETING',
    startAt: start,
    endAt: end,
    allDay: false,
    location: 'Online',
  });
  counter++;
}

// 12 monthly performance reviews (2025)
for (let m = 0; m < 12; m++) {
  calendarEventsData.push({
    title: 'Performance review - ' + (m + 1) + '/2025',
    description: 'Monthly performance review window',
    category: 'REVIEW',
    startAt: new Date(Date.UTC(2025, m, 1, 10, 0, 0)),
    endAt: new Date(Date.UTC(2025, m, 5, 18, 0, 0)),
    allDay: false,
    location: 'Online',
  });
  counter++;
}

// 12 monthly releases
for (let m = 0; m < 12; m++) {
  calendarEventsData.push({
    title: 'Platform release - ' + (m + 1) + '/2025',
    description: 'Scheduled platform release window',
    category: 'RELEASE',
    startAt: new Date(Date.UTC(2025, m, 20, 22, 0, 0)),
    endAt: new Date(Date.UTC(2025, m, 21, 2, 0, 0)),
    allDay: false,
    location: 'Online',
  });
  counter++;
}

// Add remaining events to reach exactly 100
while (calendarEventsData.length < 100) {
  const idx = calendarEventsData.length;
  calendarEventsData.push({
    title: 'Project milestone review ' + (idx - 15),
    description: 'Project milestone and risk review',
    category: 'MILESTONE',
    startAt: new Date(Date.UTC(2025, idx % 12, 5 + (idx % 20), 11, 0, 0)),
    endAt: new Date(Date.UTC(2025, idx % 12, 5 + (idx % 20), 12, 0, 0)),
    allDay: false,
    location: 'Online',
  });
}

if (calendarEventsData.length !== 100) throw new Error('Expected 100 calendar events, got ' + calendarEventsData.length);