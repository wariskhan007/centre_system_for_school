import React, { useState } from 'react';
import { ClipboardList, Plus, Calendar, Award, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Exam, ExamType } from '../../types/index.ts';
import { formatDate } from '../../utils/formatters.ts';

interface ExamsListViewProps {
  onOpenMarksEntry: (examId: string) => void;
  onOpenResults: (examId: string, classId: string) => void;
}

export const ExamsListView: React.FC<ExamsListViewProps> = ({
  onOpenMarksEntry,
  onOpenResults,
}) => {
  const { exams, classes, academicYears, refreshAllData, showToast, currentUser } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [examType, setExamType] = useState<ExamType>('Mid Term');
  const [classId, setClassId] = useState(classes[0]?.id || 'cls-9');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          examType,
          classId,
          academicYearId: academicYears.find((y) => y.isCurrent)?.id || 'ay-2026-2027',
          startDate,
          endDate,
          status: 'Scheduled',
          remarks: remarks.trim(),
        }),
      });

      if (res.ok) {
        await refreshAllData();
        showToast(`Exam schedule "${name}" created`, 'success');
        setName('');
        setShowAddModal(false);
      }
    } catch {
      showToast('Error creating exam', 'error');
    }
  };

  const getClassName = (cId: string) => classes.find((c) => c.id === cId)?.name || 'Class';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Examination Management</h2>
          <p className="text-xs text-slate-500">
            Exam schedules, marks entry, automatic Pakistani Board grading, and merit lists.
          </p>
        </div>

        {currentUser.permissions.includes('manage_exams') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Exam Schedule</span>
          </button>
        )}
      </div>

      {/* Grid of Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exams.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl">
            No examinations scheduled. Click "Create Exam Schedule" or load demo data.
          </div>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {exam.examType}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {getClassName(exam.classId)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{exam.name}</h3>

                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  <div>Date: <strong className="text-slate-800">{formatDate(exam.startDate)}</strong> to <strong className="text-slate-800">{formatDate(exam.endDate)}</strong></div>
                  <div className="text-slate-500 text-[11px] line-clamp-2 mt-1">
                    {exam.remarks || 'Standard BISE Board Pattern'}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenMarksEntry(exam.id)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors"
                >
                  Marks Entry
                </button>
                <button
                  onClick={() => onOpenResults(exam.id, exam.classId)}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-medium transition-colors shadow-xs"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Result Gazette</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Schedule Examination</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleCreateExam} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Exam Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mid-Term Examination 2026"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Exam Type</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value as ExamType)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="Monthly Test">Monthly Test</option>
                  <option value="Class Test">Class Test</option>
                  <option value="Mid Term">Mid Term</option>
                  <option value="Final Term">Final Term</option>
                  <option value="Annual Exam">Annual Exam</option>
                  <option value="Pre-Board">Pre-Board Examination</option>
                  <option value="Board Preparation">Board Preparation</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Target Class</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Remarks / Syllabus Notice</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Instructions for students and question paper setters..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 font-medium"
                >
                  Schedule Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
