import React, { useState } from 'react';
import { Layers, Plus, Users, DoorOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

export const ClassesSectionsView: React.FC = () => {
  const { classes, sections, students, refreshAllData, showToast, currentUser } = useApp();
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);

  // New Class Form
  const [className, setClassName] = useState('');
  const [level, setLevel] = useState<'Primary' | 'Middle' | 'High / SSC' | 'Intermediate / HSSC' | 'Pre-School'>('Primary');

  // New Section Form
  const [sectionName, setSectionName] = useState('');
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || '');
  const [capacity, setCapacity] = useState(40);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;

    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: className.trim(),
          numericOrder: classes.length + 1,
          level,
        }),
      });

      if (res.ok) {
        await refreshAllData();
        showToast(`Class "${className}" created successfully`, 'success');
        setClassName('');
        setShowClassModal(false);
      }
    } catch {
      showToast('Error creating class', 'error');
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim() || !selectedClassId) return;

    try {
      const res = await fetch('/api/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: sectionName.trim(),
          classId: selectedClassId,
          capacity: Number(capacity) || 40,
        }),
      });

      if (res.ok) {
        await refreshAllData();
        showToast(`Section "${sectionName}" created`, 'success');
        setSectionName('');
        setShowSectionModal(false);
      }
    } catch {
      showToast('Error creating section', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Classes & Sections</h2>
          <p className="text-xs text-slate-500">
            Pakistani school grade levels: Pre-School, Primary, Middle, SSC (Matric 9-10), and HSSC (Intermediate 11-12).
          </p>
        </div>

        {currentUser.permissions.includes('create') && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSectionModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Section</span>
            </button>
            <button
              onClick={() => setShowClassModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Class</span>
            </button>
          </div>
        )}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const classSections = sections.filter((s) => s.classId === cls.id);
          const studentCount = students.filter(
            (s) => s.currentClassId === cls.id && s.status === 'active'
          ).length;

          return (
            <div
              key={cls.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {cls.level}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-semibold text-slate-800">{studentCount}</span> students
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-2">{cls.name}</h3>

                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Sections ({classSections.length})
                  </div>
                  {classSections.length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No sections created yet</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {classSections.map((sec) => (
                        <span
                          key={sec.id}
                          className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 font-medium"
                        >
                          {sec.name} (Cap: {sec.capacity})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Add New Class</h3>
              <button onClick={() => setShowClassModal(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleAddClass} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Class 9 (SSC-I) or HSSC-I"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as typeof level)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                >
                  <option value="Pre-School">Pre-School (Playgroup/Nursery)</option>
                  <option value="Primary">Primary (Class 1-5)</option>
                  <option value="Middle">Middle (Class 6-8)</option>
                  <option value="High / SSC">High / SSC (Class 9-10)</option>
                  <option value="Intermediate / HSSC">Intermediate / HSSC (Class 11-12)</option>
                </select>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 font-medium"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showSectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Add Section</h3>
              <button onClick={() => setShowSectionModal(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleAddSection} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assign to Class</label>
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
                <label className="block text-slate-700 font-semibold mb-1">Section Name</label>
                <input
                  type="text"
                  required
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="e.g. Section A (Jinnah) or Section B"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Student Capacity</label>
                <input
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSectionModal(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 text-white rounded-lg hover:bg-emerald-900 font-medium"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
