import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { calendarService, CalendarEvent, CalendarSummary } from '../../services/calendarService';

const CATEGORY_TONE: Record<string, 'brand' | 'success' | 'info' | 'warn' | 'neutral' | 'danger'> = {
  HOLIDAY: 'success',
  MEETING: 'brand',
  INTERVIEW: 'info',
  MILESTONE: 'info',
  RELEASE: 'warn',
  TRAINING: 'brand',
  REVIEW: 'warn',
  PAYROLL: 'neutral',
  LEAVE: 'neutral',
  CLIENT: 'info',
};

const CATEGORY_COLOR: Record<string, string> = {
  HOLIDAY: '#10b981',
  MEETING: '#3358ff',
  INTERVIEW: '#06b6d4',
  MILESTONE: '#8b5cf6',
  RELEASE: '#f59e0b',
  TRAINING: '#3358ff',
  REVIEW: '#f59e0b',
  PAYROLL: '#64748b',
  LEAVE: '#64748b',
  CLIENT: '#06b6d4',
};

function ymd(d: Date): string {
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
}

export default function CalendarPage() {
  const [summary, setSummary] = useState<CalendarSummary | null>(null);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>(ymd(new Date()));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { calendarService.summary().then(setSummary).catch(() => {}); }, []);

  // Build month range
  const { first, last, days } = useMemo(() => {
    const first = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth(), 1));
    const last = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0));
    const days: Date[] = [];
    // Start from the previous Monday to fill the leading grid
    const startOffset = (first.getUTCDay() + 6) % 7;
    const gridStart = new Date(first.getTime() - startOffset * 24 * 3600 * 1000);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(gridStart.getTime() + i * 24 * 3600 * 1000));
    }
    return { first, last, days };
  }, [cursor]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    calendarService.list({ from: first.toISOString(), to: new Date(last.getTime() + 24 * 3600 * 1000).toISOString() })
      .then((r) => { if (!cancelled) setEvents(r); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load calendar'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [first.toISOString(), last.toISOString()]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      const key = e.startAt.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    return map;
  }, [events]);

  const selectedEvents = eventsByDay[selectedDay] || [];

  if (loading && events.length === 0) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <ErrorState message={error} onRetry={() => setCursor(new Date(cursor))} />;

  const todayKey = ymd(new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company Calendar</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Holidays, meetings, milestones, releases &middot; live from PostgreSQL
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Events" value={summary.total} hint={summary.byCategory.length + ' categories'} />
          <StatCard label="Holidays" value={summary.byCategory.find((c) => c.category === 'HOLIDAY')?.count || 0} hint="Public holidays" />
          <StatCard label="Upcoming" value={summary.upcoming.length} hint="Next 10 events" />
          <StatCard label="Releases" value={summary.byCategory.find((c) => c.category === 'RELEASE')?.count || 0} hint="Scheduled" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-semibold">
              {cursor.toLocaleString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCursor(new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() - 1, 1)))} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => { const d = new Date(); setCursor(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))); }} className="text-xs px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                Today
              </button>
              <button onClick={() => setCursor(new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1)))} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-[10px] uppercase tracking-wider text-slate-500 text-center">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => <div key={d}>{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((d, i) => {
              const key = ymd(d);
              const inMonth = d.getUTCMonth() === cursor.getUTCMonth();
              const dayEvents = eventsByDay[key] || [];
              const isToday = key === todayKey;
              const isSelected = key === selectedDay;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(key)}
                  className={'h-24 rounded-md border p-1.5 text-left transition ' +
                    (isSelected ? 'border-brand-500 ring-1 ring-brand-500/40 ' : 'border-slate-200 dark:border-slate-800 ') +
                    (inMonth ? '' : 'opacity-40 ') +
                    'hover:border-slate-400 dark:hover:border-slate-600'}
                >
                  <div className={'text-xs font-medium mb-1 ' + (isToday ? 'text-brand-500' : '')}>{d.getUTCDate()}</div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div key={e.id} className="flex items-center gap-1 text-[9px] leading-tight truncate">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLOR[e.category] || '#64748b' }} />
                        <span className="truncate">{e.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 3 && <div className="text-[9px] text-slate-500">+ {dayEvents.length - 3} more</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader
            title={new Date(selectedDay + 'T00:00:00Z').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
            subtitle={selectedEvents.length + ' events'}
          />
          {selectedEvents.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-8">
              <CalendarIcon size={24} className="mx-auto text-slate-400 mb-2" />
              No events on this day.
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((e) => (
                <div key={e.id} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: CATEGORY_COLOR[e.category] || '#64748b' }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{e.title}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge tone={CATEGORY_TONE[e.category] || 'neutral'}>{e.category}</Badge>
                        {!e.allDay && (
                          <span className="text-[11px] text-slate-500">
                            {new Date(e.startAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {e.allDay && <span className="text-[11px] text-slate-500">All day</span>}
                      </div>
                      {e.description && <div className="text-xs text-slate-500 mt-1">{e.description}</div>}
                      {e.location && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                          <MapPin size={11} /> {e.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}