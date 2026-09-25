import React, { useState } from 'react';
import {
  Bell,
  Search,
  Shield,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  School,
  Database,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { UserRole } from '../../types/index.ts';

interface HeaderProps {
  onOpenSearch: () => void;
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onToggleMobileSidebar }) => {
  const {
    currentUser,
    switchRole,
    settings,
    academicYears,
    notifications,
    markNotificationRead,
    setCurrentView,
    seedDemoData,
    resetToZeroData,
    students,
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const currentYear = academicYears.find((y) => y.isCurrent) || academicYears[0];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const roles: UserRole[] = [
    'Super Administrator',
    'School Administrator',
    'Principal / Head Teacher',
    'Teacher',
    'Accountant',
    'Examination Officer',
    'Receptionist / Data Entry Operator',
    'HR / Staff Manager',
    'Read-Only User',
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
      {/* Left side: Mobile menu toggle + School Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle Navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <School className="w-5 h-5 text-emerald-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 tracking-tight text-sm md:text-base">
                {settings?.name || 'Splended Education System'}
              </span>
              <span className="text-xs text-slate-400 font-normal">|</span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                {settings?.province || 'Pakistan'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Session: {currentYear?.name || '2026-2027'}</span>
              <span>·</span>
              <span className="text-emerald-700 font-medium">Currency: PKR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Quick Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs border border-slate-200 rounded-lg transition-colors group"
        >
          <span className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            <span>Search students by Name, B-Form, CNIC, Roll No or Staff...</span>
          </span>
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-400">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right side: Actions & User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Search records"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Demo Mode / Zero-Data Indicator */}
        <div className="relative">
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            title="Demo Data & Zero Data Principle Controls"
          >
            <Database className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">
              {students.length > 0 ? `Records: ${students.length}` : 'Zero Data Mode'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-50 text-xs">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Data Environment
              </div>
              <div className="px-3 py-1 text-slate-600">
                Current mode: <strong className="text-slate-900">{students.length > 0 ? 'Sample Pakistani Records' : 'Strict Zero-Data'}</strong>
              </div>
              <hr className="my-1.5 border-slate-100" />
              <button
                onClick={() => {
                  setShowDemoMenu(false);
                  seedDemoData();
                }}
                className="w-full text-left px-3 py-2 text-emerald-800 hover:bg-emerald-50 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Seed Pakistani Demo Data</span>
              </button>
              <button
                onClick={() => {
                  setShowDemoMenu(false);
                  resetToZeroData();
                }}
                className="w-full text-left px-3 py-2 text-rose-700 hover:bg-rose-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4 text-rose-500" />
                <span>Reset to Strict Zero Data</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50">
              <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">System Notifications</span>
                <span className="text-[11px] text-slate-400">{unreadCount} unread</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No notifications yet</div>
                ) : (
                  notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`px-3.5 py-2.5 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <div className="font-medium text-slate-800">{notif.title}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{notif.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-emerald-800" />
            </div>
            <div className="hidden xl:block">
              <div className="text-xs font-medium text-slate-900 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl py-2 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Simulate Role (RBAC)
              </div>
              <div className="max-h-60 overflow-y-auto">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                      currentUser.role === r
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{r}</span>
                    {currentUser.role === r && (
                      <span className="text-[10px] text-emerald-700">Active</span>
                    )}
                  </button>
                ))}
              </div>
              <hr className="my-1.5 border-slate-100" />
              <button
                onClick={() => {
                  setShowRoleMenu(false);
                  setCurrentView('settings');
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
              >
                School Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
