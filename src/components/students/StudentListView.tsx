import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Filter,
  Download,
  Eye,
  Edit2,
  UserMinus,
  ArrowRightLeft,
  FileText,
  User,
  CheckCircle2,
  AlertCircle,
  IdCard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { Student } from '../../types/index.ts';
import { EditStudentModal } from './EditStudentModal.tsx';

interface StudentListViewProps {
  onAddStudent: () => void;
  onOpenProfile: (studentId: string) => void;
  onOpenWithdrawal: (studentId: string) => void;
  onOpenIdCard?: (studentId: string) => void;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  onAddStudent,
  onOpenProfile,
  onOpenWithdrawal,
  onOpenIdCard,
}) => {
  const { students, classes, sections, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const getClassName = (classId: string) => {
    return classes.find((c) => c.id === classId)?.name || classId;
  };

  const getSectionName = (secId: string) => {
    return sections.find((s) => s.id === secId)?.name || 'Section';
  };

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.admissionNumber.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.fatherName.toLowerCase().includes(q) ||
      s.bFormNumber?.toLowerCase().includes(q) ||
      s.fatherCnic?.toLowerCase().includes(q);

    const matchesClass = selectedClass === 'all' || s.currentClassId === selectedClass;
    const matchesSection = selectedSection === 'all' || s.currentSectionId === selectedSection;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;

    return matchesSearch && matchesClass && matchesSection && matchesStatus;
  });

  const statusBadges: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
    withdrawn: { label: 'Withdrawn', color: 'bg-rose-50 text-rose-800 border-rose-300' },
    migrated: { label: 'Migrated', color: 'bg-amber-50 text-amber-800 border-amber-300' },
    transferred: { label: 'Transferred', color: 'bg-blue-50 text-blue-800 border-blue-300' },
    new: { label: 'New Admission', color: 'bg-indigo-50 text-indigo-800 border-indigo-300' },
    readmitted: { label: 'Re-admitted', color: 'bg-teal-50 text-teal-800 border-teal-300' },
  };

  return (
    <div className="space-y-4">
      {/* Header with Title and Registration Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Student Information Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered student records, admissions data, and academic class assignments. Click Edit to modify data.
          </p>
        </div>

        <button
          onClick={onAddStudent}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Name, B-Form, Roll, Father CNIC..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 focus:bg-white text-slate-800 font-medium"
          />
        </div>

        {/* Class Filter */}
        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 text-slate-800 font-medium"
          >
            <option value="all">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Section Filter */}
        <div>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 text-slate-800 font-medium"
          >
            <option value="all">All Sections</option>
            {sections.map((sec) => (
              <option key={sec.id} value={sec.id}>
                Section {sec.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-600 text-slate-800 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="withdrawn">Withdrawn (SLC)</option>
            <option value="migrated">Migrated</option>
            <option value="transferred">Transferred</option>
            <option value="new">New Student</option>
            <option value="readmitted">Re-admitted</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="py-16 text-center">
            <User className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-800">
              No students found
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {students.length === 0
                ? 'No students have been enrolled yet. Click "Register New Student" or load Pakistani demo data.'
                : 'No student matches your current filter criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Student & Roll</th>
                  <th className="py-3 px-4">Admission No</th>
                  <th className="py-3 px-4">Class & Section</th>
                  <th className="py-3 px-4">Father Name & CNIC</th>
                  <th className="py-3 px-4">B-Form No</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.map((student) => {
                  const badge = statusBadges[student.status] || {
                    label: student.status,
                    color: 'bg-slate-50 text-slate-700 border-slate-300',
                  };
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Name & Roll */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-xs shadow-2xs">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {student.fullName}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">
                              Roll #{student.rollNumber} · {student.gender}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Admission No */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {student.admissionNumber}
                      </td>

                      {/* Class & Section */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {getClassName(student.currentClassId)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {getSectionName(student.currentSectionId)}
                        </div>
                      </td>

                      {/* Father info */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{student.fatherName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {student.fatherCnic || 'No CNIC'}
                        </div>
                      </td>

                      {/* B-Form */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 font-medium">
                        {student.bFormNumber || '—'}
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {student.fatherContact || '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Student Button with clear icon */}
                          <button
                            onClick={() => setEditingStudent(student)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition-colors border border-emerald-200 cursor-pointer shadow-2xs"
                            title="Edit student details, class, roll number, or status"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* ID Card Button */}
                          {onOpenIdCard && (
                            <button
                              onClick={() => onOpenIdCard(student.id)}
                              className="p-1.5 text-slate-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200"
                              title="Generate & Print Student ID Card"
                            >
                              <IdCard className="w-4 h-4" />
                            </button>
                          )}

                          {/* View Full Profile */}
                          <button
                            onClick={() => onOpenProfile(student.id)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Full Student Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Withdraw Button */}
                          {student.status === 'active' && (
                            <button
                              onClick={() => onOpenWithdrawal(student.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Withdraw Student (SLC)"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}
    </div>
  );
};
