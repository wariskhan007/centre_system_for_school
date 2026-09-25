import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Sparkles,
  Save,
  CheckCircle,
  Copy,
  ArrowUpDown,
  BookOpen,
  Calendar,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { ExamType, QuestionPaper, QuestionPaperSection } from '../../types/index.ts';

interface PaperGeneratorViewProps {
  onOpenAiGenerator: () => void;
  onPreviewPrint: (paper: QuestionPaper) => void;
}

export const PaperGeneratorView: React.FC<PaperGeneratorViewProps> = ({
  onOpenAiGenerator,
  onPreviewPrint,
}) => {
  const { questionPapers, classes, subjects, academicYears, questionBank, refreshAllData, showToast } = useApp();

  const [activePaper, setActivePaper] = useState<QuestionPaper>(
    questionPapers[0] || {
      id: '',
      academicYearId: 'ay-2026-2027',
      classId: 'cls-9',
      subjectId: 'sub-mth',
      examType: 'Mid Term',
      title: 'Mid-Term Examination 2026 — Mathematics (SSC-I)',
      totalMarks: 50,
      durationMinutes: 90,
      examDate: new Date().toISOString().split('T')[0],
      instructions: '1. Write your Roll Number and Name clearly.\n2. Overwriting or cutting will not be credited.\n3. Calculator is permitted where permissible by board regulations.',
      sections: [
        {
          id: 'sec-a',
          title: 'SECTION A — MULTIPLE CHOICE QUESTIONS',
          instructions: 'Attempt all questions. Each question carries 1 mark.',
          questionIds: [],
        },
        {
          id: 'sec-b',
          title: 'SECTION B — SHORT QUESTIONS',
          instructions: 'Attempt any SIX questions. Each question carries 4 marks.',
          questionIds: [],
        },
        {
          id: 'sec-c',
          title: 'SECTION C — LONG / DETAILED QUESTIONS',
          instructions: 'Attempt any TWO questions. Each question carries 8 marks.',
          questionIds: [],
        },
      ],
      status: 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [showQuestionPickerSectionId, setShowQuestionPickerSectionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Recalculate total marks automatically across all sections
  const computedTotalMarks = activePaper.sections.reduce((total, sec) => {
    return total + sec.questionIds.reduce((secTotal, q) => secTotal + Number(q.marks || 0), 0);
  }, 0);

  const handleAddSection = () => {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const nextIdx = activePaper.sections.length;
    const letter = letters[nextIdx] || 'X';

    const newSec: QuestionPaperSection = {
      id: 'sec-' + Date.now(),
      title: `SECTION ${letter} — NEW SECTION`,
      instructions: 'Attempt all questions.',
      questionIds: [],
    };

    setActivePaper((prev) => ({
      ...prev,
      sections: [...prev.sections, newSec],
    }));
  };

  const handleDeleteSection = (secId: string) => {
    setActivePaper((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== secId),
    }));
  };

  const handleUpdateSectionTitle = (secId: string, title: string) => {
    setActivePaper((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === secId ? { ...s, title } : s)),
    }));
  };

  const handleUpdateSectionInstructions = (secId: string, instructions: string) => {
    setActivePaper((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === secId ? { ...s, instructions } : s)),
    }));
  };

  const handleAddQuestionToSection = (secId: string, qItem: any) => {
    setActivePaper((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== secId) return s;
        return {
          ...s,
          questionIds: [
            ...s.questionIds,
            {
              questionId: qItem.id,
              marks: qItem.marks || 1,
              customQuestionText: qItem.questionText,
              options: qItem.options,
              answer: qItem.answer,
            },
          ],
        };
      }),
    }));
    setShowQuestionPickerSectionId(null);
  };

  const handleAddCustomQuestion = (secId: string) => {
    setActivePaper((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== secId) return s;
        return {
          ...s,
          questionIds: [
            ...s.questionIds,
            {
              questionId: 'custom-' + Date.now(),
              marks: 2,
              customQuestionText: 'New question prompt...',
            },
          ],
        };
      }),
    }));
  };

  const handleUpdateQuestion = (secId: string, qIndex: number, text: string, marks: number) => {
    setActivePaper((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== secId) return s;
        const nextQ = [...s.questionIds];
        nextQ[qIndex] = {
          ...nextQ[qIndex],
          customQuestionText: text,
          marks,
        };
        return { ...s, questionIds: nextQ };
      }),
    }));
  };

  const handleDeleteQuestion = (secId: string, qIndex: number) => {
    setActivePaper((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => {
        if (s.id !== secId) return s;
        const nextQ = [...s.questionIds];
        nextQ.splice(qIndex, 1);
        return { ...s, questionIds: nextQ };
      }),
    }));
  };

  const handleSavePaper = async () => {
    setSaving(true);
    try {
      const payload = {
        ...activePaper,
        totalMarks: computedTotalMarks,
      };

      const url = activePaper.id ? `/api/papers/${activePaper.id}` : '/api/papers';
      const method = activePaper.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save paper');

      const saved = await res.json();
      setActivePaper(saved);
      await refreshAllData();
      showToast('Question paper saved successfully!', 'success');
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Filter repository questions for picker
  const availableQuestions = questionBank.filter(
    (q) => q.subjectId === activePaper.subjectId
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Question Paper Generator</h2>
          <p className="text-xs text-slate-500">
            Design official Pakistani Board examination papers with Section A (MCQs), Section B (Short), and Section C (Long).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAiGenerator}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Draft Generator</span>
          </button>

          <button
            onClick={() => onPreviewPrint(activePaper)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Preview & Print A4</span>
          </button>

          <button
            onClick={handleSavePaper}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-lg shadow-xs disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Paper'}</span>
          </button>
        </div>
      </div>

      {/* Paper Metadata Form */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-2">
            <label className="block text-slate-700 font-semibold mb-1">Examination Title</label>
            <input
              type="text"
              value={activePaper.title}
              onChange={(e) => setActivePaper({ ...activePaper, title: e.target.value })}
              className="w-full px-3 py-1.5 font-semibold text-slate-900 border border-slate-200 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Class / Grade</label>
            <select
              value={activePaper.classId}
              onChange={(e) => setActivePaper({ ...activePaper, classId: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Subject</label>
            <select
              value={activePaper.subjectId}
              onChange={(e) => setActivePaper({ ...activePaper, subjectId: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none font-semibold text-emerald-900"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Exam Type</label>
            <select
              value={activePaper.examType}
              onChange={(e) => setActivePaper({ ...activePaper, examType: e.target.value as ExamType })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
            >
              <option value="Mid Term">Mid Term</option>
              <option value="Final Term">Final Term</option>
              <option value="Annual Exam">Annual Exam</option>
              <option value="Monthly Test">Monthly Test</option>
              <option value="Pre-Board">Pre-Board</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Time Allowed (Minutes)</label>
            <input
              type="number"
              value={activePaper.durationMinutes}
              onChange={(e) => setActivePaper({ ...activePaper, durationMinutes: Number(e.target.value) })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Exam Date</label>
            <input
              type="date"
              value={activePaper.examDate}
              onChange={(e) => setActivePaper({ ...activePaper, examDate: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
            />
          </div>

          <div className="flex flex-col justify-end">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <span className="text-slate-500 font-medium">Total Marks:</span>
              <span className="font-mono font-bold text-sm text-emerald-800">
                {computedTotalMarks} Marks
              </span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">General Instructions</label>
          <textarea
            rows={2}
            value={activePaper.instructions}
            onChange={(e) => setActivePaper({ ...activePaper, instructions: e.target.value })}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-slate-700"
          />
        </div>
      </div>

      {/* Sections Builder */}
      <div className="space-y-4">
        {activePaper.sections.map((section, sIndex) => {
          const sectionTotal = section.questionIds.reduce((sum, q) => sum + Number(q.marks || 0), 0);

          return (
            <div
              key={section.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
            >
              {/* Section Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                    className="w-full font-bold text-slate-900 bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded px-1.5 py-0.5"
                  />
                  <input
                    type="text"
                    value={section.instructions}
                    onChange={(e) => handleUpdateSectionInstructions(section.id, e.target.value)}
                    placeholder="Section instructions (e.g. Attempt any 6 questions...)"
                    className="w-full text-slate-500 bg-transparent outline-none focus:bg-white rounded px-1.5 py-0.5"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                    {sectionTotal} Marks
                  </span>
                  <button
                    onClick={() => setShowQuestionPickerSectionId(section.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-md font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>From Bank</span>
                  </button>
                  <button
                    onClick={() => handleAddCustomQuestion(section.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Custom</span>
                  </button>
                  {activePaper.sections.length > 1 && (
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Delete Section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Questions List in Section */}
              <div className="p-4 space-y-3 text-xs">
                {section.questionIds.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                    No questions in this section yet. Add from Question Bank or write custom question.
                  </div>
                ) : (
                  section.questionIds.map((q, qIndex) => (
                    <div
                      key={q.questionId + qIndex}
                      className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg flex items-start gap-3 group"
                    >
                      <span className="font-bold text-slate-500 font-mono mt-1">
                        Q{qIndex + 1}.
                      </span>

                      <div className="flex-1 space-y-1.5">
                        <textarea
                          rows={2}
                          value={q.customQuestionText || ''}
                          onChange={(e) =>
                            handleUpdateQuestion(section.id, qIndex, e.target.value, q.marks)
                          }
                          className="w-full bg-white border border-slate-200 rounded-md p-2 text-slate-800 font-medium outline-none focus:border-emerald-600"
                        />

                        {/* Options if MCQ */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            {q.options.map((opt, i) => (
                              <div key={i} className="p-1.5 bg-white border border-slate-200 rounded text-slate-700">
                                <strong className="mr-1">{['A', 'B', 'C', 'D'][i]}.</strong>
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <input
                            type="number"
                            min={1}
                            value={q.marks}
                            onChange={(e) =>
                              handleUpdateQuestion(
                                section.id,
                                qIndex,
                                q.customQuestionText || '',
                                Number(e.target.value)
                              )
                            }
                            className="w-full text-center px-1.5 py-1 bg-white border border-slate-200 rounded font-mono font-bold"
                          />
                          <span className="text-[10px] text-slate-400 block text-center mt-0.5">Marks</span>
                        </div>

                        <button
                          onClick={() => handleDeleteQuestion(section.id, qIndex)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="Remove Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}

        <button
          onClick={handleAddSection}
          className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl text-xs font-semibold text-slate-500 hover:text-emerald-800 transition-colors flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Examination Section</span>
        </button>
      </div>

      {/* Question Picker from Bank Modal */}
      {showQuestionPickerSectionId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Select Question from Bank</h3>
              <button onClick={() => setShowQuestionPickerSectionId(null)} className="text-slate-400">✕</button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2 text-xs flex-1">
              {availableQuestions.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  No questions saved in Question Bank for this subject yet.
                </div>
              ) : (
                availableQuestions.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => handleAddQuestionToSection(showQuestionPickerSectionId, q)}
                    className="p-3 border border-slate-200 rounded-lg hover:border-emerald-500 hover:bg-emerald-50/30 cursor-pointer transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{q.chapter}</span>
                      <span className="font-mono font-bold text-emerald-800">{q.marks} Marks ({q.questionType})</span>
                    </div>
                    <p className="text-slate-700">{q.questionText}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
