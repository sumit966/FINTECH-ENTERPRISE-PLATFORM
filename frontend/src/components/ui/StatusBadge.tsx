import Badge from './Badge';

const TONE_FOR: Record<string, any> = {
  // Project statuses
  ACTIVE: 'success',
  PLANNING: 'info',
  PENDING: 'warn',
  ON_HOLD: 'warn',
  QA: 'info',
  DEPLOYMENT: 'info',
  DELIVERED: 'success',
  MAINTENANCE: 'neutral',
  CLOSED: 'neutral',
  // Payroll
  PAID: 'success',
  PROCESSING: 'info',
  FAILED: 'danger',
  // Leave
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
  // Severity
  CRITICAL: 'danger',
  HIGH: 'danger',
  MEDIUM: 'warn',
  LOW: 'neutral',
  // Security
  OPEN: 'warn',
  INVESTIGATING: 'info',
  RESOLVED: 'success',
  // SLA
  PLATINUM: 'brand',
  GOLD: 'warn',
  SILVER: 'neutral',
};

export default function StatusBadge({ status }: { status: string }) {
  const tone = TONE_FOR[status] || 'neutral';
  return <Badge tone={tone}>{status.replace(/_/g, ' ')}</Badge>;
}