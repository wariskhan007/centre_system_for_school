import React, { useState, useEffect } from 'react';
import { Search, X, User, GraduationCap, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { students, staff, classes, setSelectedStudentId, setCurrentView } = useApp();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingStudents = q
    ? students
        .filter(
          (s) =>
            s.fullName.toLowerCase().includes(q) ||
            s.admissionNumber.toLowerCase().includes(q) ||
            s.rollNumber.toLowerCase().includes(q) ||
            s.fatherName.toLowerCase().includes(q) ||
            s.bFormNumber.toLowerCase().includes(q) ||
            s.fatherCnic.toLowerCase().includes(q)
        )
        .slice(0, 8)
    : [];

  const matchingStaff = q
    ? staff
        .filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.employeeId.toLowerCase().includes(q) ||
            m.cnic.toLowerCase().includes(q) ||
            m.designation.toLowerCase().includes(q)
        )
        .slice(0, 5)
    : [];

  const getClassName = (clsId: string) => {
    return classes.find((c) => c.id === clsId)?.name || 'Class';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Input bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student name, father name, B-Form, CNIC, roll no, or staff..."
            className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline px-2 py-0.5 text-[10px] font-medium bg-slate-100 border border-slate-200 rounded text-slate-500">
            ESC to close
          </kbd>
        </div>

        {/* Results area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {!query && (
            <div className="py-8 text-center text-slate-400">
              Type to search Pakistani student records, B-Form, CNIC, staff, or admissions.
            </div>
          )}

          {query && matchingStudents.length === 0 && matchingStaff.length === 0 && (
            <div className="py-8 text-center text-slate-500">
              No matching records found for <span className="font-semibold text-slate-700">"{query}"</span>
            </div>
          )}

          {matchingStudents.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Students ({matchingStudents.length})
              </div>
              <div className="space-y-1">
                {matchingStudents.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      setSelectedStudentId(s.id);
                      setCurrentView('students');
                      onClose();
                    }}
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 group-hover:text-emerald-900 flex items-center gap-2">
                          <span>{s.fullName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Roll #{s.rollNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Class: {getClassName(s.currentClassId)}</span>
                          <span>·</span>
                          <span>Father: {s.fatherName}</span>
                          <span>·</span>
                          <span className="font-mono text-slate-400">{s.admissionNumber}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-700 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchingStaff.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Staff & Faculty ({matchingStaff.length})
              </div>
              <div className="space-y-1">
                {matchingStaff.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setCurrentView('staff');
                      onClose();
                    }}
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 cursor-pointer flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 group-hover:text-blue-900">
                          {m.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>{m.designation}</span>
                          <span>·</span>
                          <span>{m.department}</span>
                          <span>·</span>
                          <span className="font-mono">{m.employeeId}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-700 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
