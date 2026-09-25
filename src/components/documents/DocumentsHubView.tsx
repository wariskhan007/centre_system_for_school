import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Award,
  IdCard,
  UserCheck,
  CheckCircle,
  GraduationCap,
  School,
  Download,
  Users,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';

interface DocumentsHubViewProps {
  onOpenCertificateModal: (docType: string, studentId?: string) => void;
  onOpenIdCardModal: (cardType: 'student' | 'staff', targetId?: string) => void;
}

export const DocumentsHubView: React.FC<DocumentsHubViewProps> = ({
  onOpenCertificateModal,
  onOpenIdCardModal,
}) => {
  const { students, staff, classes, settings } = useApp();
  const [activeTab, setActiveTab] = useState<'id_cards' | 'certificates'>('id_cards');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id || '');

  const certificatesList = [
    {
      id: 'slc',
      title: 'School Leaving Certificate (SLC)',
      description: 'Official Pakistani government-compliant withdrawal certificate stating character, conduct, academic standing, and date of birth.',
      icon: Award,
      badge: 'Official Seal',
      color: 'emerald',
    },
    {
      id: 'bonafide',
      title: 'Bonafide Student Certificate',
      description: 'Certifies active regular enrollment for passport, visa, B-Form verification, scholarship, or national bank account issuance.',
      icon: CheckCircle,
      badge: 'Enrollment',
      color: 'blue',
    },
    {
      id: 'character',
      title: 'Character & Conduct Certificate',
      description: 'Official testimonial testifying to student moral standing, institutional discipline, and extracurricular involvement.',
      icon: GraduationCap,
      badge: 'Testimonial',
      color: 'purple',
    },
    {
      id: 'merit_list',
      title: 'Merit & Tabulation Certificate',
      description: 'Formal academic honor certificate commemorating exceptional grades, top positions, and board exam distinctions.',
      icon: FileText,
      badge: 'Honors',
      color: 'amber',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Document Center & ID Card Studio
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate, preview, and print government-compliant student/staff ID cards and official institutional certificates for {settings?.name || 'Splended Education System'}.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-xs self-start">
          <button
            onClick={() => setActiveTab('id_cards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'id_cards'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <IdCard className="w-4 h-4" />
            <span>Identity Cards</span>
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'certificates'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Official Certificates</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: IDENTITY CARDS (CARD VIEW ONLY)                     */}
      {/* ============================================================== */}
      {activeTab === 'id_cards' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-800 text-white">
                  Card Format Only
                </span>
                <span className="text-xs font-bold text-emerald-950">
                  Standard CR80 Laminated ID Card Badges
                </span>
              </div>
              <p className="text-xs text-emerald-900/80 leading-relaxed max-w-2xl">
                Front and back badge format for students and faculty. Rendered with campus instructions, residential addresses, emergency contacts, barcodes, and scannable QR verification.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Student ID Card Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between hover:border-emerald-500/60 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Student Badge
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-4">
                  Student Identity Card (Front & Back)
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Compact CR80 identity card featuring student photograph, Roll number, Admission ID, B-Form number, Blood group, and parent emergency contact.
                </p>

                {/* Target student selector */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <label className="block text-slate-600 font-semibold text-xs mb-1.5">
                    Select Target Student:
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-emerald-600 focus:bg-white"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.admissionNumber} - Roll #{s.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">CR80 Plastic Badge</span>
                <button
                  onClick={() => onOpenIdCardModal('student', selectedStudentId)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <IdCard className="w-4 h-4" />
                  <span>Open & Print Student ID Card</span>
                </button>
              </div>
            </div>

            {/* Faculty & Staff ID Card Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between hover:border-emerald-500/60 transition-colors">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Staff Badge
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-4">
                  Faculty & Staff Identity Card
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Official employee identity badge containing Employee ID, Department, BPS Pay Scale, CNIC number, Blood group, and campus security authorization.
                </p>

                {/* Target staff selector */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <label className="block text-slate-600 font-semibold text-xs mb-1.5">
                    Select Faculty / Staff Member:
                  </label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 outline-none focus:border-blue-600 focus:bg-white"
                  >
                    {staff.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.employeeId} - {m.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">CR80 Plastic Badge</span>
                <button
                  onClick={() => onOpenIdCardModal('staff', selectedStaffId)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <IdCard className="w-4 h-4" />
                  <span>Open & Print Staff ID Card</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: OFFICIAL INSTITUTIONAL CERTIFICATES (A4 FORMAT)     */}
      {/* ============================================================== */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          {/* Target Student Selection Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex-1 max-w-md">
              <label className="block text-slate-700 font-bold mb-1">
                Select Student for Institutional Certificate
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-medium bg-slate-50 text-slate-800 focus:border-emerald-600 focus:bg-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.admissionNumber} - Roll #{s.rollNumber})
                  </option>
                ))}
              </select>
            </div>
            <div className="text-slate-500 text-xs sm:text-right">
              <div>Institution: <strong className="text-slate-800">{settings?.name || 'Splended Education System'}</strong></div>
              <div>EMIS Code: <strong className="text-slate-800 font-mono">{settings?.emisCode || '25010492'}</strong></div>
            </div>
          </div>

          {/* Certificate Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificatesList.map((doc) => {
              const Icon = doc.icon;
              return (
                <div
                  key={doc.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {doc.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mt-3.5">{doc.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{doc.description}</p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium font-sans">A4 Government Format</span>
                    <button
                      onClick={() => onOpenCertificateModal(doc.id, selectedStudentId)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Generate & Print</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
