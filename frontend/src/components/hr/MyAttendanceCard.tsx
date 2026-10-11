import { useEffect, useState } from 'react';
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { Card, CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import { api } from '../../services/api';

interface TodayAttendance {
  employeeCode: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number | null;
  status: string;
  source: string | null;
}

function fmtTime(iso: string | null): string {
  if (!iso) return '\u2014';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function fmtDuration(h: number | null): string {
  if (h == null) return '\u2014';
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return hh + 'h ' + mm + 'm';
}

export default function MyAttendanceCard() {
  const { user } = useAuth();
  const { push } = useNotifications();
  const [today, setToday] = useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const employeeCode = user?.employeeCode || 'FITS-0001';

  const load = () => {
    setLoading(true);
    setError(null);
    api.get<any>('/attendance/my-today', { employeeCode })
      .then((r) => setToday(r))
      .catch((e) => setError(e?.message || 'Failed to load today attendance'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [employeeCode]);

  const doCheckIn = async () => {
    setBusy(true);
    try {
      await api.post('/attendance/check-in', { employeeCode });
      push({ variant: 'success', title: 'Checked in', body: 'Welcome — have a productive day.' });
      load();
    } catch (e: any) {
      push({ variant: 'error', title: 'Check-in failed', body: e?.message || 'Unknown error' });
    } finally { setBusy(false); }
  };

  const doCheckOut = async () => {
    setBusy(true);
    try {
      await api.post('/attendance/check-out', { employeeCode });
      push({ variant: 'success', title: 'Checked out', body: 'Your working hours have been recorded.' });
      load();
    } catch (e: any) {
      push({ variant: 'error', title: 'Check-out failed', body: e?.message || 'Unknown error' });
    } finally { setBusy(false); }
  };

  const isCheckedIn = !!today?.checkIn;
  const isCheckedOut = !!today?.checkOut;
  const isNotMarked = !today?.checkIn;

  return (
    <Card>
      <CardHeader
        title="My Attendance"
        subtitle={'Today · ' + new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        action={<Badge tone="neutral"><User size={11} /> {employeeCode}</Badge>}
      />

      {error ? (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle size={14} className="inline mr-1" /> {error}
        </div>
      ) : loading ? (
        <div className="text-xs text-slate-500">Loading today's status…</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Check In</div>
              <div className="text-lg font-semibold mt-1">{fmtTime(today?.checkIn || null)}</div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Check Out</div>
              <div className="text-lg font-semibold mt-1">{fmtTime(today?.checkOut || null)}</div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 text-center">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">Hours</div>
              <div className="text-lg font-semibold mt-1">{fmtDuration(today?.workingHours || null)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {isNotMarked && (
              <Button variant="gradient" onClick={doCheckIn} disabled={busy} loading={busy}>
                <LogIn size={14} /> Check In
              </Button>
            )}
            {isCheckedIn && !isCheckedOut && (
              <Button variant="gradient" onClick={doCheckOut} disabled={busy} loading={busy}>
                <LogOut size={14} /> Check Out
              </Button>
            )}
            {isCheckedIn && isCheckedOut && (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
                <CheckCircle2 size={16} />
                <span className="font-medium">Attendance complete for today</span>
              </div>
            )}
            <span className="text-xs text-slate-500 ml-auto">
              Source: <strong>{today?.source || 'MANUAL'}</strong>
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
            <Clock size={11} className="inline mr-1" />
            Manual check-in / check-out uses server-side timestamps. Duplicate check-in is rejected. No biometric or face-recognition verification is active in this prototype.
          </div>
        </>
      )}
    </Card>
  );
}