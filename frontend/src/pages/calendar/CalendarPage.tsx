import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, MapPin, X } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Kpi from '../../components/ui/Kpi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { calendarService, CalendarEvent, CalendarSummary } from '../../services/calendarService';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function fmtTime(d: string): string {
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function CalendarPage() {
  const [params, setParams] = useSearchParams();
  const today = new Date();
  const yearFromUrl = params.get('year') ? Number(params.get('year')) : today.getFullYear();
  const monthFromUrl = params.get('month') ? Number(params.get('month')) : today.getMonth();
  const [year, setYear] = useState(yearFromUrl);
  const [month, setMonth] = useState(monthFromUrl);

  const [summary, setSummary] = useState<CalendarSummary | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEvent, setOpenEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => { setYear(yearFromUrl); }, [yearFromUrl]);
  useEffect(() => { setMonth(monthFromUrl); }, [monthFromUrl]);

  useEffect(() => {
    calendarService.summary().then(setSummary).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);

    // Compute the month range and pass as from/to
    const start = new Date(year, month, 1, 0, 0, 0, 0);
    const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
    calendarService.list({ from: start.toISOString(), to: end.toISOString() })
      .then((r) => { if (!cancelled) setEvents(r); })
      .catch((e) => { if (!cancelled) setError(e?.message || 'Failed to load events'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [year, month]);

  const setYm = (y: number, m: number) => {
    const np = new URLSearchParams(params);
    if (y === today.getFullYear()) np.delete('year'); else np.set('year', String(y));
    if (m === today.getMonth()) np.delete('month'); else np.set('month', String(m));
    setParams(np, { replace: true });
  };

  const prevMonth = () => { const d = new Date(year, month - 1, 1); setYm(d.getFullYear(), d.getMonth()); };
  const nextMonth = () => { const d = new Date(year, month + 1, 1); setYm(d.getFullYear(), d.getMonth()); };

  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d));
  while (grid.length % 7 !== 0) grid.push(null);

  const eventsForDay = (d: Date) => events.filter((e) => sameDay(new Date(e.startAt), d));

  const upcomingCount = summary?.upcoming.length || 0;
  const topCat = summary?.byCategory[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Company events and interviews &middot; click an event for details
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi label="Total Events" value={summary.total} hint={summary.byCategory.length + ' categories'}
            icon={<CalIcon size={18} />} accent="brand" />
          <Kpi label="Upcoming" value={upcomingCount} hint="Scheduled ahead"
            icon={<Clock size={18} />} accent="violet" />
          <Kpi label="This Month" value={events.length} hint={MONTHS[month] + ' ' + year}
            icon={<CalIcon size={18} />} accent="teal" />
          <Kpi label="Top Category" value={topCat?.count || 0} hint={topCat?.category || '\u2014'}
            accent="amber" />
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={prevMonth}><ChevronLeft size={14} /></Button>
            <div className="text-lg font-semibold tracking-tight min-w-[160px] text-center">{MONTHS[month]} {year}</div>
            <Button variant="ghost" size="sm" onClick={nextMonth}><ChevronRight size={14} /></Button>
            <Button variant="ghost" size="sm" onClick={() => setYm(today.getFullYear(), today.getMonth())}>Today</Button>
          </div>
          <div className="text-xs text-slate-500">{events.length} events this month</div>
        </div>

        {error ? <ErrorState message={error} /> :
         loading ? <SkeletonTable rows={5} /> :
         events.length === 0 ? (
          <EmptyState title="No events this month" description="Try navigating to a different month." />
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((w) => <div key={w} className="text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500 py-1">{w}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {grid.map((d, i) => {
                if (!d) return <div key={i} className="min-h-[90px] rounded-md bg-slate-50/40 dark:bg-slate-900/20" />;
                const dayEvents = eventsForDay(d);
                const isToday = sameDay(d, today);
                return (
                  <div key={i} className={'min-h-[90px] rounded-md border p-1.5 ' + (isToday ? 'border-brand-500 bg-brand-500/5' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900')}>
                    <div className={'text-[11px] font-medium mb-1 ' + (isToday ? 'text-brand-500' : 'text-slate-500')}>{d.getDate()}</div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((e) => (
                        <button
                          key={e.id}
                          onClick={() => setOpenEvent(e)}
                          className="block w-full text-left text-[10px] px-1 py-0.5 rounded bg-brand-500/10 text-brand-700 dark:text-brand-300 truncate hover:bg-brand-500/20 transition"
                          title={e.title}
                        >
                          {!e.allDay && fmtTime(e.startAt) + ' '}{e.title}
                        </button>
                      ))}
                      {dayEvents.length > 3 && <div className="text-[9px] text-slate-500 px-1">+ {dayEvents.length - 3} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {openEvent && (
        <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpenEvent(null)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-slate-900 shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="font-medium text-sm">Event</div>
              <button onClick={() => setOpenEvent(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge tone="brand">{openEvent.category}</Badge>
                {openEvent.allDay && <Badge tone="neutral">All day</Badge>}
              </div>
              <div className="text-lg font-semibold">{openEvent.title}</div>
              {openEvent.description && <div className="text-slate-600 dark:text-slate-300">{openEvent.description}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">Start</div>
                  <div>{fmtDate(openEvent.startAt)}{!openEvent.allDay && ' ' + fmtTime(openEvent.startAt)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">End</div>
                  <div>{fmtDate(openEvent.endAt)}{!openEvent.allDay && ' ' + fmtTime(openEvent.endAt)}</div>
                </div>
                {openEvent.location && (
                  <div className="col-span-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-1"><MapPin size={11} /> Location</div>
                    <div>{openEvent.location}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
