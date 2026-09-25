import React, { useState } from 'react';
import { UserCheck, CheckCircle2, XCircle, Clock, Calendar, Users, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { AttendanceRecord, AttendanceStatus } from '../../types/index.ts';

export const AttendanceView: React.FC = () => {
  const { classes, sections, students, staff, attendance, refreshAllData, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'students' | 'staff'>('students');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || 'cls-9');
  const [selectedSectionId, setSelectedSectionId] = useState<string>(sections[0]?.id || 'sec-9a');

  // Local attendance mapping targetId -> { status, remarks }
  const [statusMap, setStatusMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [submitting, setSubmitting] = useState(false);

  // Filter students by class & section
  const currentStudents = students.filter(
    (s) => s.currentClassId === selectedClassId && s.status === 'active'
  );

  // Initialize status map from existing attendance on date / class change
  React.useEffect(() => {
    const existing = attendance.filter((a) => a.date === selectedDate);
    const newMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};

    if (activeTab === 'students') {
      currentStudents.forEach((s) => {
        const found = existing.find((a) => a.targetId === s.id && a.targetType === 'student');
        newMap[s.id] = {
          status: found?.status || 'Present',
          remarks: found?.remarks || '',
        };
      });
    } else {
      staff.forEach((m) => {
        const found = existing.find((a) => a.targetId === m.id && a.targetType === 'staff');
        newMap[m.id] = {
          status: found?.status || 'Present',
          remarks: found?.remarks || '',
        };
      });
    }

    setStatusMap(newMap);
  }, [selectedDate, selectedClassId, selectedSectionId, activeTab, students, staff, attendance]);

  const setAllStatus = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    const targets = activeTab === 'students' ? currentStudents : staff;
    targets.forEach((t) => {
      updated[t.id] = {
        status,
        remarks: statusMap[t.id]?.remarks || '',
      };
    });
    setStatusMap(updated);
  };

  const handleStatusChange = (id: string, status: AttendanceStatus) => {
    setStatusMap((prev) => ({
      ...prev,
      [id]: {
        status,
        remarks: prev[id]?.remarks || '',
      },
    }));
  };

  const handleRemarksChange = (id: string, remarks: string) => {
    setStatusMap((prev) => ({
      ...prev,
      [id]: {
        status: prev[id]?.status || 'Present',
        remarks,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    setSubmitting(true);
    try {
      const recordsToSave: AttendanceRecord[] = Object.keys(statusMap).map((id) => ({
        id: '',
        targetType: activeTab === 'students' ? 'student' : 'staff',
        targetId: id,
        date: selectedDate,
        status: statusMap[id].status,
        remarks: statusMap[id].remarks,
        classId: activeTab === 'students' ? selectedClassId : undefined,
        sectionId: activeTab === 'students' ? selectedSectionId : undefined,
      }));

      const res = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: recordsToSave }),
      });

      if (!res.ok) throw new Error('Failed to save attendance');

      await refreshAllData();
      showToast(
        `Attendance for ${recordsToSave.length} ${activeTab} saved successfully`,
        'success'
      );
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const currentList = activeTab === 'students' ? currentStudents : staff;
  const presentCount = Object.values(statusMap).filter((v) => v.status === 'Present').length;
  const absentCount = Object.values(statusMap).filter((v) => v.status === 'Absent').length;
  const lateCount = Object.values(statusMap).filter((v) => v.status === 'Late').length;
  const leaveCount = Object.values(statusMap).filter((v) => v.status === 'Leave').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Attendance Register</h2>
          <p className="text-xs text-slate-500">
            Daily student and faculty attendance marking with instant percentage calculations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'students' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Student Attendance
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeTab === 'staff' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Staff Attendance
            </button>
          </div>

          <button
            onClick={handleSaveAttendance}
            disabled={submitting || currentList.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{submitting ? 'Saving...' : 'Save Register'}</span>
          </button>
        </div>
      </div>

      {/* Filter / Selector Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-slate-600 font-semibold mb-1">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none font-medium"
          />
        </div>

        {activeTab === 'students' && (
          <>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Select Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
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
              <label className="block text-slate-600 font-semibold mb-1">Select Section</label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
              >
                {sections
                  .filter((s) => s.classId === selectedClassId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          </>
        )}

        <div className="flex items-end gap-2">
          <button
            onClick={() => setAllStatus('Present')}
            className="flex-1 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg font-medium border border-emerald-200 transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={() => setAllStatus('Absent')}
            className="flex-1 py-1.5 bg-rose-50 text-rose-800 hover:bg-rose-100 rounded-lg font-medium border border-rose-200 transition-colors"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Summary counters */}
      <div className="grid grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs text-center">
          <span className="text-slate-400 block text-[11px]">Total</span>
          <span className="text-lg font-bold text-slate-900">{currentList.length}</span>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <span className="text-emerald-700 block text-[11px]">Present</span>
          <span className="text-lg font-bold text-emerald-900">{presentCount}</span>
        </div>
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <span className="text-rose-700 block text-[11px]">Absent</span>
          <span className="text-lg font-bold text-rose-900">{absentCount}</span>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
          <span className="text-amber-700 block text-[11px]">Late / Leave</span>
          <span className="text-lg font-bold text-amber-900">{lateCount + leaveCount}</span>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {currentList.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            {activeTab === 'students'
              ? 'No active students enrolled in this class.'
              : 'No staff members registered.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-16">
                    {activeTab === 'students' ? 'Roll #' : 'Emp ID'}
                  </th>
                  <th className="py-3 px-4">Name</th>
                  {activeTab === 'students' ? (
                    <th className="py-3 px-4">Father Name</th>
                  ) : (
                    <th className="py-3 px-4">Designation</th>
                  )}
                  <th className="py-3 px-4">Attendance Status</th>
                  <th className="py-3 px-4">Notes / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {currentList.map((item) => {
                  const currentStatus = statusMap[item.id]?.status || 'Present';
                  const currentRemarks = statusMap[item.id]?.remarks || '';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-800">
                        {activeTab === 'students'
                          ? (item as any).rollNumber
                          : (item as any).employeeId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {activeTab === 'students'
                          ? (item as any).fullName
                          : (item as any).name}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {activeTab === 'students'
                          ? (item as any).fatherName
                          : (item as any).designation}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {(['Present', 'Absent', 'Late', 'Leave', 'Half Day'] as AttendanceStatus[]).map(
                            (st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleStatusChange(item.id, st)}
                                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                                  currentStatus === st
                                    ? st === 'Present'
                                      ? 'bg-emerald-700 text-white font-semibold shadow-xs'
                                      : st === 'Absent'
                                      ? 'bg-rose-700 text-white font-semibold shadow-xs'
                                      : 'bg-amber-600 text-white font-semibold shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {st}
                              </button>
                            )
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                          placeholder="Optional reason (e.g. sick leave, doctor appointment)"
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 text-xs outline-none focus:bg-white focus:border-slate-400"
                        />
                      </td>
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
