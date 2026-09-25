import React, { useState } from 'react';
import { CalendarDays, Plus, CheckCircle, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { formatDate } from '../../utils/formatters.ts';

export const AcademicYearsView: React.FC = () => {
  const { academicYears, refreshAllData, showToast, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/academic-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          startDate,
          endDate,
          status: 'closed',
          isCurrent: false,
        }),
      });

      if (res.ok) {
        await refreshAllData();
        showToast(`Academic session "${name}" created`, 'success');
        setName('');
        setShowModal(false);
      }
    } catch {
      showToast('Error creating academic year', 'error');
    }
  };

  const handleActivate = async (id: string, yearName: string) => {
    try {
      const res = await fetch(`/api/academic-years/${id}/activate`, {
        method: 'PUT',
      });
      if (res.ok) {
        await refreshAllData();
        showToast(`Session ${yearName} is now the active academic year`, 'success');
      }
    } catch {
      showToast('Failed to switch active session', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Academic Year Management</h2>
          <p className="text-xs text-slate-500">
            Independent session cycles. Past academic years remain fully accessible and archived.
          </p>
        </div>

        {currentUser.permissions.includes('manage_settings') && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Academic Session</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {academicYears.map((ay) => (
          <div
            key={ay.id}
            className={`bg-white p-5 rounded-xl border shadow-xs transition-colors flex flex-col justify-between ${
              ay.isCurrent ? 'border-emerald-600 ring-1 ring-emerald-600/20' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">{ay.name}</span>
                {ay.isCurrent ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-3 h-3" />
                    <span>Active Session</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                    <Lock className="w-3 h-3" />
                    <span>Archived</span>
                  </span>
                )}
              </div>

              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <div>Start Date: <strong className="text-slate-800">{formatDate(ay.startDate)}</strong></div>
                <div>End Date: <strong className="text-slate-800">{formatDate(ay.endDate)}</strong></div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {ay.isCurrent ? 'Enrolling & Testing Active' : 'Historical Data Retained'}
              </span>
              {!ay.isCurrent && currentUser.permissions.includes('manage_settings') && (
                <button
                  onClick={() => handleActivate(ay.id, ay.name)}
                  className="px-3 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded text-xs font-medium transition-colors"
                >
                  Set as Active
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Add Academic Session</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleCreateYear} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 2027-2028"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Session Start</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Session End</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 font-medium"
                >
                  Save Academic Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
