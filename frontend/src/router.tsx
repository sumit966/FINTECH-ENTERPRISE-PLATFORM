import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthContext } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

// Command
import FounderCommandCenter from './pages/founder/FounderCommandCenter';
import ExecutiveDashboard from './pages/executive/ExecutiveDashboard';
import PulseIntelligence from './pages/pulse/PulseIntelligence';
import AICommandCenter from './pages/ai/AICommandCenter';

// People
import EmployeesPage from './pages/hr/EmployeesPage';
import EmployeeProfilePage from './pages/hr/EmployeeProfilePage';
import OrgChartPage from './pages/hr/OrgChartPage';
import AttendancePage from './pages/hr/AttendancePage';
import LeavePage from './pages/hr/LeavePage';
import PayrollPage from './pages/hr/PayrollPage';

// Revenue
import ClientsPage from './pages/clients/ClientsPage';
import ClientDetailPage from './pages/clients/ClientDetailPage';
import ProjectsPage from './pages/projects/ProjectsPage';
import ProjectDetailPage from './pages/projects/ProjectDetailPage';
import FinancePage from './pages/finance/FinancePage';

// Operations
import RecruitmentPage from './pages/recruitment/RecruitmentPage';
import CandidateDetailPage from './pages/recruitment/CandidateDetailPage';
import ExamsPage from './pages/exams/ExamsPage';
import AssessmentDetailPage from './pages/exams/AssessmentDetailPage';
import AssetsPage from './pages/assets/AssetsPage';
import LicensesPage from './pages/assets/LicensesPage';
import VendorsPage from './pages/vendors/VendorsPage';

// Engineering
import EngineeringPage from './pages/engineering/EngineeringPage';
import RepositoryDetailPage from './pages/engineering/RepositoryDetailPage';
import CloudPage from './pages/cloud/CloudPage';
import SecurityCenter from './pages/security/SecurityCenter';

// Workspace
import CalendarPage from './pages/calendar/CalendarPage';
import DocumentsPage from './pages/documents/DocumentsPage';
import KnowledgePage from './pages/knowledge/KnowledgePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import AuditPage from './pages/audit/AuditPage';
import SettingsPage from './pages/settings/SettingsPage';

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
        {/* Command */}
        <Route index element={<FounderCommandCenter />} />
        <Route path="executive"      element={<ExecutiveDashboard />} />
        <Route path="pulse"          element={<PulseIntelligence />} />
        <Route path="ai"             element={<AICommandCenter />} />

        {/* People */}
        <Route path="employees"      element={<EmployeesPage />} />
        <Route path="employees/:id"  element={<EmployeeProfilePage />} />
        <Route path="org"            element={<OrgChartPage />} />
        <Route path="attendance"     element={<AttendancePage />} />
        <Route path="leave"          element={<LeavePage />} />
        <Route path="payroll"        element={<PayrollPage />} />

        {/* Revenue */}
        <Route path="clients"        element={<ClientsPage />} />
        <Route path="clients/:code"  element={<ClientDetailPage />} />
        <Route path="projects"       element={<ProjectsPage />} />
        <Route path="projects/:code" element={<ProjectDetailPage />} />
        <Route path="finance"        element={<FinancePage />} />

        {/* Operations */}
        <Route path="recruitment"    element={<RecruitmentPage />} />
        <Route path="recruitment/candidates/:code" element={<CandidateDetailPage />} />
        <Route path="exams"          element={<ExamsPage />} />
        <Route path="exams/assessments/:code" element={<AssessmentDetailPage />} />
        <Route path="assets"         element={<AssetsPage />} />
        <Route path="licenses"       element={<LicensesPage />} />
        <Route path="procurement"    element={<VendorsPage />} />

        {/* Engineering */}
        <Route path="engineering"    element={<EngineeringPage />} />
        <Route path="engineering/repos/:code" element={<RepositoryDetailPage />} />
        <Route path="cloud"          element={<CloudPage />} />
        <Route path="security"       element={<SecurityCenter />} />

        {/* Workspace */}
        <Route path="calendar"       element={<CalendarPage />} />
        <Route path="documents"      element={<DocumentsPage />} />
        <Route path="knowledge"      element={<KnowledgePage />} />
        <Route path="notifications"  element={<NotificationsPage />} />
        <Route path="audit"          element={<AuditPage />} />
        <Route path="settings"       element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}