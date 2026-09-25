import React, { useState } from 'react';
import { Sparkles, X, Check, RotateCw, CheckCircle, Trash2, Edit3, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { DifficultyLevel, QuestionType } from '../../types/index.ts';

interface AiQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsApproved?: (approved: any[]) => void;
}

interface DraftQuestion {
  id: string;
  questionText: string;
  questionType: string;
  difficulty: string;
  marks: number;
  options?: string[];
  answer?: string;
  explanation?: string;
  isApproved?: boolean;
  isRejected?: boolean;
}

export const AiQuestionModal: React.FC<AiQuestionModalProps> = ({
  isOpen,
  onClose,
  onQuestionsApproved,
}) => {
  const { subjects, classes, refreshAllData, showToast } = useApp();

  const [subject, setSubject] = useState('Mathematics');
  const [className, setClassName] = useState('Class 9');
  const [chapter, setChapter] = useState('Quadratic Equations');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [questionType, setQuestionType] = useState<QuestionType>('MCQ');
  const [count, setCount] = useState(4);

  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          className,
          chapter,
          difficulty,
          questionType,
          count: Number(count),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate questions');
      }

      const data = await res.json();
      const generatedDrafts: DraftQuestion[] = (data.questions || []).map(
        (q: any, idx: number) => ({
          ...q,
          id: 'ai-draft-' + Date.now() + '-' + idx,
          isApproved: false,
          isRejected: false,
        })
      );

      setDrafts(generatedDrafts);
      showToast(`Generated ${generatedDrafts.length} AI draft questions for review`, 'info');
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || 'Error generating questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApprove = (id: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, isApproved: !d.isApproved, isRejected: false } : d
      )
    );
  };

  const handleToggleReject = (id: string) => {
    setDrafts((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, isRejected: !d.isRejected, isApproved: false } : d
      )
    );
  };

  const handleSaveToQuestionBank = async () => {
    const approved = drafts.filter((d) => d.isApproved);
    if (approved.length === 0) {
      showToast('Approve at least one question before saving', 'error');
      return;
    }

    try {
      const targetSub = subjects.find((s) => s.name.toLowerCase().includes(subject.toLowerCase())) || subjects[0];
      const targetCls = classes.find((c) => c.name.toLowerCase().includes(className.toLowerCase())) || classes[0];

      for (const q of approved) {
        await fetch('/api/question-bank', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectId: targetSub.id,
            classId: targetCls.id,
            chapter: chapter.trim() || 'General',
            topic: 'AI Generated Draft',
            difficulty: q.difficulty || 'Medium',
            questionType: q.questionType || 'MCQ',
            questionText: q.questionText,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation,
            marks: q.marks || 1,
            isApproved: true,
            isAiGenerated: true,
          }),
        });
      }

      await refreshAllData();
      showToast(`Saved ${approved.length} approved questions into Question Bank!`, 'success');
      if (onQuestionsApproved) {
        onQuestionsApproved(approved);
      }
      onClose();
    } catch {
      showToast('Error saving approved questions', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">AI Exam Question Generator</h3>
              <p className="text-[11px] text-emerald-300">
                Powered by Gemini 3.8 Flash · Human Review Required
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-300 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Parameters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Mathematics"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Class / Grade</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. Class 9 (SSC-I)"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Chapter / Unit</label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="e.g. Quadratic Equations"
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Question Type</label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value as QuestionType)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none"
            >
              <option value="MCQ">MCQ</option>
              <option value="Short Question">Short Question</option>
              <option value="Long Question">Long Question</option>
              <option value="Fill in the Blank">Fill in the Blank</option>
              <option value="True/False">True/False</option>
              <option value="Numerical">Numerical Problem</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <div className="w-16">
              <label className="block text-slate-700 font-semibold mb-1">Qty</label>
              <input
                type="number"
                min={1}
                max={10}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="flex-1 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{drafts.length > 0 ? 'Regenerate' : 'Generate'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Draft Questions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {drafts.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              Set curriculum parameters above and click "Generate" to create BISE-aligned draft questions.
            </div>
          ) : (
            drafts.map((d, index) => (
              <div
                key={d.id}
                className={`p-4 rounded-xl border transition-colors space-y-2 ${
                  d.isApproved
                    ? 'border-emerald-500 bg-emerald-50/20'
                    : d.isRejected
                    ? 'border-rose-300 bg-rose-50/20 opacity-60'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 font-mono">Q{index + 1}.</span>
                    <span className="font-semibold text-slate-800">{d.questionType}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono text-slate-500">{d.marks} Marks</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleApprove(d.id)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                        d.isApproved
                          ? 'bg-emerald-800 text-white'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{d.isApproved ? 'Approved' : 'Approve'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleReject(d.id)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        d.isRejected
                          ? 'bg-rose-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                      }`}
                    >
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="font-medium text-slate-900 text-sm leading-relaxed">
                  {d.questionText}
                </div>

                {/* MCQ Options */}
                {d.options && d.options.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {d.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded-lg border text-xs ${
                          d.answer === opt
                            ? 'bg-emerald-100/60 border-emerald-300 font-semibold text-emerald-950'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="font-bold mr-1.5">{['A', 'B', 'C', 'D'][i]}.</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer Key */}
                {d.answer && (
                  <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700">
                    <strong className="text-slate-900">Model Answer:</strong> {d.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Approved: <strong className="text-slate-900">{drafts.filter((d) => d.isApproved).length}</strong> of {drafts.length}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveToQuestionBank}
              disabled={drafts.filter((d) => d.isApproved).length === 0}
              className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-medium flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Save Approved Questions</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
