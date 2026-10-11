import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Calendar, ArrowUpRight } from 'lucide-react';
import Badge from '../ui/Badge';
import StatusBadge from '../ui/StatusBadge';
import type { EmployeeListItem } from '../../services/employeeService';

const AVATAR_TONE = [
  'from-brand-500/25 to-brand-500/5 text-brand-700 dark:text-brand-200',
  'from-violet-500/25 to-violet-500/5 text-violet-700 dark:text-violet-200',
  'from-emerald-500/25 to-emerald-500/5 text-emerald-700 dark:text-emerald-200',
  'from-amber-500/25 to-amber-500/5 text-amber-700 dark:text-amber-200',
  'from-teal-500/25 to-teal-500/5 text-teal-700 dark:text-teal-200',
];

function initials(name: string): string {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

function pickTone(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_TONE[h % AVATAR_TONE.length];
}

function fmtDate(d: string | Date): string {
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function EmployeeCard({ employee }: { employee: EmployeeListItem }) {
  const tone = pickTone(employee.employeeCode);

  return (
    <Link
      to={'/employees/' + employee.id}
      className="group block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-all duration-200 hover:shadow-premium hover:-translate-y-0.5 hover:border-brand-500/40"
    >
      <div className="flex items-start gap-3">
        <div className={'h-12 w-12 rounded-full grid place-items-center text-sm font-semibold bg-gradient-to-br shrink-0 ' + tone}>
          {initials(employee.fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-medium text-sm truncate group-hover:text-brand-500 transition-colors">
                {employee.fullName}
              </div>
              <div className="text-[11px] font-mono text-slate-500 truncate">{employee.employeeCode}</div>
            </div>
            <ArrowUpRight size={14} className="text-slate-300 dark:text-slate-700 group-hover:text-brand-500 transition-colors shrink-0" />
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge tone="brand">{employee.designation}</Badge>
            <StatusBadge status={employee.employmentStatus} />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2 truncate">
          <Mail size={12} className="text-slate-400 shrink-0" />
          <span className="truncate">{employee.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone size={12} className="text-slate-400 shrink-0" />
          <span>{employee.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-slate-400 shrink-0" />
          <span>{employee.locationCity}</span>
          {employee.departmentName && <span className="text-slate-400">· {employee.departmentName}</span>}
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={12} className="text-slate-400 shrink-0" />
          <span>Joined {fmtDate(employee.joiningDate)}</span>
        </div>
      </div>
    </Link>
  );
}