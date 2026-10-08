// ============================================================================
// NEXUS ENTERPRISE PLATFORM - KPIs (40)
// ============================================================================

export type KpiCategory = 'COMPANY' | 'ENGINEERING' | 'PROJECT' | 'FINANCE' | 'HR';
export type KpiUnit = 'PERCENT' | 'COUNT' | 'CURRENCY_INR' | 'HOURS' | 'RATIO';

export interface KpiData {
  code: string;
  name: string;
  category: KpiCategory;
  unit: KpiUnit;
  formula: string;
  targetValue: number | null;
  currentValue: number | null;
  trend: 'UP' | 'DOWN' | 'FLAT';
}

export interface KpiSnapshotData {
  kpiCode: string;
  value: number;
}

function k(code: string, name: string, cat: KpiCategory, unit: KpiUnit, formula: string, target: number, current: number, trend: KpiData['trend']): KpiData {
  return { code, name, category: cat, unit, formula, targetValue: target, currentValue: current, trend };
}

export const kpisData: KpiData[] = [
  k('CO-HEADCOUNT',     'Total Headcount',         'COMPANY',     'COUNT',        'COUNT(employee ACTIVE)', 500, 500, 'FLAT'),
  k('CO-LOCATIONS',     'Locations Count',         'COMPANY',     'COUNT',        'COUNT(location)',           3,   3, 'FLAT'),
  k('CO-DEPARTMENTS',   'Departments Count',       'COMPANY',     'COUNT',        'COUNT(department)',        32,  32, 'FLAT'),
  k('CO-ACTIVE-PROJ',   'Active Projects',         'COMPANY',     'COUNT',        'COUNT(project ACTIVE)',    45,  45, 'UP'),
  k('CO-ATTRITION-YTD', 'Attrition YTD',           'COMPANY',     'PERCENT',      'leavers/avg*100',           8, 6.4, 'DOWN'),
  k('HR-LEAVE-AVG',     'Avg Leave Balance',       'HR',          'HOURS',        'AVG(leaveBalance)',        16, 15.8, 'FLAT'),
  k('HR-LEAVE-USE',     'Leave Utilisation',       'HR',          'PERCENT',      'used/(opening+credit)',    70, 68.4, 'UP'),
  k('HR-TENURE',        'Avg Tenure Years',        'HR',          'RATIO',        'AVG(now - joining)',        2,  1.8, 'UP'),
  k('HR-SATISFACT',     'Employee Satisfaction',   'HR',          'RATIO',        'AVG(performance)',          4,  3.9, 'UP'),
  k('HR-OPENINGS',      'Open Job Openings',       'HR',          'COUNT',        'SUM(job openings)',        50,  55, 'UP'),
  k('HR-PIPELINE',      'Active Candidates',       'HR',          'COUNT',        'COUNT(candidate)',        150, 200, 'UP'),
  k('HR-OFFER-RATE',    'Offer Acceptance',        'HR',          'PERCENT',      'joined/offers*100',        80,  78, 'FLAT'),
  k('EG-DEPLOY-FREQ',   'Deployment Frequency',    'ENGINEERING', 'RATIO',        'deployments/week',         20,  18, 'UP'),
  k('EG-BUILD-SUCCESS', 'Build Success Rate',      'ENGINEERING', 'PERCENT',      'success/total*100',        95, 93.4, 'UP'),
  k('EG-COVERAGE',      'Avg Test Coverage',       'ENGINEERING', 'PERCENT',      'AVG(coveragePct)',         80, 82.1, 'UP'),
  k('EG-BUGS-OPEN',     'Open Bugs',               'ENGINEERING', 'COUNT',        'COUNT(task BLOCKED)',      30,  27, 'DOWN'),
  k('EG-MTTR',          'Mean Time to Recovery',   'ENGINEERING', 'HOURS',        'AVG(incident time)',        4, 3.6, 'DOWN'),
  k('EG-RELEASES',      'Releases This Month',     'ENGINEERING', 'COUNT',        'COUNT(deployment MTD)',    60,  48, 'FLAT'),
  k('EG-CODE-QUALITY',  'Code Quality Score',      'ENGINEERING', 'RATIO',        'static analysis',          85,  87, 'UP'),
  k('EG-SEC-FINDINGS',  'Open Security Findings',  'ENGINEERING', 'COUNT',        'COUNT(security OPEN)',     15,  22, 'UP'),
  k('PJ-ON-TIME',       'On-Time Delivery',        'PROJECT',     'PERCENT',      'on_time/delivered*100',    85,  82, 'UP'),
  k('PJ-BUDGET-VAR',    'Budget Variance',         'PROJECT',     'PERCENT',      '(actual-budget)/budget',    5, 4.2, 'DOWN'),
  k('PJ-SCHEDULE-VAR',  'Schedule Variance',       'PROJECT',     'PERCENT',      '(actual-plan)/plan*100',   10, 8.6, 'DOWN'),
  k('PJ-HEALTH-AVG',    'Avg Project Health',      'PROJECT',     'RATIO',        'AVG(healthScore)',        4.2,4.15, 'UP'),
  k('PJ-RISK-HIGH',     'High-Risk Projects',      'PROJECT',     'COUNT',        'riskScore>=2.5',            5,   3, 'DOWN'),
  k('PJ-UTIL',          'Resource Utilisation',    'PROJECT',     'PERCENT',      'assigned/avail*100',       85,  82, 'UP'),
  k('PJ-CLIENT-SAT',    'Client Satisfaction',     'PROJECT',     'RATIO',        'AVG(client health)',      4.3, 4.2, 'FLAT'),
  k('PJ-MILESTONES',    'Milestones On Track',     'PROJECT',     'PERCENT',      'on_time/total*100',        90,  87, 'UP'),
  k('PJ-COMPLETION',    'Avg Project Completion',  'PROJECT',     'PERCENT',      'AVG(progressPercent)',     65,  61, 'UP'),  k('FN-REVENUE-MTD',   'Revenue MTD',             'FINANCE',     'CURRENCY_INR', 'SUM(paid MTD)',  50000000, 42700000, 'UP'),
  k('FN-REVENUE-YTD',   'Revenue YTD',             'FINANCE',     'CURRENCY_INR', 'SUM(paid YTD)', 500000000,482000000, 'UP'),
  k('FN-PROFIT-MARGIN', 'Profit Margin',           'FINANCE',     'PERCENT',      '(rev-cost)/rev',     25, 22.4, 'UP'),
  k('FN-PAYROLL-MTD',   'Payroll Spend MTD',       'FINANCE',     'CURRENCY_INR', 'SUM(net MTD)', 35000000, 33600000, 'FLAT'),
  k('FN-AR-OVERDUE',    'Overdue Receivables',     'FINANCE',     'CURRENCY_INR', 'SUM(OVERDUE)',  5000000,  6800000, 'UP'),
  k('FN-EXPENSES-MTD',  'Expenses MTD',            'FINANCE',     'CURRENCY_INR', 'SUM(exp MTD)',  8000000,  7200000, 'DOWN'),
  k('FN-CASH-RUNWAY',   'Cash Runway Months',      'FINANCE',     'RATIO',        'cash/monthly burn',   18,     21, 'UP'),
  k('FN-INVOICE-PAID',  'Invoice Paid Rate',       'FINANCE',     'PERCENT',      'paid/total*100',      90,     88, 'UP'),
  k('FN-MARGIN-GROSS',  'Gross Margin',            'FINANCE',     'PERCENT',      '(rev-direct)/rev*100',50,  46.5, 'UP'),
  k('FN-DSO',           'Days Sales Outstanding',  'FINANCE',     'RATIO',        'AR / avg daily rev',  45,     52, 'UP'),
  k('CO-GROWTH-YOY',    'Revenue Growth YoY',      'COMPANY',     'PERCENT',      'yoy growth',          35,   28.4, 'DOWN'),
];

export const kpiSnapshotsData: KpiSnapshotData[] = kpisData.map((x) => ({
  kpiCode: x.code,
  value: x.currentValue ?? 0,
}));

if (kpisData.length !== 40) {
  throw new Error('Expected 40 KPIs, got ' + kpisData.length);
}