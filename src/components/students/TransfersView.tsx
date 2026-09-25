import React, { useState } from 'react';
import { ArrowRightLeft, Printer, Plus, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { TransferMigrationRecord } from '../../types/index.ts';
import { formatDate } from '../../utils/formatters.ts';

export const TransfersView: React.FC = () => {
  const { transfers, students, refreshAllData, showToast, settings } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [studentId, setStudentId] = useState('');
  const [type, setType] = useState<'Transfer' | 'Migration'>('Transfer');
  const [destinationSchool, setDestinationSchool] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeStudents = students.filter((s) => s.status === 'active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !destinationSchool.trim()) {
      showToast('Please select a student and specify the destination school', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          type,
          previousSchool: settings?.name || 'ABC School',
          currentSchool: settings?.name || 'ABC School',
          destinationSchool: destinationSchool.trim(),
          transferDate,
          reason: reason.trim(),
          remarks: remarks.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to record transfer');

      await refreshAllData();
      showToast(`${type} record saved successfully`, 'success');
      setShowModal(false);
      setStudentId('');
      setDestinationSchool('');
      setReason('');
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Transfers & Board Migration
          </h2>
          <p className="text-xs text-slate-500">
            Official Transfer Certificate (TC) and Board Migration records for inter-provincial or inter-school moves.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Transfer / Migration</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {transfers.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No inter-school transfers or migrations recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">TC #</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Destination Institution</th>
                  <th className="py-3 px-4">Transfer Date</th>
                  <th className="py-3 px-4">Authority Approval</th>
                  <th className="py-3 px-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-800">
                      {t.certificateNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{t.studentName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-800">
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{t.destinationSchool}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(t.transferDate)}</td>
                    <td className="py-3 px-4 text-slate-600">{t.authorityApproval}</td>
                    <td className="py-3 px-4 text-slate-500">{t.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Record Transfer / Migration</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Select Student <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="">-- Choose active student --</option>
                  {activeStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="transType"
                      checked={type === 'Transfer'}
                      onChange={() => setType('Transfer')}
                      className="text-emerald-700"
                    />
                    <span>Transfer Certificate (TC)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="transType"
                      checked={type === 'Migration'}
                      onChange={() => setType('Migration')}
                      className="text-emerald-700"
                    />
                    <span>Board Migration (BISE)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Destination School / College <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={destinationSchool}
                  onChange={(e) => setDestinationSchool(e.target.value)}
                  placeholder="e.g. Army Public School, Rawalpindi"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Transfer Date</label>
                <input
                  type="date"
                  value={transferDate}
                  onChange={(e) => setTransferDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Reason for Transfer</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Parental posting to Punjab / Change of residence"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Security cleared, library clearance verified..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 font-medium"
                >
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
