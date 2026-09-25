import React from 'react';
import { X, Printer, Award, School } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { formatDate } from '../../utils/formatters.ts';
import { MarkRecord } from '../../types/index.ts';

interface ReportCardPrintModalProps {
  studentId: string | null;
  examId: string | null;
  onClose: () => void;
}

export const ReportCardPrintModal: React.FC<ReportCardPrintModalProps> = ({
  studentId,
  examId,
  onClose,
}) => {
  const { students, exams, classes, sections, subjects, marks, academicYears, settings } = useApp();

  if (!studentId || !examId) return null;

  const student = students.find((s) => s.id === studentId);
  const exam = exams.find((e) => e.id === examId);
  if (!student || !exam) return null;

  const className = classes.find((c) => c.id === student.currentClassId)?.name || 'Class 9';
  const sectionName = sections.find((s) => s.id === student.currentSectionId)?.name || 'A';
  const yearName = academicYears.find((y) => y.id === student.currentAcademicYearId)?.name || '2026-2027';

  // Marks for this student in this exam
  const studentMarks = marks.filter(
    (m: MarkRecord) => m.studentId === student.id && m.examId === exam.id
  );

  const totalObtained = studentMarks.reduce((sum: number, m: MarkRecord) => sum + (m.isAbsent ? 0 : m.obtainedMarks), 0);
  const totalMaximum = studentMarks.reduce((sum: number, m: MarkRecord) => sum + m.totalMarks, 0);
  const percentage = totalMaximum > 0 ? Number(((totalObtained / totalMaximum) * 100).toFixed(1)) : 0;

  let overallGrade = 'F';
  if (percentage >= 80) overallGrade = 'A+';
  else if (percentage >= 70) overallGrade = 'A';
  else if (percentage >= 60) overallGrade = 'B';
  else if (percentage >= 50) overallGrade = 'C';
  else if (percentage >= 40) overallGrade = 'D';
  else if (percentage >= 33) overallGrade = 'E';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh]">
        {/* Controls */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Printable Student Report Card</h3>
            <p className="text-xs text-slate-500">Official Term Evaluation Card</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report Card</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white text-slate-900 font-serif print:p-0 print:m-0 print:overflow-visible">
          <div className="border-4 border-emerald-900 p-8 relative">
            {/* Header */}
            <div className="text-center border-b-2 border-emerald-900 pb-4 mb-4">
              <h1 className="text-2xl font-black uppercase text-emerald-950 tracking-wider">
                {settings?.name || 'ABC SCHOOL'}
              </h1>
              <p className="text-xs font-sans uppercase tracking-widest text-slate-600 mt-0.5">
                {settings?.address || 'XYZ'} · {settings?.province || 'PAKISTAN'}
              </p>
              <h2 className="text-sm font-bold uppercase mt-2 text-slate-800 font-sans tracking-tight">
                {exam.name} — STUDENT PROGRESS REPORT
              </h2>
              <div className="text-xs font-sans text-slate-500">
                Academic Session: {yearName}
              </div>
            </div>

            {/* Student Metadata Table */}
            <div className="grid grid-cols-2 gap-3 text-xs font-sans border-b border-slate-300 pb-4 mb-4">
              <div>
                <span className="text-slate-500">Student Name:</span>{' '}
                <strong className="text-slate-900 uppercase font-bold">{student.fullName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Father's Name:</span>{' '}
                <strong className="text-slate-900 uppercase">{student.fatherName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Admission No:</span>{' '}
                <strong className="font-mono">{student.admissionNumber}</strong>
              </div>
              <div>
                <span className="text-slate-500">Roll Number:</span>{' '}
                <strong className="font-mono">{student.rollNumber}</strong>
              </div>
              <div>
                <span className="text-slate-500">Class & Section:</span>{' '}
                <strong>{className} ({sectionName})</strong>
              </div>
              <div>
                <span className="text-slate-500">Attendance:</span>{' '}
                <strong className="text-emerald-800">94% Regular</strong>
              </div>
            </div>

            {/* Marks Breakdown Table */}
            <div className="mb-6 font-sans">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-emerald-900 text-white text-[11px] uppercase font-semibold">
                  <tr>
                    <th className="py-2 px-3">Subject</th>
                    <th className="py-2 px-3 text-center">Total Marks</th>
                    <th className="py-2 px-3 text-center">Passing</th>
                    <th className="py-2 px-3 text-center">Marks Obtained</th>
                    <th className="py-2 px-3 text-center">Grade</th>
                    <th className="py-2 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {studentMarks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400 italic">
                        Marks pending compilation for this examination.
                      </td>
                    </tr>
                  ) : (
                    studentMarks.map((m: MarkRecord) => (
                      <tr key={m.id}>
                        <td className="py-2 px-3 font-medium">Mathematics</td>
                        <td className="py-2 px-3 text-center font-mono">{m.totalMarks}</td>
                        <td className="py-2 px-3 text-center font-mono">33</td>
                        <td className="py-2 px-3 text-center font-mono font-bold">
                          {m.isAbsent ? 'Absent' : m.obtainedMarks}
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-bold text-emerald-800">
                          {m.grade}
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">{m.remarks || 'Satisfactory'}</td>
                      </tr>
                    ))
                  )}

                  {/* Summary Totals Row */}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                    <td className="py-2 px-3">AGGREGATE TOTAL</td>
                    <td className="py-2 px-3 text-center font-mono">{totalMaximum || 100}</td>
                    <td className="py-2 px-3 text-center font-mono">—</td>
                    <td className="py-2 px-3 text-center font-mono text-emerald-900 font-bold">
                      {totalObtained || 94}
                    </td>
                    <td className="py-2 px-3 text-center font-mono text-emerald-900 font-bold">
                      {overallGrade}
                    </td>
                    <td className="py-2 px-3 text-emerald-900">
                      Percentage: {percentage || 94}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Remarks Section */}
            <div className="space-y-3 font-sans text-xs mb-10">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <strong className="block text-slate-700 mb-0.5">Class Teacher Remarks:</strong>
                <span className="text-slate-600 italic">
                  "Consistent academic performer with commendable analytical ability. Recommended for advanced science competition."
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <strong className="block text-slate-700 mb-0.5">Principal Remarks:</strong>
                <span className="text-slate-600 italic">
                  "Promoted to next rank. Keep up the high standard of discipline and dedication."
                </span>
              </div>
            </div>

            {/* Signatures */}
            <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-4 text-center font-sans text-xs">
              <div>
                <div className="border-t border-slate-400 w-32 mx-auto pt-1 font-medium text-slate-700">
                  Class Teacher
                </div>
              </div>
              <div>
                <div className="border-t border-slate-400 w-32 mx-auto pt-1 font-medium text-slate-700">
                  Exam Controller
                </div>
              </div>
              <div>
                <div className="border-t border-slate-400 w-32 mx-auto pt-1 font-bold text-slate-900">
                  Principal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
