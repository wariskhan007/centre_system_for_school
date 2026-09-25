import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Calendar,
  Award,
  Receipt,
  FileText,
  Printer,
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Student, MarkRecord } from '../../types/index.ts';
import { formatDate, formatPKR } from '../../utils/formatters.ts';

interface StudentProfileModalProps {
  studentId: string | null;
  onClose: () => void;
  onGenerateDoc: (type: string, studentId: string) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  studentId,
  onClose,
  onGenerateDoc,
}) => {
  const { students, classes, sections, academicYears, feeInvoices, attendance, marks, exams } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'academic_history' | 'attendance' | 'fees' | 'exams'>('profile');

  if (!studentId) return null;

  const student = students.find((s) => s.id === studentId);
  if (!student) return null;

  const className = classes.find((c) => c.id === student.currentClassId)?.name || 'Class';
  const sectionName = sections.find((s) => s.id === student.currentSectionId)?.name || 'Section';
  const academicYearName = academicYears.find((y) => y.id === student.currentAcademicYearId)?.name || '2026-2027';

  // Computed data
  const studentInvoices = feeInvoices.filter((f) => f.studentId === student.id);
  const studentAttendance = attendance.filter((a) => a.targetId === student.id && a.targetType === 'student');
  const studentMarks = marks.filter((m: MarkRecord) => m.studentId === student.id);

  const presentCount = studentAttendance.filter((a) => a.status === 'Present').length;
  const attendanceRate = studentAttendance.length > 0 ? Math.round((presentCount / studentAttendance.length) * 100) : 100;

  const totalDues = studentInvoices.reduce((acc, inv) => acc + inv.remainingAmount, 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Photo and Quick Info */}
        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-2xl shadow-sm border border-emerald-600">
              {student.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">{student.fullName}</h2>
                <span
                  className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                    student.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  {student.status}
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-2">
                <span>Admission No: <strong className="font-mono text-white">{student.admissionNumber}</strong></span>
                <span>·</span>
                <span>Roll No: <strong className="font-mono text-white">{student.rollNumber}</strong></span>
                <span>·</span>
                <span>Class: <strong className="text-white">{className}</strong> ({sectionName})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => onGenerateDoc('bonafide', student.id)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium transition-colors"
            >
              Bonafide Cert
            </button>
            <button
              onClick={() => onGenerateDoc('student_id', student.id)}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium transition-colors"
            >
              Student ID Card
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-white flex space-x-6 text-xs font-medium">
          {[
            { id: 'profile', label: 'Student & Guardian Details' },
            { id: 'academic_history', label: 'Academic History' },
            { id: 'attendance', label: `Attendance (${attendanceRate}%)` },
            { id: 'exams', label: 'Examination Results' },
            { id: 'fees', label: `Fee Ledger (${formatPKR(totalDues)} Due)` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs space-y-6">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">B-Form / Form-B:</span>
                    <span className="font-mono font-medium text-slate-800">
                      {student.bFormNumber || 'Not Provided'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Date of Birth:</span>
                    <span className="font-medium text-slate-800">{formatDate(student.dob)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gender:</span>
                    <span className="font-medium text-slate-800">{student.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Blood Group:</span>
                    <span className="font-medium text-slate-800">{student.bloodGroup || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Religion:</span>
                    <span className="font-medium text-slate-800">{student.religion}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Nationality:</span>
                    <span className="font-medium text-slate-800">{student.nationality}</span>
                  </div>
                </div>
              </div>

              {/* Parents Info Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <h4 className="font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Parent / Guardian Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Father Name:</span>
                    <span className="font-semibold text-slate-900">{student.fatherName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Father CNIC:</span>
                      <span className="font-mono text-slate-800">{student.fatherCnic || '—'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Father Contact:</span>
                      <span className="text-slate-800 font-medium">{student.fatherContact || '—'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Father Occupation:</span>
                    <span className="text-slate-800">{student.fatherOccupation || '—'}</span>
                  </div>
                  {student.motherName && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-slate-400 block text-[11px]">Mother Name:</span>
                      <span className="text-slate-800">{student.motherName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Residential Address */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Residential Address
                </h4>
                <div>
                  <span className="text-slate-400 block text-[11px]">Street / House:</span>
                  <span className="text-slate-800">{student.houseStreet || '—'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Mohalla / Sector:</span>
                    <span className="text-slate-800">{student.mohalla || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Village / City:</span>
                    <span className="text-slate-800">{student.villageCity || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Tehsil & District:</span>
                    <span className="text-slate-800">{student.tehsil}, {student.district}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Province:</span>
                    <span className="text-slate-800">{student.province}</span>
                  </div>
                </div>
              </div>

              {/* Emergency & Health */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <h4 className="font-semibold text-slate-900 border-b border-slate-200 pb-2">
                  Emergency & Health Information
                </h4>
                <div>
                  <span className="text-slate-400 block text-[11px]">Emergency Contact:</span>
                  <span className="text-slate-800 font-medium">
                    {student.emergencyContact} ({student.emergencyRelation}) - {student.emergencyPhone}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Medical Notes:</span>
                  <span className="text-slate-700 italic">
                    {student.medicalNotes || 'No known allergies or chronic conditions noted.'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Remarks:</span>
                  <span className="text-slate-700">{student.remarks || 'No special remarks recorded.'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic_history' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <h4 className="font-semibold text-emerald-950 text-sm">Chronological Academic History</h4>
                <p className="text-emerald-800 text-[11px] mt-0.5">
                  Records are permanently archived across academic years and never overwritten.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="p-4 flex items-center justify-between bg-slate-50">
                  <div>
                    <span className="font-semibold text-slate-900">Current Session ({academicYearName})</span>
                    <span className="text-slate-500 block text-[11px] mt-0.5">
                      Class: {className} · Section: {sectionName} · Roll No: {student.rollNumber}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded font-medium text-[11px]">
                    In Progress
                  </span>
                </div>

                {student.previousSchool && (
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-slate-800">Previous School Record</span>
                      <span className="text-slate-500 block text-[11px] mt-0.5">
                        School: {student.previousSchool} · Leaving Cert No: {student.previousLeavingCertificateNo || 'N/A'}
                      </span>
                    </div>
                    <span className="text-slate-600 text-[11px] font-mono">
                      Result: {student.previousResult || 'N/A'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <span className="text-slate-400 block text-[11px]">Total Days Marked</span>
                  <span className="text-lg font-bold text-slate-800">{studentAttendance.length}</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                  <span className="text-emerald-700 block text-[11px]">Days Present</span>
                  <span className="text-lg font-bold text-emerald-800">{presentCount}</span>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-center">
                  <span className="text-rose-700 block text-[11px]">Days Absent</span>
                  <span className="text-lg font-bold text-rose-800">
                    {studentAttendance.filter((a) => a.status === 'Absent').length}
                  </span>
                </div>
              </div>

              {studentAttendance.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  No attendance records logged for this student yet.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentAttendance.map((att) => (
                        <tr key={att.id}>
                          <td className="py-2.5 px-3 font-medium">{formatDate(att.date)}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                att.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {att.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">{att.remarks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'exams' && (
            <div className="space-y-4">
              {studentMarks.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  No examination marks recorded for this student.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">Exam</th>
                        <th className="py-2.5 px-3">Obtained / Total</th>
                        <th className="py-2.5 px-3">Grade</th>
                        <th className="py-2.5 px-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentMarks.map((mrk: MarkRecord) => (
                        <tr key={mrk.id}>
                          <td className="py-2.5 px-3 font-medium">Mid-Term Exam</td>
                          <td className="py-2.5 px-3 font-mono">
                            {mrk.obtainedMarks} / {mrk.totalMarks}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-emerald-700">{mrk.grade}</td>
                          <td className="py-2.5 px-3 text-slate-500">{mrk.remarks || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'fees' && (
            <div className="space-y-4">
              {studentInvoices.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  No fee invoices generated for this student.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Month</th>
                        <th className="py-2.5 px-3">Net Payable</th>
                        <th className="py-2.5 px-3">Paid</th>
                        <th className="py-2.5 px-3">Remaining</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentInvoices.map((inv) => (
                        <tr key={inv.id}>
                          <td className="py-2.5 px-3 font-mono font-medium">{inv.invoiceNo}</td>
                          <td className="py-2.5 px-3">{inv.month}</td>
                          <td className="py-2.5 px-3 font-medium">{formatPKR(inv.netPayable)}</td>
                          <td className="py-2.5 px-3 text-emerald-700">{formatPKR(inv.paidAmount)}</td>
                          <td className="py-2.5 px-3 text-rose-700">{formatPKR(inv.remainingAmount)}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                inv.status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : inv.status === 'Overdue'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Internal ID: <span className="font-mono">{student.id}</span> · Registered: {formatDate(student.createdAt)}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-medium"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
