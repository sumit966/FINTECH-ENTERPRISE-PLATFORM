import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Award, Users } from 'lucide-react';
import { Card, CardHeader, StatCard } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatusBadge from '../../components/ui/StatusBadge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import ErrorState from '../../components/ui/ErrorState';
import { employeeService, EmployeeDetail } from '../../services/employeeService';

function formatINR(v: number): string {
  return '\u20B9' + v.toLocaleString('en-IN');
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setEmployee(await employeeService.detail(id));
    } catch (e: any) {
      setError(e?.message || 'Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!employee) return <ErrorState message="Employee not found" />;

  return (
    <div className="space-y-6">
      <Link to="/employees" className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200">
        <ArrowLeft size={14} /> Back to employees
      </Link>

      {/* Header card */}
      <Card>
        <div className="flex items-start gap-5 flex-wrap">
          <div className="h-20 w-20 rounded-full bg-brand-500 text-white grid place-items-center text-2xl font-semibold">
            {employee.fullName.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{employee.fullName}</h1>
            <div className="text-sm text-slate-500 mt-1">
              {employee.departmentName} &middot; {employee.teamName || 'No team'} &middot; {employee.designation}
            </div>
            <div className="flex items-center gap-3 mt-3 flex-wrap text-xs">
              <Badge tone="brand">{employee.employeeCode}</Badge>
              <StatusBadge status={employee.employmentStatus} />
              <span className="text-slate-500">{employee.employmentType.replace('_', ' ')}</span>
              <span className="text-slate-500">{employee.experienceYears} years experience</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 text-sm">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Mail size={14} /> <span className="truncate">{employee.email}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Phone size={14} /> {employee.phone}
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <MapPin size={14} /> {employee.location.city}
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Calendar size={14} /> Joined {formatDate(employee.joiningDate)}
          </div>
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Basic Salary" value={formatINR(employee.basicSalary)} hint="Monthly" />
        <StatCard label="Gross Salary" value={formatINR(employee.grossSalary)} hint="Before deductions" />
        <StatCard label="Net Salary" value={formatINR(employee.netSalary)} hint="Take-home" />
        <StatCard
          label="Performance"
          value={employee.performanceScore ? employee.performanceScore.toFixed(2) : '\u2014'}
          hint="Out of 5.00"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Reporting" subtitle="Manager, team lead, and direct reports" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Manager</span>
              <span className="font-medium">
                {employee.manager ? (
                  <Link to={'/employees/' + employee.manager.id} className="hover:text-brand-500">
                    {employee.manager.fullName}
                  </Link>
                ) : (
                  '\u2014'
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Team Lead</span>
              <span className="font-medium">
                {employee.teamLead ? (
                  <Link to={'/employees/' + employee.teamLead.id} className="hover:text-brand-500">
                    {employee.teamLead.fullName}
                  </Link>
                ) : (
                  '\u2014'
                )}
              </span>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="text-slate-500 mb-2 flex items-center gap-2">
                <Users size={14} /> Direct reports ({employee.reports.length})
              </div>
              {employee.reports.length === 0 ? (
                <div className="text-slate-400 text-xs">No direct reports</div>
              ) : (
                <div className="space-y-1.5">
                  {employee.reports.slice(0, 8).map((r) => (
                    <Link key={r.id} to={'/employees/' + r.id} className="block text-sm hover:text-brand-500">
                      {r.fullName} <span className="text-xs text-slate-500">({r.employeeCode})</span>
                    </Link>
                  ))}
                  {employee.reports.length > 8 && (
                    <div className="text-xs text-slate-500">+ {employee.reports.length - 8} more</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Compensation Breakdown" subtitle="Monthly gross and deductions" />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Basic</span><span>{formatINR(employee.basicSalary)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">HRA</span><span>{formatINR(employee.hra)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Allowances</span><span>{formatINR(employee.allowances)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Bonus</span><span>{formatINR(employee.bonus)}</span></div>
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <span className="font-medium">Gross</span><span className="font-medium">{formatINR(employee.grossSalary)}</span>
            </div>
            <div className="flex justify-between text-rose-500"><span>Deductions</span><span>-{formatINR(employee.deductions)}</span></div>
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-base font-semibold">
              <span>Net Salary</span><span>{formatINR(employee.netSalary)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Skills" subtitle={employee.skills.length + ' skills on record'} />
          {employee.skills.length === 0 ? (
            <div className="text-xs text-slate-500">No skills recorded</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {employee.skills.map((s) => (
                <span key={s.name} className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs">
                  {s.name}
                  <span className="text-slate-400">&middot; {s.proficiency}/5</span>
                </span>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Certifications" subtitle={employee.certifications.length + ' active'} />
          {employee.certifications.length === 0 ? (
            <div className="text-xs text-slate-500">No certifications recorded</div>
          ) : (
            <div className="space-y-2 text-sm">
              {employee.certifications.map((c) => (
                <div key={c.code} className="flex items-start gap-2">
                  <Award size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-slate-500">
                      {c.issuer} &middot; Issued {formatDate(c.issuedAt)}
                      {c.expiresAt && ' \u00B7 Expires ' + formatDate(c.expiresAt)}
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