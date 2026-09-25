import React from 'react';
import {
  Users,
  UserCheck,
  UserX,
  UserMinus,
  GraduationCap,
  Briefcase,
  Receipt,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  School,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { formatPKR, formatDate } from '../../utils/formatters.ts';

export const DashboardView: React.FC = () => {
  const {
    students,
    staff,
    admissions,
    withdrawals,
    attendance,
    feeInvoices,
    exams,
    auditLogs,
    setCurrentView,
    seedDemoData,
    classes,
  } = useApp();

  // Metrics computation from real database
  const activeStudents = students.filter((s) => s.status === 'active').length;
  const withdrawnStudents = withdrawals.length;
  const migratedStudents = students.filter((s) => s.status === 'migrated').length;
  const teachingStaff = staff.filter((m) => m.category === 'Teaching Staff').length;
  const nonTeachingStaff = staff.filter((m) => m.category !== 'Teaching Staff').length;

  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((a) => a.date === today && a.targetType === 'student');
  const presentToday = todayAttendance.filter((a) => a.status === 'Present').length;
  const absentToday = todayAttendance.filter((a) => a.status === 'Absent').length;

  const totalFeeReceivable = feeInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);
  const totalFeeCollected = feeInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

  const upcomingExams = exams.filter((e) => e.status === 'Scheduled');

  // Class breakdown
  const classBreakdown = classes.map((cls) => {
    const count = students.filter((s) => s.currentClassId === cls.id && s.status === 'active').length;
    return { name: cls.name, count };
  });

  const maleStudents = students.filter((s) => s.gender === 'Male').length;
  const femaleStudents = students.filter((s) => s.gender === 'Female').length;

  const isZeroData = students.length === 0 && staff.length === 0;

  return (
    <div className="space-y-6">
      {/* Zero Data Banner (if zero records) */}
      {isZeroData && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold">
              <School className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="font-semibold text-emerald-950 text-sm">
                Zero-Data Principle Active
              </div>
              <div className="text-emerald-800">
                A fresh installation of ABC School Management System has 0 operational records. You can start enrolling students or load realistic Pakistani demo data to explore all modules.
              </div>
            </div>
          </div>
          <button
            onClick={seedDemoData}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-medium transition-colors whitespace-nowrap shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Pakistani Demo Data</span>
          </button>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Students</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{activeStudents}</span>
            <span className="text-xs text-slate-500">/ {students.length} Total</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span>{withdrawnStudents} withdrawn</span>
            <span>·</span>
            <span>{migratedStudents} migrated</span>
          </div>
        </div>

        {/* Staff Overview */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Staff</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{staff.length}</span>
            <span className="text-xs text-slate-500">Employees</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
            <span>{teachingStaff} Faculty</span>
            <span>·</span>
            <span>{nonTeachingStaff} Non-Teaching</span>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Today's Attendance</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {todayAttendance.length > 0
                ? `${Math.round((presentToday / todayAttendance.length) * 100)}%`
                : '—'}
            </span>
            <span className="text-xs text-slate-500">
              {todayAttendance.length > 0 ? `${presentToday} Present` : 'Not Marked'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            {absentToday} students marked absent
          </div>
        </div>

        {/* Pending Fees */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Receivable Fees</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl font-bold text-slate-900">
              {formatPKR(totalFeeReceivable)}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            Collected: {formatPKR(totalFeeCollected)}
          </div>
        </div>
      </div>

      {/* Charts & Analytical Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Class-wise Population Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Student Enrollment by Class</h3>
              <p className="text-xs text-slate-500">Pakistani curriculum academic distribution</p>
            </div>
            <button
              onClick={() => setCurrentView('students')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeStudents === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No students enrolled in the current academic year.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {classBreakdown
                .filter((c) => c.count > 0 || classBreakdown.every((k) => k.count === 0))
                .slice(0, 8)
                .map((cls) => {
                  const maxCount = Math.max(...classBreakdown.map((c) => c.count), 1);
                  const percentage = Math.round((cls.count / maxCount) * 100);
                  return (
                    <div key={cls.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700">
                        <span>{cls.name}</span>
                        <span className="text-slate-500">{cls.count} students</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Gender & Demographics */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Student Demographics</h3>
            <p className="text-xs text-slate-500 mb-4">Gender distribution</p>

            {students.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No demographic data available.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-700" />
                    <span className="font-medium text-slate-700">Male Students</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {maleStudents} ({Math.round((maleStudents / students.length) * 100)}%)
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-teal-500" />
                    <span className="font-medium text-slate-700">Female Students</span>
                  </div>
                  <span className="font-semibold text-slate-900">
                    {femaleStudents} ({Math.round((femaleStudents / students.length) * 100)}%)
                  </span>
                </div>

                {/* Visual Ratio Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-700 h-full transition-all"
                    style={{ width: `${(maleStudents / students.length) * 100}%` }}
                  />
                  <div
                    className="bg-teal-500 h-full transition-all"
                    style={{ width: `${(femaleStudents / students.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-500">
            Registered B-Forms: {students.filter((s) => s.bFormNumber).length} verified
          </div>
        </div>
      </div>

      {/* Operational Grids: Recent Admissions, Withdrawals, Recent System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Admissions */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Recent Admissions</h3>
            <button
              onClick={() => setCurrentView('admissions')}
              className="text-xs text-emerald-700 font-medium hover:underline"
            >
              All ({admissions.length})
            </button>
          </div>
          {admissions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No recent admissions applications.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {admissions.slice(0, 4).map((a) => (
                <div key={a.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">{a.applicantName}</div>
                    <div className="text-[11px] text-slate-500">
                      Father: {a.fatherName} · {formatDate(a.applicationDate)}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      a.stage === 'Enrolled'
                        ? 'bg-emerald-100 text-emerald-800'
                        : a.stage === 'Admission Approved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {a.stage}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawals & SLCs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Withdrawals & SLCs</h3>
            <button
              onClick={() => setCurrentView('withdrawals')}
              className="text-xs text-emerald-700 font-medium hover:underline"
            >
              All ({withdrawals.length})
            </button>
          </div>
          {withdrawals.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No student withdrawals recorded.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {withdrawals.slice(0, 4).map((w) => (
                <div key={w.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">{w.studentName}</div>
                    <div className="text-[11px] text-slate-500">
                      SLC #{w.certificateNumber} · {formatDate(w.withdrawalDate)}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-600 truncate max-w-[100px]">
                    {w.reason}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Activity Audit Trail */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Audit Trail</h3>
            <button
              onClick={() => setCurrentView('audit-logs')}
              className="text-xs text-emerald-700 font-medium hover:underline"
            >
              View Log
            </button>
          </div>
          {auditLogs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No audit activities recorded.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="py-2 flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-800 truncate font-medium">{log.details}</div>
                    <div className="text-[10px] text-slate-400">
                      {log.userName} ({log.userRole}) · {formatDate(log.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
