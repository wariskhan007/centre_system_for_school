import React from 'react';
import { X, GraduationCap, Briefcase, Phone, Mail, MapPin, Printer } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { formatDate } from '../../utils/formatters.ts';

interface StaffProfileModalProps {
  staffId: string | null;
  onClose: () => void;
  onPrintCard: (staffId: string) => void;
}

export const StaffProfileModal: React.FC<StaffProfileModalProps> = ({
  staffId,
  onClose,
  onPrintCard,
}) => {
  const { staff } = useApp();

  if (!staffId) return null;
  const member = staff.find((m) => m.id === staffId);
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-xl shadow-sm border border-blue-600">
              {member.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{member.name}</h2>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  {member.status}
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {member.designation} · {member.department}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintCard(member.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Staff ID Card</span>
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block text-[11px]">Employee ID</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{member.employeeId}</span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-400 block text-[11px]">Government / Pay Scale</span>
              <span className="font-mono font-bold text-emerald-800 text-sm">
                {member.bpsPayScale || '—'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-semibold text-slate-900 border-b border-slate-200 pb-1.5">
              Personal & Contact Details
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[11px]">CNIC:</span>
                <span className="font-mono font-medium text-slate-800">{member.cnic}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contact:</span>
                <span className="text-slate-800 font-medium">{member.contact}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email:</span>
                <span className="text-slate-800">{member.email || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Joining Date:</span>
                <span className="text-slate-800">{formatDate(member.joiningDate)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Address:</span>
                <span className="text-slate-800">{member.address || '—'}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h4 className="font-semibold text-slate-900 border-b border-slate-200 pb-1.5">
              Academic & Professional Qualifications
            </h4>
            <div>
              <span className="text-slate-400 block text-[11px]">Degree / Qualification:</span>
              <span className="text-slate-800 font-medium">{member.qualification}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Subject Specialization:</span>
              <span className="text-slate-800">{member.subjectSpecialization || 'General'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Employment Category:</span>
              <span className="text-slate-800">{member.category} ({member.employmentType})</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
