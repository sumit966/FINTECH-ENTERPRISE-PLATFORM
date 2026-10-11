import { useEffect, useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useNotifications } from '../../context/NotificationContext';
import { employeeService, CreateEmployeeInput, EmployeeStats } from '../../services/employeeService';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  stats: EmployeeStats | null;
}

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'CONSULTANT'] as const;
const EMPLOYMENT_STATUSES = ['ACTIVE', 'PROBATION', 'ON_LEAVE', 'NOTICE_PERIOD'] as const;
const GRADES = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8'];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddEmployeeModal({ open, onClose, onCreated, stats }: Props) {
  const { push } = useNotifications();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCode, setNextCode] = useState<string>('');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | 'UNDISCLOSED'>('MALE');
  const [email, setEmail] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1995-01-01');
  const [joiningDate, setJoiningDate] = useState(todayISO());
  const [employmentType, setEmploymentType] = useState<typeof EMPLOYMENT_TYPES[number]>('FULL_TIME');
  const [employmentStatus, setEmploymentStatus] = useState<typeof EMPLOYMENT_STATUSES[number]>('ACTIVE');
  const [experienceYears, setExperienceYears] = useState(3);
  const [salaryGrade, setSalaryGrade] = useState('L4');
  const [basicSalary, setBasicSalary] = useState(70000);
  const [locationCode, setLocationCode] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [managerCode, setManagerCode] = useState('');
  const [skillsText, setSkillsText] = useState('');

  useEffect(() => {
    if (!open) return;
    setError(null);
    employeeService.nextCode().then((r) => setNextCode(r.employeeCode)).catch(() => setNextCode(''));
    if (stats && !locationCode) setLocationCode(stats.byLocation[0]?.code || '');
    if (stats && !departmentCode) {
      const firstNonZero = stats.byDepartment.find((d) => d.count > 0);
      setDepartmentCode(firstNonZero?.code || stats.byDepartment[0]?.code || '');
    }
  }, [open, stats]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const input: CreateEmployeeInput = {
        fullName: fullName.trim(),
        gender,
        email: email.trim(),
        personalEmail: personalEmail.trim() || undefined,
        phone: phone.trim(),
        dateOfBirth,
        joiningDate,
        employmentType,
        employmentStatus,
        experienceYears,
        salaryGrade,
        basicSalary,
        locationCode,
        departmentCode,
        teamCode: teamCode || undefined,
        managerCode: managerCode || undefined,
        skills: skillsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const created = await employeeService.create(input);
      push({ variant: 'success', title: 'Employee created', body: created.employeeCode + ' — ' + created.fullName });
      onCreated();
      onClose();
      // Reset form
      setFullName(''); setEmail(''); setPersonalEmail(''); setPhone(''); setSkillsText('');
    } catch (e: any) {
      setError(e?.message || 'Failed to create employee');
      push({ variant: 'error', title: 'Creation failed', body: e?.message || 'Unknown error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-500/10 grid place-items-center">
              <UserPlus size={20} className="text-brand-500" />
            </div>
            <div>
              <div className="font-semibold">Add Employee</div>
              <div className="text-xs text-slate-500">
                {nextCode && <>Will be assigned <span className="font-mono">{nextCode}</span></>}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={submit} className="p-6 space-y-6">
          {/* Section 1: Personal */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Full Name *" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Gender *</label>
                <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="UNDISCLOSED">Prefer not to say</option>
                </select>
              </div>
              <Input label="Work Email *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name.surname@fintechitsolutions.in" required />
              <Input label="Personal Email" type="email" value={personalEmail} onChange={(e) => setPersonalEmail(e.target.value)} placeholder="name@gmail.in" />
              <Input label="Phone *" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91-9800000000" required />
              <Input label="Date of Birth *" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} required />
            </div>
          </div>

          {/* Section 2: Employment */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">Employment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Joining Date *" type="date" value={joiningDate} onChange={(e) => setJoiningDate(e.target.value)} required />
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Employment Type *</label>
                <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as any)} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
                  {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Status *</label>
                <select value={employmentStatus} onChange={(e) => setEmploymentStatus(e.target.value as any)} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
                  {EMPLOYMENT_STATUSES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <Input label="Years of Experience *" type="number" value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} min={0} max={60} required />
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Location *</label>
                <select value={locationCode} onChange={(e) => setLocationCode(e.target.value)} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" required>
                  <option value="">Select location</option>
                  {stats?.byLocation.map((l) => <option key={l.code} value={l.code}>{l.city} ({l.count})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Department *</label>
                <select value={departmentCode} onChange={(e) => setDepartmentCode(e.target.value)} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm" required>
                  <option value="">Select department</option>
                  {stats?.byDepartment.map((d) => <option key={d.code} value={d.code}>{d.name} ({d.count})</option>)}
                </select>
              </div>
              <Input label="Team Code (optional)" value={teamCode} onChange={(e) => setTeamCode(e.target.value)} placeholder="e.g. TEAM-PAY" />
              <Input label="Manager Employee Code (optional)" value={managerCode} onChange={(e) => setManagerCode(e.target.value)} placeholder="e.g. FITS-0001" />
            </div>
          </div>

          {/* Section 3: Compensation */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">Compensation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Salary Grade *</label>
                <select value={salaryGrade} onChange={(e) => setSalaryGrade(e.target.value)} className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm">
                  {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <Input label="Basic Monthly Salary (INR) *" type="number" value={basicSalary} onChange={(e) => setBasicSalary(Number(e.target.value))} min={0} required />
            </div>
            <div className="mt-3 text-xs text-slate-500 rounded-md bg-slate-50 dark:bg-slate-900/60 p-3">
              <div className="font-medium text-slate-600 dark:text-slate-300 mb-1">Computed at submission:</div>
              HRA 40% · Allowances 15% · Bonus 10% · Deductions 12% of gross
            </div>
          </div>

          {/* Section 4: Skills */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-3">Skills</h3>
            <Input label="Skills (comma separated)" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="React, TypeScript, PostgreSQL" />
          </div>

          {error && (
            <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create Employee</Button>
          </div>
        </form>
      </div>
    </div>
  );
}