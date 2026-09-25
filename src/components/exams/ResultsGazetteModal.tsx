import React, { useState, useEffect } from 'react';
import { X, Award, Printer, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface ResultsGazetteModalProps {
  examId: string | null;
  classId: string | null;
  onClose: () => void;
  onPrintReportCard: (studentId: string, examId: string) => void;
}

export const ResultsGazetteModal: React.FC<ResultsGazetteModalProps> = ({
  examId,
  classId,
  onClose,
  onPrintReportCard,
}) => {
  const { exams, classes, settings } = useApp();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const exam = exams.find((e) => e.id === examId);
  const className = classes.find((c) => c.id === classId)?.name || 'Class';

  useEffect(() => {
    if (!examId || !classId) return;

    fetch(`/api/exams/${examId}/results/${classId}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [examId, classId]);

  if (!examId || !exam) return null;

  const handlePrintGazette = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:bg-white">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Official Result Gazette & Merit List
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                {className}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {exam.name} · {settings?.name || 'ABC School'} ({settings?.address || 'XYZ'})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintGazette}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Gazette</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {loading ? (
            <div className="py-16 text-center text-slate-400">Calculating examination results...</div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              No results or marks entered yet for this examination.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3 w-16 text-center">Position</th>
                    <th className="py-3 px-3">Roll #</th>
                    <th className="py-3 px-4">Student & Father</th>
                    <th className="py-3 px-3 text-center">Marks Obtained</th>
                    <th className="py-3 px-3 text-center">Percentage</th>
                    <th className="py-3 px-3 text-center">BISE Grade</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Individual Report</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {results.map((r) => {
                    const isTopThree = r.position <= 3 && r.status === 'Passed';
                    return (
                      <tr
                        key={r.studentId}
                        className={`hover:bg-slate-50 transition-colors ${
                          isTopThree ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-bold font-mono">
                          {isTopThree ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs">
                              {r.position}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">{r.position}</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-900">
                          {r.rollNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{r.studentName}</div>
                          <div className="text-[11px] text-slate-400">
                            Father: {r.fatherName} · {r.admissionNumber}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-slate-800">
                          {r.totalObtained} / {r.totalMaximum}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                          {r.percentage}%
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                              r.overallGrade === 'A+' || r.overallGrade === 'A'
                                ? 'bg-emerald-100 text-emerald-800'
                                : r.overallGrade === 'F'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {r.overallGrade}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                              r.status === 'Passed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => onPrintReportCard(r.studentId, exam.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-[11px] font-medium transition-colors shadow-xs"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Report Card</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Pakistani Board Grading: A+ (≥80%), A (≥70%), B (≥60%), C (≥50%), D (≥40%), E (≥33%), F (&lt;33%)
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium"
          >
            Close Gazette
          </button>
        </div>
      </div>
    </div>
  );
};
