import { FormEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { ShieldCheck } from 'lucide-react';

interface DemoAccount {
  label: string;
  email: string;
  role: string;
  tone: 'brand' | 'success' | 'warn' | 'info' | 'neutral';
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { label: 'Founder & CEO',     email: 'founder@fintechitsolutions.in',      role: 'FOUNDER_CEO',        tone: 'brand' },
  { label: 'Director',          email: 'director@fintechitsolutions.in',     role: 'DIRECTOR',           tone: 'brand' },
  { label: 'HR Head',           email: 'hr.head@fintechitsolutions.in',      role: 'DEPT_HEAD',          tone: 'success' },
  { label: 'Finance Manager',   email: 'finance.head@fintechitsolutions.in', role: 'FINANCE_MANAGER',    tone: 'success' },
  { label: 'Engineering Head',  email: 'eng.head@fintechitsolutions.in',     role: 'ENGINEERING_MANAGER',tone: 'success' },
  { label: 'Manager',           email: 'manager@fintechitsolutions.in',      role: 'MANAGER',            tone: 'info' },
  { label: 'Team Lead',         email: 'lead@fintechitsolutions.in',         role: 'TEAM_LEAD',          tone: 'info' },
  { label: 'Recruiter',         email: 'recruiter@fintechitsolutions.in',    role: 'RECRUITER',          tone: 'info' },
  { label: 'Engineer',          email: 'engineer@fintechitsolutions.in',     role: 'ENGINEER',           tone: 'neutral' },
  { label: 'QA Engineer',       email: 'qa@fintechitsolutions.in',           role: 'QA',                 tone: 'neutral' },
  { label: 'Employee',          email: 'employee@fintechitsolutions.in',     role: 'EMPLOYEE',           tone: 'neutral' },
  { label: 'Auditor',           email: 'auditor@fintechitsolutions.in',      role: 'AUDITOR',            tone: 'warn' },
];

const DEMO_PASSWORD = 'Nexus@2024!';

export default function LoginPage() {
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };

  const [email, setEmail] = useState('founder@fintechitsolutions.in');
  const [password, setPassword] = useState(DEMO_PASSWORD);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email.trim(), password);
      const target = location.state?.from?.pathname || '/';
      navigate(target, { replace: true });
    } catch {
      // error is surfaced by AuthContext
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-md bg-brand-500 grid place-items-center text-white font-bold">N</div>
          <div>
            <div className="text-lg font-semibold leading-tight">Nexus Enterprise Platform</div>
            <div className="text-xs text-slate-400">FINTECH IT SOLUTIONS</div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <Input
            label="Work email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@fintechitsolutions.in"
            autoComplete="username"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
            autoComplete="current-password"
            required
          />
          {error && (
            <div className="rounded-md border border-rose-500/40 bg-rose-500/10 p-2 text-xs text-rose-200">
              {error}
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full">
            Sign in
          </Button>
        </form>

        <div className="mt-5 border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <ShieldCheck size={14} /> Demo accounts
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            All demo accounts use the password <span className="text-slate-300 font-mono">{DEMO_PASSWORD}</span>
          </p>
          <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-1">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => { setEmail(a.email); setPassword(DEMO_PASSWORD); }}
                className="text-left rounded-md border border-slate-800 hover:border-slate-600 hover:bg-slate-800/50 p-2 transition"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] font-medium text-slate-200">{a.label}</span>
                  <Badge tone={a.tone}>{a.role}</Badge>
                </div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">{a.email}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}