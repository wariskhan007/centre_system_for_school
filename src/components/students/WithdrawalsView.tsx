import React, { useState } from 'react';
import { UserMinus, FileText, Printer, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { WithdrawalRecord } from '../../types/index.ts';
import { formatDate } from '../../utils/formatters.ts';

interface WithdrawalsViewProps {
  onPrintCertificate: (certData: WithdrawalRecord) => void;
}

export const WithdrawalsView: React.FC<WithdrawalsViewProps> = ({ onPrintCertificate }) => {
  const { withdrawals, students, classes, sections, refreshAllData, showToast, currentUser } = useApp();

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [withdrawalDate, setWithdrawalDate] = useState(new Date().toISOString().split('T')[0]);
  const [lastAttendanceDate, setLastAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<WithdrawalRecord['reason']>('Family relocation');
  const [destinationSchool, setDestinationSchool] = useState('');
  const [parentRequest, setParentRequest] = useState(true);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeStudents = students.filter((s) => s.status === 'active');

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      showToast('Please select a student to withdraw', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          withdrawalDate,
          lastAttendanceDate,
          reason,
          destinationSchool: destinationSchool.trim(),
          parentRequest,
          remarks: remarks.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to record student withdrawal');

      const data = await res.json();
      await refreshAllData();
      showToast(`Student withdrawn. School Leaving Certificate #${data.certificateNumber} generated.`, 'success');
      setShowWithdrawModal(false);
      setSelectedStudentId('');
      setRemarks('');
      setDestinationSchool('');
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getClassName = (clsId: string) => classes.find((c) => c.id === clsId)?.name || clsId;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Student Withdrawal & School Leaving Certificate (SLC)
          </h2>
          <p className="text-xs text-slate-500">
            Official withdrawal protocol. Records are preserved permanently in compliance with Pakistani education codes.
          </p>
        </div>

        {currentUser.permissions.includes('approve') && (
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span>Withdraw Student (Issue SLC)</span>
          </button>
        )}
      </div>

      {/* Withdrawals List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {withdrawals.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No withdrawn students in record. All enrolled students remain in good standing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Certificate #</th>
                  <th className="py-3 px-4">Student & Admission No</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Withdrawal Date</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Destination School</th>
                  <th className="py-3 px-4">Approved By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-800">
                      {w.certificateNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{w.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {w.admissionNumber}
                      </div>
                    </td>
                    <td className="py-3 px-4">{getClassName(w.currentClassId)}</td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(w.withdrawalDate)}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{w.reason}</td>
                    <td className="py-3 px-4 text-slate-500">{w.destinationSchool || '—'}</td>
                    <td className="py-3 px-4 text-slate-600">{w.principalApprovedBy}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onPrintCertificate(w)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 rounded text-[11px] font-medium transition-colors"
                        title="Print School Leaving Certificate"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print SLC</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Withdrawal Action Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Process Student Withdrawal (SLC)
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleWithdrawSubmit} className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                <strong>Important Policy:</strong> Withdrawn students are never physically deleted. Their full academic, fee, and examination records remain preserved in the permanent register.
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Select Student to Withdraw <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-rose-600"
                >
                  <option value="">-- Choose active student --</option>
                  {activeStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.admissionNumber} - {getClassName(s.currentClassId)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Withdrawal Date</label>
                  <input
                    type="date"
                    required
                    value={withdrawalDate}
                    onChange={(e) => setWithdrawalDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Last Attendance Date</label>
                  <input
                    type="date"
                    required
                    value={lastAttendanceDate}
                    onChange={(e) => setLastAttendanceDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Withdrawal Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as WithdrawalRecord['reason'])}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="School leaving">School leaving</option>
                  <option value="Relocation">Relocation</option>
                  <option value="Financial reasons">Financial reasons</option>
                  <option value="Family relocation">Family relocation</option>
                  <option value="Transfer to another school">Transfer to another school</option>
                  <option value="Migration">Migration</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Destination School / Institution
                </label>
                <input
                  type="text"
                  value={destinationSchool}
                  onChange={(e) => setDestinationSchool(e.target.value)}
                  placeholder="e.g. Islamabad Model College for Boys"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="parentRequest"
                  checked={parentRequest}
                  onChange={(e) => setParentRequest(e.target.checked)}
                  className="rounded text-emerald-700"
                />
                <label htmlFor="parentRequest" className="text-slate-700 font-medium">
                  Parent/Guardian written request on file
                </label>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Remarks & Dues Clearance</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="All school dues cleared, library books returned..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-rose-700 text-white rounded-lg hover:bg-rose-800 font-medium shadow-xs"
                >
                  {submitting ? 'Processing...' : 'Confirm Withdrawal & Issue SLC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
