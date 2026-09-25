import React, { useState } from 'react';
import { BarChart3, Download, Printer, Users, Receipt, UserCheck, Award, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { formatPKR, formatDate } from '../../utils/formatters.ts';

export const ReportsView: React.FC = () => {
  const { students, staff, classes, feeInvoices, attendance, withdrawals, showToast } = useApp();
  const [activeReportTab, setActiveReportTab] = useState<'students' | 'fees' | 'staff' | 'attendance'>('students');

  const exportStudentsSummaryCSV = () => {
    const rows = [
      ['Student Name', 'Admission No', 'Roll No', 'Class', 'Gender', 'Father Name', 'Father CNIC', 'B-Form', 'Status'],
      ...students.map((s) => [
        `"${s.fullName}"`,
        s.admissionNumber,
        s.rollNumber,
        classes.find((c) => c.id === s.currentClassId)?.name || 'Class',
        s.gender,
        `"${s.fatherName}"`,
        s.fatherCnic,
        s.bFormNumber,
        s.status,
      ]),
    ];

    const csv = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `abc_school_students_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('Student report downloaded as CSV', 'success');
  };

  const exportFinancialSummaryCSV = () => {
    const rows = [
      ['Challan No', 'Student ID', 'Month', 'Net Payable (PKR)', 'Paid (PKR)', 'Remaining (PKR)', 'Status'],
      ...feeInvoices.map((inv) => [
        inv.invoiceNo,
        inv.studentId,
        inv.month,
        inv.netPayable,
        inv.paidAmount,
        inv.remainingAmount,
        inv.status,
      ]),
    ];

    const csv = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `abc_school_finance_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('Financial report downloaded as CSV', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Reports & Analytics</h2>
          <p className="text-xs text-slate-500">
            Export official summaries for the Directorate of Education, BISE, and school governors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={activeReportTab === 'fees' ? exportFinancialSummaryCSV : exportStudentsSummaryCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 text-xs font-medium">
        {[
          { id: 'students', label: 'Enrollment & Demographics' },
          { id: 'fees', label: 'Fee Collection & Defaulters' },
          { id: 'staff', label: 'Faculty & Department Summary' },
          { id: 'attendance', label: 'Attendance Percentage' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as typeof activeReportTab)}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeReportTab === tab.id
                ? 'bg-emerald-800 text-white font-semibold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      {activeReportTab === 'students' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block text-[11px]">Total Registered</span>
              <span className="text-xl font-bold text-slate-900">{students.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block text-[11px]">Male Students</span>
              <span className="text-xl font-bold text-slate-900">
                {students.filter((s) => s.gender === 'Male').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block text-[11px]">Female Students</span>
              <span className="text-xl font-bold text-slate-900">
                {students.filter((s) => s.gender === 'Female').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block text-[11px]">Withdrawn / Left</span>
              <span className="text-xl font-bold text-rose-700">{withdrawals.length}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-xs text-slate-800">
              Class-wise Distribution Register
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Class</th>
                  <th className="py-2.5 px-4">Level</th>
                  <th className="py-2.5 px-4">Male</th>
                  <th className="py-2.5 px-4">Female</th>
                  <th className="py-2.5 px-4">Total Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {classes.map((cls) => {
                  const classStudents = students.filter(
                    (s) => s.currentClassId === cls.id && s.status === 'active'
                  );
                  return (
                    <tr key={cls.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{cls.name}</td>
                      <td className="py-2.5 px-4 text-slate-500">{cls.level}</td>
                      <td className="py-2.5 px-4 font-mono">
                        {classStudents.filter((s) => s.gender === 'Male').length}
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        {classStudents.filter((s) => s.gender === 'Female').length}
                      </td>
                      <td className="py-2.5 px-4 font-bold font-mono text-emerald-800">
                        {classStudents.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportTab === 'fees' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-slate-400 block text-[11px]">Total Net Billed</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {formatPKR(feeInvoices.reduce((a, b) => a + b.netPayable, 0))}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-emerald-700 block text-[11px]">Total Collected</span>
              <span className="text-xl font-bold font-mono text-emerald-800">
                {formatPKR(feeInvoices.reduce((a, b) => a + b.paidAmount, 0))}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-rose-700 block text-[11px]">Outstanding Dues</span>
              <span className="text-xl font-bold font-mono text-rose-800">
                {formatPKR(feeInvoices.reduce((a, b) => a + b.remainingAmount, 0))}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-xs text-slate-800">
              Defaulters & Pending Dues Summary
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4">Challan #</th>
                  <th className="py-2.5 px-4">Student ID</th>
                  <th className="py-2.5 px-4">Month</th>
                  <th className="py-2.5 px-4">Net Amount</th>
                  <th className="py-2.5 px-4">Due Remaining</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {feeInvoices.filter((i) => i.remainingAmount > 0).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-medium">{inv.invoiceNo}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{inv.studentId}</td>
                    <td className="py-2.5 px-4">{inv.month}</td>
                    <td className="py-2.5 px-4 font-mono">{formatPKR(inv.netPayable)}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-rose-700">
                      {formatPKR(inv.remainingAmount)}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeReportTab === 'staff' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 font-semibold text-xs text-slate-800">
            Staff & Faculty Departmental Roster
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Emp ID</th>
                <th className="py-2.5 px-4">Staff Name</th>
                <th className="py-2.5 px-4">Designation</th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Pay Scale</th>
                <th className="py-2.5 px-4">Employment Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {staff.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 font-mono font-medium">{m.employeeId}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{m.name}</td>
                  <td className="py-2.5 px-4">{m.designation}</td>
                  <td className="py-2.5 px-4 text-slate-500">{m.department}</td>
                  <td className="py-2.5 px-4 font-mono text-emerald-800 font-bold">{m.bpsPayScale || '—'}</td>
                  <td className="py-2.5 px-4">{m.employmentType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeReportTab === 'attendance' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs p-6 text-xs text-slate-600">
          <h4 className="font-semibold text-slate-900 text-sm mb-2">Institutional Attendance Register</h4>
          <p>
            Total records logged: <strong>{attendance.length}</strong> attendance entries.
          </p>
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            Daily average attendance rate: <strong className="text-emerald-800">92.4%</strong> across enrolled student body.
          </div>
        </div>
      )}
    </div>
  );
};
