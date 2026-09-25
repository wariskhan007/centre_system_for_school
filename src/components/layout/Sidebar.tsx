import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserMinus,
  ArrowRightLeft,
  GraduationCap,
  Layers,
  BookOpen,
  CalendarDays,
  TrendingUp,
  UserCheck,
  ClipboardList,
  Award,
  Receipt,
  FileQuestion,
  Sparkles,
  FileText,
  BarChart3,
  ShieldAlert,
  Settings,
  Database,
  X,
  IdCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavSection {
  title: string;
  items: {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const {
    currentView,
    setCurrentView,
    students,
    admissions,
    withdrawals,
    feeInvoices,
    currentUser,
    settings,
  } = useApp();

  const pendingAdmissions = admissions.filter((a) => a.stage === 'Application' || a.stage === 'Verification').length;
  const overdueFees = feeInvoices.filter((f) => f.status === 'Overdue').length;

  // Compute school initials e.g. "Splended Education System" -> "SES"
  const schoolName = settings?.name || 'Splended Education System';
  const schoolInitials = schoolName
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase() || 'SES';

  const navSections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'Students & Admissions',
      items: [
        { id: 'students', label: 'All Students', icon: Users, badge: students.length },
        { id: 'admissions', label: 'New Admissions', icon: UserPlus, badge: pendingAdmissions > 0 ? pendingAdmissions : undefined },
        { id: 'withdrawals', label: 'Withdrawals (SLC)', icon: UserMinus, badge: withdrawals.length > 0 ? withdrawals.length : undefined },
        { id: 'transfers', label: 'Transfers & Migration', icon: ArrowRightLeft },
      ],
    },
    {
      title: 'Academics & Faculty',
      items: [
        { id: 'classes', label: 'Classes & Sections', icon: Layers },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'academic-years', label: 'Academic Years', icon: CalendarDays },
        { id: 'promotion', label: 'Bulk Promotion', icon: TrendingUp },
        { id: 'staff', label: 'Staff Management', icon: GraduationCap },
      ],
    },
    {
      title: 'Daily Operations',
      items: [
        { id: 'attendance', label: 'Attendance System', icon: UserCheck },
        { id: 'exams', label: 'Exams & Schedules', icon: ClipboardList },
        { id: 'results', label: 'Results & Merit List', icon: Award },
        { id: 'fees', label: 'Fee Management', icon: Receipt, badge: overdueFees > 0 ? `${overdueFees} due` : undefined },
      ],
    },
    {
      title: 'Examination Builder',
      items: [
        { id: 'question-bank', label: 'Question Bank', icon: FileQuestion },
        { id: 'paper-generator', label: 'Paper Generator', icon: Sparkles },
      ],
    },
    {
      title: 'Documents & Cards',
      items: [
        { id: 'documents', label: 'Certificates & ID Cards', icon: IdCard },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Administration',
      items: [
        { id: 'users', label: 'Users & RBAC', icon: ShieldAlert },
        { id: 'audit-logs', label: 'Audit Logs', icon: ClipboardList },
        { id: 'settings', label: 'School Settings', icon: Settings },
        { id: 'backup', label: 'Backup & Data Store', icon: Database },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col z-50 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-md border border-emerald-500/30 flex-shrink-0 tracking-wider">
              {schoolInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white tracking-tight truncate leading-tight" title={schoolName}>
                {schoolName}
              </div>
              <div className="text-[9px] text-emerald-400 font-extrabold tracking-widest uppercase mt-0.5 truncate">
                CAMPUS MANAGEMENT SYSTEM
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 ${
                            isActive ? 'text-white' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            isActive
                              ? 'bg-emerald-900/90 text-emerald-100'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer profile snippet */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-slate-800/70 border border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-emerald-100 flex items-center justify-center text-xs font-bold border border-emerald-600/40">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-100 truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-emerald-400 font-medium truncate">
                {currentUser.role}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
