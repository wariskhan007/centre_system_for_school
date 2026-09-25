import React, { useState } from 'react';
import { TrendingUp, ArrowRight, CheckSquare, Square, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const PromotionView: React.FC = () => {
  const { classes, students, academicYears, refreshAllData, showToast } = useApp();

  const [fromClassId, setFromClassId] = useState(classes[0]?.id || 'cls-9');
  const [toClassId, setToClassId] = useState(classes[1]?.id || 'cls-10');
  const [targetYearId, setTargetYearId] = useState(academicYears[0]?.id || 'ay-2026-2027');
  const [action, setAction] = useState<'promote' | 'repeat'>('promote');

  const eligibleStudents = students.filter(
    (s) => s.currentClassId === fromClassId && s.status === 'active'
  );

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selected students when class changes
  React.useEffect(() => {
    setSelectedStudentIds(eligibleStudents.map((s) => s.id));
  }, [fromClassId, students]);

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === eligibleStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(eligibleStudents.map((s) => s.id));
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecutePromotion = async () => {
    if (selectedStudentIds.length === 0) {
      showToast('Select at least one student for promotion', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/promotion/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: selectedStudentIds,
          fromClassId,
          toClassId,
          targetAcademicYearId: targetYearId,
          action,
        }),
      });

      if (!res.ok) throw new Error('Promotion execution failed');

      const data = await res.json();
      await refreshAllData();
      showToast(
        `Successfully ${action === 'promote' ? 'promoted' : 'retained'} ${data.count} students!`,
        'success'
      );
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fromClassName = classes.find((c) => c.id === fromClassId)?.name || 'Source Class';
  const toClassName = classes.find((c) => c.id === toClassId)?.name || 'Target Class';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Bulk Student Promotion</h2>
        <p className="text-xs text-slate-500">
          Promote student batches to the next grade level with automatic chronological academic history archiving.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Promote From Class</label>
            <select
              value={fromClassId}
              onChange={(e) => setFromClassId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Promote To Class</label>
            <select
              value={toClassId}
              onChange={(e) => setToClassId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Target Academic Session</label>
            <select
              value={targetYearId}
              onChange={(e) => setTargetYearId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
            >
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name} {ay.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as 'promote' | 'repeat')}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
            >
              <option value="promote">Promote to Next Class</option>
              <option value="repeat">Repeat in Same Class</option>
            </select>
          </div>
        </div>

        {/* Pathway summary */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-emerald-950">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{fromClassName}</span>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-emerald-800">
              {action === 'promote' ? toClassName : `${fromClassName} (Repeat)`}
            </span>
          </div>
          <span className="text-[11px] text-emerald-800">
            Selected: <strong>{selectedStudentIds.length}</strong> of {eligibleStudents.length} students
          </span>
        </div>
      </div>

      {/* Eligible Students Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5"
            >
              {selectedStudentIds.length === eligibleStudents.length && eligibleStudents.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-emerald-700" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Select All</span>
            </button>
          </div>
          <button
            onClick={handleExecutePromotion}
            disabled={isSubmitting || selectedStudentIds.length === 0}
            className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-medium flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Apply Promotion ({selectedStudentIds.length})</span>
          </button>
        </div>

        {eligibleStudents.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No active students enrolled in {fromClassName}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[10px] uppercase">
                <tr>
                  <th className="py-2.5 px-4 w-12">Select</th>
                  <th className="py-2.5 px-4">Roll #</th>
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">Father Name</th>
                  <th className="py-2.5 px-4">Admission #</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {eligibleStudents.map((s) => {
                  const isChecked = selectedStudentIds.includes(s.id);
                  return (
                    <tr
                      key={s.id}
                      onClick={() => toggleStudent(s.id)}
                      className={`hover:bg-slate-50 cursor-pointer ${
                        isChecked ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-emerald-700"
                        />
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-800">{s.rollNumber}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{s.fullName}</td>
                      <td className="py-2.5 px-4 text-slate-600">{s.fatherName}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">{s.admissionNumber}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
