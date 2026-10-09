import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import FounderCommandCenter from './pages/founder/FounderCommandCenter';

function Placeholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
      <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This module is coming online. The data layer is fully seeded — the UI is being assembled module by module.
        </p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-slate-500">Loading platform...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

export default function AppRouter() {
  const { user } = useAuthContext();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<FounderCommandCenter />} />
        <Route path="executive"      element={<Placeholder title="Executive Dashboard"    subtitle="Company and operational KPIs" />} />
        <Route path="employees"      element={<Placeholder title="Employees"              subtitle="Employee directory and profiles" />} />
        <Route path="org"            element={<Placeholder title="Organization"           subtitle="Org chart, departments, teams" />} />
        <Route path="attendance"     element={<Placeholder title="Attendance"             subtitle="Attendance and work-from-home tracking" />} />
        <Route path="leave"          element={<Placeholder title="Leave Management"       subtitle="Leave balances and approvals" />} />
        <Route path="payroll"        element={<Placeholder title="Payroll"                subtitle="24-month payroll history and processing" />} />
        <Route path="finance"        element={<Placeholder title="Finance / ERP"          subtitle="Invoices, expenses, P&L, budget" />} />
        <Route path="projects"       element={<Placeholder title="Projects"               subtitle="60 active and delivered projects" />} />
        <Route path="clients"        element={<Placeholder title="Clients / CRM"          subtitle="Client portfolio and contracts" />} />
        <Route path="procurement"    element={<Placeholder title="Procurement"            subtitle="Vendors and purchase orders" />} />
        <Route path="assets"         element={<Placeholder title="Assets"                 subtitle="Hardware and software inventory" />} />
        <Route path="recruitment"    element={<Placeholder title="Recruitment / ATS"      subtitle="Openings, candidates, interviews" />} />
        <Route path="exams"          element={<Placeholder title="Exams / Assessment"     subtitle="Question bank and candidate attempts" />} />
        <Route path="engineering"    element={<Placeholder title="Engineering"            subtitle="Repositories, builds, deployments" />} />
        <Route path="cloud"          element={<Placeholder title="Cloud"                  subtitle="AWS / Azure / GCP prototype view" />} />
        <Route path="security"       element={<Placeholder title="Security Center"        subtitle="Events, vulnerabilities, compliance" />} />
        <Route path="ai"             element={<Placeholder title="AI Command Center"      subtitle="Natural language over RBAC-scoped data" />} />
        <Route path="pulse"          element={<Placeholder title="Pulse Intelligence"     subtitle="Live KPI dashboard" />} />
        <Route path="documents"      element={<Placeholder title="Documents"              subtitle="Document management" />} />
        <Route path="knowledge"      element={<Placeholder title="Knowledge"              subtitle="Policies, SOPs, and articles" />} />
        <Route path="notifications"  element={<Placeholder title="Notifications"          subtitle="Your alerts and updates" />} />
        <Route path="calendar"       element={<Placeholder title="Company Calendar"       subtitle="Meetings, milestones, releases" />} />
        <Route path="audit"          element={<Placeholder title="Audit & Governance"     subtitle="Audit logs and compliance" />} />
        <Route path="settings"       element={<Placeholder title="Settings"               subtitle="System administration" />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}