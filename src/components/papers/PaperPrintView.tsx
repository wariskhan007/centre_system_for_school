import React from 'react';
import { X, Printer, Download, Copy, School } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { QuestionPaper } from '../../types/index.ts';
import { formatDate } from '../../utils/formatters.ts';

interface PaperPrintViewProps {
  paper: QuestionPaper | null;
  onClose: () => void;
}

export const PaperPrintView: React.FC<PaperPrintViewProps> = ({ paper, onClose }) => {
  const { classes, subjects, settings } = useApp();

  if (!paper) return null;

  const className = classes.find((c) => c.id === paper.classId)?.name || 'Class 9';
  const subject = subjects.find((s) => s.id === paper.subjectId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Examination Paper Print Preview (A4 Pakistani Board Layout)
            </h3>
            <p className="text-xs text-slate-500">
              All UI controls and navigation are hidden during printing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Question Paper</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document (A4 Styling) */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white text-slate-900 print:p-0 print:m-0 print:overflow-visible font-serif">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
            <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
              {settings?.name || 'ABC SCHOOL'}
            </h1>
            <p className="text-xs font-medium text-slate-600 uppercase tracking-widest mt-0.5">
              {settings?.address || 'XYZ'} · {settings?.province || 'PAKISTAN'}
            </p>
            <h2 className="text-base font-bold uppercase mt-2 text-slate-900 tracking-tight">
              {paper.title || 'ANNUAL EXAMINATION 2026'}
            </h2>
          </div>

          {/* Exam Specs Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans font-medium border-b border-slate-300 pb-2 mb-3">
            <div>Class: <strong className="font-bold">{className}</strong></div>
            <div>Subject: <strong className="font-bold">{subject?.name || 'Mathematics'}</strong></div>
            <div>Time Allowed: <strong className="font-bold">{paper.durationMinutes} Minutes</strong></div>
            <div className="text-right sm:text-left">Total Marks: <strong className="font-bold font-mono">{paper.totalMarks}</strong></div>
          </div>

          {/* Student Info Lines */}
          <div className="flex items-center justify-between text-xs font-sans border-b border-slate-300 pb-2 mb-4">
            <div className="flex-1">
              Student Name: <span className="inline-block border-b border-dotted border-slate-400 w-48 sm:w-64 ml-1"></span>
            </div>
            <div>
              Roll Number: <span className="inline-block border-b border-dotted border-slate-400 w-24 sm:w-32 ml-1"></span>
            </div>
          </div>

          {/* General Instructions */}
          {paper.instructions && (
            <div className="text-[11px] font-sans italic text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 mb-6 print:bg-transparent print:border-none print:p-0">
              <strong className="not-italic font-bold font-serif block mb-0.5">INSTRUCTIONS:</strong>
              <div className="whitespace-pre-line">{paper.instructions}</div>
            </div>
          )}

          {/* Exam Sections */}
          <div className="space-y-6">
            {paper.sections.map((sec, secIdx) => {
              const secTotalMarks = sec.questionIds.reduce(
                (sum, q) => sum + Number(q.marks || 0),
                0
              );

              return (
                <div key={sec.id} className="space-y-3">
                  {/* Section Title Bar */}
                  <div className="border-b border-slate-900 pb-1 flex justify-between items-baseline">
                    <h3 className="font-black text-sm uppercase tracking-wide">
                      {sec.title}
                    </h3>
                    <span className="font-sans font-bold text-xs">
                      (Marks: {secTotalMarks})
                    </span>
                  </div>

                  {sec.instructions && (
                    <p className="text-xs italic text-slate-700 font-sans">
                      {sec.instructions}
                    </p>
                  )}

                  {/* Section Questions */}
                  <div className="space-y-3 pl-2">
                    {sec.questionIds.map((q, qIdx) => (
                      <div key={q.questionId + qIdx} className="text-xs leading-relaxed space-y-1">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <span className="font-bold mr-1.5 font-sans">Q{qIdx + 1}.</span>
                            <span className="whitespace-pre-line text-slate-900">
                              {q.customQuestionText}
                            </span>
                          </div>
                          <span className="font-sans font-semibold text-slate-700 shrink-0">
                            ({q.marks})
                          </span>
                        </div>

                        {/* MCQ Options Display */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 pl-4 font-sans text-xs">
                            {q.options.map((opt, optIdx) => (
                              <div key={optIdx} className="flex items-center gap-1.5">
                                <span className="font-bold">({['a', 'b', 'c', 'd'][optIdx]})</span>
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* End of paper marker */}
          <div className="mt-12 text-center text-xs font-sans tracking-widest text-slate-400 uppercase">
            *** END OF EXAMINATION PAPER ***
          </div>
        </div>
      </div>
    </div>
  );
};
