import React, { useState } from 'react';
import { FileQuestion, Plus, Search, Filter, Sparkles, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { DifficultyLevel, QuestionBankItem, QuestionType } from '../../types/index.ts';

interface QuestionBankViewProps {
  onOpenAiGenerator: () => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({ onOpenAiGenerator }) => {
  const { questionBank, subjects, classes, refreshAllData, showToast, currentUser } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);

  // Add Question form
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'sub-mth');
  const [classId, setClassId] = useState(classes[0]?.id || 'cls-9');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [questionType, setQuestionType] = useState<QuestionType>('Short Question');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [answer, setAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  const filteredQuestions = questionBank.filter((q) => {
    const matchesSubject = selectedSubjectId === 'all' || q.subjectId === selectedSubjectId;
    const matchesClass = selectedClassId === 'all' || q.classId === selectedClassId;
    const matchesDifficulty = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    const matchesType = selectedType === 'all' || q.questionType === selectedType;
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      q.questionText.toLowerCase().includes(query) ||
      q.chapter.toLowerCase().includes(query) ||
      (q.topic && q.topic.toLowerCase().includes(query));

    return matchesSubject && matchesClass && matchesDifficulty && matchesType && matchesSearch;
  });

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/question-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectId,
          classId,
          chapter: chapter.trim() || 'General',
          topic: topic.trim(),
          difficulty,
          questionType,
          questionText: questionText.trim(),
          options: questionType === 'MCQ' ? options.filter(Boolean) : undefined,
          answer: answer.trim(),
          explanation: explanation.trim(),
          marks: Number(marks) || 1,
          isApproved: true,
        }),
      });

      if (res.ok) {
        await refreshAllData();
        showToast('Question added to Question Bank', 'success');
        setShowAddModal(false);
        setQuestionText('');
        setAnswer('');
      }
    } catch {
      showToast('Error saving question', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await fetch(`/api/question-bank/${id}`, { method: 'DELETE' });
      await refreshAllData();
      showToast('Question removed from repository', 'info');
    } catch {
      showToast('Failed to delete question', 'error');
    }
  };

  const getSubjectName = (sId: string) => subjects.find((s) => s.id === sId)?.name || 'Subject';
  const getClassName = (cId: string) => classes.find((c) => c.id === cId)?.name || 'Class';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Curriculum Question Bank</h2>
          <p className="text-xs text-slate-500">
            Searchable repository of BISE board examination questions tagged by chapter, topic, and difficulty.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAiGenerator}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI Question Generator</span>
          </button>

          {currentUser.permissions.includes('manage_exams') && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions by chapter, topic, or keyword..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 focus:bg-white text-slate-800"
          />
        </div>

        <div>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
          >
            <option value="all">All Question Types</option>
            <option value="MCQ">MCQ</option>
            <option value="Short Question">Short Question</option>
            <option value="Long Question">Long Question</option>
            <option value="Fill in the Blank">Fill in the Blank</option>
            <option value="True/False">True/False</option>
          </select>
        </div>

        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-xl">
            {questionBank.length === 0
              ? 'No questions in the repository. Use the AI Question Generator or click "Add Question".'
              : 'No questions match the current filter.'}
          </div>
        ) : (
          filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors space-y-2 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                    {getSubjectName(q.subjectId)}
                  </span>
                  <span className="text-slate-500 font-medium">{getClassName(q.classId)}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600 font-medium">{q.chapter}</span>
                  {q.topic && <span className="text-slate-400">({q.topic})</span>}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      q.difficulty === 'Easy'
                        ? 'bg-emerald-50 text-emerald-700'
                        : q.difficulty === 'Medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                  </span>
                  <span className="font-semibold text-slate-600 text-[11px]">{q.questionType}</span>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="font-medium text-slate-900 whitespace-pre-line text-sm leading-relaxed">
                {q.questionText}
              </div>

              {/* MCQ Options */}
              {q.questionType === 'MCQ' && q.options && q.options.length > 0 && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, idx) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const isCorrect = q.answer === opt;
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                          isCorrect
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center font-bold text-[10px]">
                          {letters[idx]}
                        </span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Answer Key / Solution */}
              {q.answer && q.questionType !== 'MCQ' && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-[11px]">
                  <strong className="text-slate-900 block mb-0.5">Model Answer / Solution:</strong>
                  <div className="whitespace-pre-line">{q.answer}</div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Add to Question Bank</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleAddQuestion} className="p-5 space-y-3 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Class</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Chapter / Unit</label>
                  <input
                    type="text"
                    required
                    value={chapter}
                    onChange={(e) => setChapter(e.target.value)}
                    placeholder="e.g. Unit 1: Matrices"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Cramer's Rule"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Question Type</label>
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="MCQ">MCQ</option>
                    <option value="Short Question">Short Question</option>
                    <option value="Long Question">Long Question</option>
                    <option value="Fill in the Blank">Fill in the Blank</option>
                    <option value="True/False">True/False</option>
                    <option value="Numerical">Numerical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Marks</label>
                  <input
                    type="number"
                    value={marks}
                    onChange={(e) => setMarks(Number(e.target.value))}
                    className="w-full px-3 py-1.5 font-mono border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Question Text <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Enter the complete question prompt..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              {questionType === 'MCQ' && (
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-semibold text-slate-800 block">MCQ Options</span>
                  <div className="grid grid-cols-2 gap-2">
                    {options.map((opt, i) => (
                      <input
                        key={i}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const next = [...options];
                          next[i] = e.target.value;
                          setOptions(next);
                        }}
                        placeholder={`Option ${['A', 'B', 'C', 'D'][i]}`}
                        className="px-2 py-1 bg-white border border-slate-300 rounded"
                      />
                    ))}
                  </div>
                  <div>
                    <label className="block text-slate-600 font-medium mb-0.5">Correct Option Text</label>
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Exact correct answer"
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded"
                    />
                  </div>
                </div>
              )}

              {questionType !== 'MCQ' && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Model Solution / Key</label>
                  <textarea
                    rows={2}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Expected model answer..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 font-medium"
                >
                  {submitting ? 'Saving...' : 'Save to Question Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
