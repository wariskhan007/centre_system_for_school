import React, { useState, useEffect } from 'react';
import { X, Save, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { ExamSubjectSchedule, MarkRecord } from '../../types/index.ts';

interface MarksEntryModalProps {
  examId: string | null;
  onClose: () => void;
}

export const MarksEntryModal: React.FC<MarksEntryModalProps> = ({ examId, onClose }) => {
  const { exams, subjects, students, refreshAllData, showToast } = useApp();

  const [schedules, setSchedules] = useState<ExamSubjectSchedule[]>([]);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [marksData, setMarksData] = useState<Record<string, { obtained: number; isAbsent: boolean; remarks: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New Schedule form
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(33);

  const exam = exams.find((e) => e.id === examId);
  const classStudents = exam
    ? students.filter((s) => s.currentClassId === exam.classId && s.status === 'active')
    : [];

  useEffect(() => {
    if (!examId) return;

    const fetchSchedulesAndMarks = async () => {
      setLoading(true);
      try {
        const [schedRes, marksRes] = await Promise.all([
          fetch(`/api/exams/${examId}/schedules`).then((r) => r.json()),
          fetch(`/api/exams/${examId}/marks`).then((r) => r.json()),
        ]);

        setSchedules(schedRes || []);
        if (schedRes && schedRes.length > 0) {
          const firstSched = schedRes[0];
          setSelectedScheduleId(firstSched.id);

          const initialMarks: Record<string, { obtained: number; isAbsent: boolean; remarks: string }> = {};
          classStudents.forEach((s) => {
            const existing = marksRes.find(
              (m: MarkRecord) => m.studentId === s.id && m.examSubjectId === firstSched.id
            );
            initialMarks[s.id] = {
              obtained: existing ? existing.obtainedMarks : 0,
              isAbsent: existing ? Boolean(existing.isAbsent) : false,
              remarks: existing ? existing.remarks || '' : '',
            };
          });
          setMarksData(initialMarks);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedulesAndMarks();
  }, [examId]);

  if (!examId || !exam) return null;

  const currentSchedule = schedules.find((s) => s.id === selectedScheduleId);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/exams/${examId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId: newSubjectId,
          examDate,
          startTime: '09:00 AM',
          endTime: '12:00 PM',
          totalMarks: Number(totalMarks),
          passingMarks: Number(passingMarks),
        }),
      });

      if (res.ok) {
        const newSched = await res.json();
        setSchedules((prev) => [...prev, newSched]);
        setSelectedScheduleId(newSched.id);
        setShowAddSchedule(false);
        showToast('Subject schedule added to exam', 'success');
      }
    } catch {
      showToast('Error adding schedule', 'error');
    }
  };

  const handleMarkChange = (studentId: string, val: number) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        obtained: val,
      },
    }));
  };

  const handleAbsentToggle = (studentId: string) => {
    setMarksData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        isAbsent: !prev[studentId]?.isAbsent,
      },
    }));
  };

  const calculateGrade = (obtained: number, total: number) => {
    const pct = total > 0 ? (obtained / total) * 100 : 0;
    if (pct >= 80) return 'A+';
    if (pct >= 70) return 'A';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    if (pct >= 33) return 'E';
    return 'F';
  };

  const handleSaveMarks = async () => {
    if (!currentSchedule) {
      showToast('Please add a subject schedule first', 'error');
      return;
    }

    setSaving(true);
    try {
      const payloadMarks: MarkRecord[] = Object.keys(marksData).map((sId) => {
        const item = marksData[sId];
        const grade = item.isAbsent ? 'F' : calculateGrade(item.obtained, currentSchedule.totalMarks);
        return {
          id: '',
          examId: exam.id,
          examSubjectId: currentSchedule.id,
          studentId: sId,
          obtainedMarks: item.isAbsent ? 0 : Number(item.obtained),
          totalMarks: currentSchedule.totalMarks,
          grade,
          isAbsent: item.isAbsent,
          remarks: item.remarks,
        };
      });

      const res = await fetch(`/api/exams/${exam.id}/marks/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marks: payloadMarks }),
      });

      if (!res.ok) throw new Error('Failed to save marks');

      await refreshAllData();
      showToast(`Marks for ${payloadMarks.length} students saved successfully!`, 'success');
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Marks Entry: {exam.name}</h3>
            <p className="text-xs text-slate-500">Record obtained marks and calculate Pakistani board grades</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Schedule Selector */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Subject Schedule:</span>
            {schedules.length === 0 ? (
              <span className="text-rose-600 font-medium">No subjects scheduled for this exam yet</span>
            ) : (
              <select
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg outline-none font-medium bg-slate-50"
              >
                {schedules.map((s) => {
                  const sub = subjects.find((sb) => sb.id === s.subjectId);
                  return (
                    <option key={s.id} value={s.id}>
                      {sub?.name || 'Subject'} (Max: {s.totalMarks})
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <button
            onClick={() => setShowAddSchedule(!showAddSchedule)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject Schedule</span>
          </button>
        </div>

        {/* Add Schedule Collapsible Form */}
        {showAddSchedule && (
          <form
            onSubmit={handleCreateSchedule}
            className="p-4 bg-emerald-50 border-b border-emerald-200 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
          >
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Subject</label>
              <select
                value={newSubjectId}
                onChange={(e) => setNewSubjectId(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Total Marks</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Passing Marks</label>
              <input
                type="number"
                value={passingMarks}
                onChange={(e) => setPassingMarks(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-emerald-800 text-white rounded font-medium hover:bg-emerald-900"
              >
                Save Schedule
              </button>
            </div>
          </form>
        )}

        {/* Students Marks Input Table */}
        <div className="flex-1 overflow-y-auto p-4 text-xs">
          {classStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No students enrolled in this class.
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Roll #</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Father Name</th>
                  <th className="py-2.5 px-3 w-28">Obtained Marks</th>
                  <th className="py-2.5 px-3 w-20 text-center">Absent?</th>
                  <th className="py-2.5 px-3 w-20 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {classStudents.map((s) => {
                  const item = marksData[s.id] || { obtained: 0, isAbsent: false, remarks: '' };
                  const maxMarks = currentSchedule?.totalMarks || 100;
                  const grade = item.isAbsent ? 'F' : calculateGrade(item.obtained, maxMarks);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-medium">{s.rollNumber}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{s.fullName}</td>
                      <td className="py-2.5 px-3 text-slate-500">{s.fatherName}</td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          disabled={item.isAbsent}
                          min={0}
                          max={maxMarks}
                          value={item.isAbsent ? 0 : item.obtained}
                          onChange={(e) => handleMarkChange(s.id, Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-slate-200 rounded font-mono text-center outline-none focus:border-emerald-600 disabled:bg-slate-100"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={item.isAbsent}
                          onChange={() => handleAbsentToggle(s.id)}
                          className="rounded text-rose-600 cursor-pointer"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                            grade === 'A+' || grade === 'A'
                              ? 'bg-emerald-100 text-emerald-800'
                              : grade === 'F'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveMarks}
            disabled={saving || !currentSchedule}
            className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-medium flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save All Marks'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
