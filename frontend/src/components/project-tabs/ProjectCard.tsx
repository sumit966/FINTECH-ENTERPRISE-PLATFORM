import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';
import StatusBadge from '../ui/StatusBadge';
import type { ProjectListItem } from '../../services/projectService';

function formatINR(v: number): string {
  if (v >= 10000000) return '\u20B9' + (v / 10000000).toFixed(2) + ' Cr';
  if (v >= 100000) return '\u20B9' + (v / 100000).toFixed(2) + ' L';
  return '\u20B9' + v.toLocaleString('en-IN');
}

const STATUS_STYLE: Record<string, { border: string; tint: string; dot: string }> = {
  ACTIVE:      { border: 'border-l-emerald-500', tint: 'bg-emerald-500/[0.04]', dot: 'bg-emerald-500' },
  DELIVERED:   { border: 'border-l-emerald-500', tint: 'bg-emerald-500/[0.04]', dot: 'bg-emerald-500' },
  PLANNING:    { border: 'border-l-sky-500',     tint: 'bg-sky-500/[0.04]',     dot: 'bg-sky-500'     },
  QA:          { border: 'border-l-sky-500',     tint: 'bg-sky-500/[0.04]',     dot: 'bg-sky-500'     },
  DEPLOYMENT:  { border: 'border-l-sky-500',     tint: 'bg-sky-500/[0.04]',     dot: 'bg-sky-500'     },
  PENDING:     { border: 'border-l-amber-500',   tint: 'bg-amber-500/[0.04]',   dot: 'bg-amber-500'   },
  ON_HOLD:     { border: 'border-l-amber-500',   tint: 'bg-amber-500/[0.04]',   dot: 'bg-amber-500'   },
  CLOSED:      { border: 'border-l-slate-400',   tint: '',                      dot: 'bg-slate-400'   },
  MAINTENANCE: { border: 'border-l-slate-400',   tint: '',                      dot: 'bg-slate-400'   },
};

const PROJECT_TYPE_TONE: Record<string, 'brand' | 'success' | 'warn' | 'danger' | 'info' | 'neutral'> = {
  FINANCE: 'success',
  HEALTHCARE: 'danger',
  RETAIL: 'info',
  INTERNAL: 'warn',
  GENERAL: 'neutral',
};

export default function ProjectCard({ project }: { project: ProjectListItem }) {
  const navigate = useNavigate();
  const p = project;
  const style = STATUS_STYLE[p.status] || { border: 'border-l-slate-400', tint: '', dot: 'bg-slate-400' };

  const healthTone =
    p.healthScore == null ? 'text-slate-400'
    : p.healthScore >= 4.2 ? 'text-emerald-500'
    : p.healthScore >= 3.5 ? 'text-amber-500'
    : 'text-rose-500';

  return (
    <Card
      padded={false}
      interactive
      className={`card-hover h-full flex flex-col cursor-pointer border-l-4 ${style.border} ${style.tint}`}
    >
      <button
        type="button"
        onClick={() => navigate('/projects/' + encodeURIComponent(p.projectCode))}
        className="text-left w-full h-full p-4 flex flex-col gap-3"
      >
        {/* Header row: code + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><span className={`inline-block w-1.5 h-1.5 rounded-full ${style.dot}`} />{p.projectCode}</div>
            <div className="font-medium text-sm truncate">{p.name}</div>
          </div>
          <StatusBadge status={p.status} />
        </div>

        {/* Client + industry */}
        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {p.clientName}{p.clientCountry ? ' \u00B7 ' + p.clientCountry : ''}
        </div>

        {/* Type + risk */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={PROJECT_TYPE_TONE[p.projectType] || 'neutral'}>{p.projectType}</Badge>
          {p.riskScore != null && (
            <span className="text-[11px] text-slate-500">Risk {p.riskScore.toFixed(1)}</span>
          )}
        </div>

        {/* Progress */}
        {p.progressPercent != null && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div className="h-full bg-brand-500" style={{ width: p.progressPercent + '%' }} />
            </div>
            <span className="text-[11px] text-slate-500 w-9 text-right">{p.progressPercent}%</span>
          </div>
        )}

        {/* Metrics row */}
        <div className="grid grid-cols-2 gap-2 mt-auto pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-slate-400">Budget</div>
            <div className="text-xs font-medium">{formatINR(p.budget ?? 0)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-slate-400">Revenue</div>
            <div className="text-xs font-medium">{formatINR(p.revenue ?? 0)}</div>
          </div>
        </div>

        {/* Health + updated */}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">
            Health <span className={'font-medium ' + healthTone}>{p.healthScore != null ? p.healthScore.toFixed(2) : '\u2014'}</span>
          </span>
          {p.industry && <span className="text-slate-400 truncate">{p.industry}</span>}
        </div>
      </button>
    </Card>
  );
}
