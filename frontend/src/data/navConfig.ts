import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Users, Network, CalendarCheck, Plane, Wallet, Landmark,
  FolderKanban, Handshake, ShoppingCart, Package, UserPlus, GraduationCap,
  Code2, Cloud, ShieldCheck, Sparkles, Activity, FileText, BookOpen,
  Bell, Calendar, ScrollText, Settings,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  permission?: string;
  roles?: string[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navConfig: NavSection[] = [
  {
    title: 'Command',
    items: [
      { label: 'Founder Command',  path: '/',              icon: LayoutDashboard },
      { label: 'Executive',        path: '/executive',     icon: Activity },
      { label: 'Pulse Intelligence', path: '/pulse',       icon: Sparkles },
      { label: 'AI Command',       path: '/ai',            icon: Sparkles },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'Employees',        path: '/employees',     icon: Users,           permission: 'employees.read' },
      { label: 'Organization',     path: '/org',           icon: Network,         permission: 'employees.read' },
      { label: 'Attendance',       path: '/attendance',    icon: CalendarCheck,   permission: 'attendance.read' },
      { label: 'Leave',            path: '/leave',         icon: Plane,           permission: 'leave.read' },
      { label: 'Payroll',          path: '/payroll',       icon: Wallet,          permission: 'payroll.read' },
    ],
  },
  {
    title: 'Revenue',
    items: [
      { label: 'Clients',          path: '/clients',       icon: Handshake,       permission: 'clients.read' },
      { label: 'Projects',         path: '/projects',      icon: FolderKanban,    permission: 'projects.read' },
      { label: 'Finance',          path: '/finance',       icon: Landmark,        permission: 'finance.read' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Recruitment',      path: '/recruitment',   icon: UserPlus,        permission: 'recruitment.read' },
      { label: 'Exams',            path: '/exams',         icon: GraduationCap,   permission: 'exams.read' },
      { label: 'Assets',           path: '/assets',        icon: Package,         permission: 'assets.read' },
      { label: 'Procurement',      path: '/procurement',   icon: ShoppingCart,    permission: 'vendors.read' },
    ],
  },
  {
    title: 'Engineering',
    items: [
      { label: 'Engineering',      path: '/engineering',   icon: Code2,           permission: 'engineering.read' },
      { label: 'Cloud',            path: '/cloud',         icon: Cloud,           permission: 'engineering.read' },
      { label: 'Security',         path: '/security',      icon: ShieldCheck,     permission: 'security.read' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { label: 'Calendar',         path: '/calendar',      icon: Calendar },
      { label: 'Documents',        path: '/documents',     icon: FileText,        permission: 'documents.read' },
      { label: 'Knowledge',        path: '/knowledge',     icon: BookOpen,        permission: 'knowledge.read' },
      { label: 'Notifications',    path: '/notifications', icon: Bell },
      { label: 'Audit',            path: '/audit',         icon: ScrollText,      permission: 'audit.read' },
      { label: 'Settings',         path: '/settings',      icon: Settings,        permission: 'settings.read' },
    ],
  },
];