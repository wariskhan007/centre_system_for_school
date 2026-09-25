import React, { useState } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  QrCode,
  ExternalLink,
  Download,
  Users,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { printDocument, openPrintInNewTab, downloadPrintableAsHtml } from '../../utils/printHelpers.ts';

interface IdCardModalProps {
  cardType: 'student' | 'staff';
  targetId?: string;
  onClose: () => void;
}

export const IdCardModal: React.FC<IdCardModalProps> = ({
  cardType: initialCardType,
  targetId,
  onClose,
}) => {
  const { students, staff, classes, sections, settings } = useApp();

  const [activeType, setActiveType] = useState<'student' | 'staff'>(initialCardType);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    activeType === 'student' && targetId
      ? targetId
      : students[0]?.id || ''
  );
  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    activeType === 'staff' && targetId
      ? targetId
      : staff[0]?.id || ''
  );
  const [viewSide, setViewSide] = useState<'both' | 'front' | 'back'>('both');

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) || students[0];
  const selectedStaffMember =
    staff.find((m) => m.id === selectedStaffId) || staff[0];

  const studentClassName =
    classes.find((c) => c.id === selectedStudent?.currentClassId)?.name || 'Class 9';
  const studentSectionName =
    sections.find((sec) => sec.id === selectedStudent?.currentSectionId)?.name || 'A';

  const cardTitle =
    activeType === 'student'
      ? `Student ID Card - ${selectedStudent?.fullName || 'Student'}`
      : `Staff ID Card - ${selectedStaffMember?.name || 'Staff'}`;

  const handlePrint = () => {
    printDocument('printable-id-card-container', cardTitle);
  };

  const handleOpenNewTab = () => {
    openPrintInNewTab('printable-id-card-container', cardTitle);
  };

  const handleDownload = () => {
    downloadPrintableAsHtml('printable-id-card-container', cardTitle);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh]">
        {/* Top Modal Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 print-hidden">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Official Identity Card Studio (Card Format Only)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard CR80 Laminated ID Badge (85.6mm × 54mm) with high-security QR and verification barcode.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Print directly or save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print ID Card</span>
            </button>
            <button
              onClick={handleOpenNewTab}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              title="Open isolated print preview in new window"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Print Tab</span>
            </button>
            <button
              onClick={handleDownload}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              title="Download standalone HTML ID Card"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save File</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls Toolbar: Switch Student / Staff + Select Target + Side filter */}
        <div className="p-3 sm:px-6 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs print-hidden">
          {/* Type Switcher */}
          <div className="flex items-center p-1 bg-white border border-slate-200 rounded-lg">
            <button
              onClick={() => setActiveType('student')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeType === 'student'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Student Card</span>
            </button>
            <button
              onClick={() => setActiveType('staff')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeType === 'staff'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Faculty & Staff Card</span>
            </button>
          </div>

          {/* Target Selector */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px] max-w-sm">
            <span className="text-slate-500 font-medium whitespace-nowrap">
              {activeType === 'student' ? 'Select Student:' : 'Select Faculty:'}
            </span>
            {activeType === 'student' ? (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-800 text-xs focus:border-emerald-600"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.admissionNumber} - Roll #{s.rollNumber})
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-800 text-xs focus:border-emerald-600"
              >
                {staff.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.employeeId} - {m.designation})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* View Sides Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setViewSide('both')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                viewSide === 'both' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Both Sides
            </button>
            <button
              onClick={() => setViewSide('front')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                viewSide === 'front' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Front
            </button>
            <button
              onClick={() => setViewSide('back')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                viewSide === 'back' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Back
            </button>
          </div>
        </div>

        {/* Card Canvas Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/50 flex flex-col items-center justify-center">
          <div
            id="printable-id-card-container"
            className="w-full flex flex-col items-center justify-center"
          >
            <div className="flex flex-wrap items-center justify-center gap-6 max-w-3xl w-full">
              {/* ============================================================== */}
              {/* 1. CARD FRONT SIDE                                             */}
              {/* ============================================================== */}
              {(viewSide === 'both' || viewSide === 'front') && (
                <div className="w-[320px] sm:w-[340px] bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden flex flex-col justify-between text-slate-800 relative font-sans">
                  {/* Top Badge Lanyard Slot */}
                  <div className="h-4 bg-slate-100 flex items-center justify-center border-b border-slate-200">
                    <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                  </div>

                  {/* Header Banner */}
                  <div className="bg-emerald-900 text-white px-3.5 py-3 text-center relative overflow-hidden">
                    <div className="font-extrabold text-[13px] tracking-tight leading-tight uppercase">
                      {settings?.name || 'Splended Education System'}
                    </div>
                    <div className="text-[10px] text-emerald-200 mt-0.5 tracking-wide">
                      {settings?.address || 'Gandi Chowk Lakki Marwat, Pakistan'}
                    </div>
                    <div className="mt-1.5 inline-block bg-emerald-950 text-emerald-200 px-3 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border border-emerald-700/50">
                      {activeType === 'student' ? 'STUDENT IDENTITY CARD' : 'FACULTY / STAFF IDENTITY CARD'}
                    </div>
                  </div>

                  {/* Card Front Body */}
                  <div className="p-4 flex-1 flex flex-col items-center space-y-3">
                    {/* Photo Badge */}
                    <div className="relative">
                      <div className="w-24 h-28 rounded-xl bg-gradient-to-b from-slate-100 to-slate-200 border-2 border-emerald-800 flex flex-col items-center justify-center text-slate-400 font-medium text-xs shadow-inner">
                        <span className="font-extrabold text-emerald-900 text-2xl">
                          {activeType === 'student'
                            ? selectedStudent?.fullName?.charAt(0) || 'S'
                            : selectedStaffMember?.name?.charAt(0) || 'F'}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                          OFFICIAL PHOTO
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-emerald-700 text-white p-1 rounded-full shadow-xs">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Name & Title */}
                    <div className="text-center w-full">
                      <h4 className="font-extrabold text-slate-900 text-sm tracking-tight leading-snug">
                        {activeType === 'student'
                          ? selectedStudent?.fullName || 'Muhammad Hamza'
                          : selectedStaffMember?.name || 'Prof. Tariq Mehmood'}
                      </h4>
                      <p className="text-[11px] font-bold text-emerald-800 mt-0.5">
                        {activeType === 'student'
                          ? `Class: ${studentClassName} (${studentSectionName})`
                          : `${selectedStaffMember?.designation || 'Faculty'} · ${selectedStaffMember?.department || 'Academics'}`}
                      </p>
                    </div>

                    {/* Details Table */}
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] space-y-1.5">
                      {activeType === 'student' ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Roll Number:</span>
                            <span className="font-bold font-mono text-slate-900">
                              {selectedStudent?.rollNumber || '01'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Admission No:</span>
                            <span className="font-bold font-mono text-slate-900">
                              {selectedStudent?.admissionNumber || 'SES-2026-0001'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Father Name:</span>
                            <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                              {selectedStudent?.fatherName || 'Iftikhar Ahmad'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">B-Form / CNIC:</span>
                            <span className="font-mono font-semibold text-slate-700">
                              {selectedStudent?.bFormNumber || '17301-1122334-1'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Blood Group:</span>
                            <span className="font-black text-rose-700 font-mono">
                              {selectedStudent?.bloodGroup || 'B+'}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Employee ID:</span>
                            <span className="font-bold font-mono text-slate-900">
                              {selectedStaffMember?.employeeId || 'EMP-0101'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Category:</span>
                            <span className="font-semibold text-slate-800">
                              {selectedStaffMember?.category || 'Teaching Staff'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Pay Scale:</span>
                            <span className="font-bold font-mono text-emerald-800">
                              {selectedStaffMember?.bpsPayScale || 'BPS-17'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">CNIC No:</span>
                            <span className="font-mono font-semibold text-slate-700">
                              {selectedStaffMember?.cnic || '17301-1234567-1'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Blood Group:</span>
                            <span className="font-black text-rose-700 font-mono">O+</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Barcode & Session */}
                    <div className="w-full flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                      <div className="font-mono text-slate-600 tracking-widest text-[9px]">
                        ||||||| | |||| | ||||||
                      </div>
                      <span className="text-slate-500 font-semibold">Session: 2026-2027</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* 2. CARD BACK SIDE                                              */}
              {/* ============================================================== */}
              {(viewSide === 'both' || viewSide === 'back') && (
                <div className="w-[320px] sm:w-[340px] bg-white rounded-2xl shadow-xl border border-slate-300 overflow-hidden flex flex-col justify-between text-slate-800 relative font-sans">
                  {/* Top Badge Lanyard Slot */}
                  <div className="h-4 bg-slate-100 flex items-center justify-center border-b border-slate-200">
                    <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                  </div>

                  {/* Header */}
                  <div className="bg-slate-900 text-white px-3 py-2 text-center">
                    <div className="font-bold text-xs uppercase tracking-wider">
                      CAMPUS INSTRUCTIONS & POLICY
                    </div>
                  </div>

                  {/* Back Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-[11px] leading-tight">
                    <div className="space-y-2">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                        <div className="font-bold text-slate-900">Residential Address:</div>
                        <div className="text-slate-600 text-[10px]">
                          {activeType === 'student'
                            ? selectedStudent?.houseStreet
                              ? `${selectedStudent.houseStreet}, ${selectedStudent.villageCity || 'Lakki Marwat'}`
                              : 'Gandi Chowk, Lakki Marwat, Khyber Pakhtunkhwa'
                            : selectedStaffMember?.address || 'Gandi Chowk, Lakki Marwat'}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-0.5">
                        <div className="font-bold text-slate-900">Emergency Contact:</div>
                        <div className="text-slate-700 text-[10px] font-mono font-semibold">
                          {activeType === 'student'
                            ? `${selectedStudent?.emergencyContact || selectedStudent?.fatherName || 'Parent'}: ${selectedStudent?.emergencyPhone || selectedStudent?.fatherContact || '+92 300 1234567'}`
                            : `${selectedStaffMember?.emergencyContact || selectedStaffMember?.contact || '+92 300 7654321'}`}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-[10px] text-slate-500 text-justify">
                      <p>
                        1. This card is official property of <strong>{settings?.name || 'Splended Education System'}</strong> and must be presented on demand.
                      </p>
                      <p>
                        2. The cardholder must wear this card visibly inside campus and examination halls.
                      </p>
                      <p>
                        3. If lost or found, please return to Administration Office or Call: <strong>{settings?.phone || '+92 969 510000'}</strong>.
                      </p>
                    </div>

                    {/* Principal Signature & QR Code */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-slate-100 border border-slate-300 rounded flex items-center justify-center">
                          <QrCode className="w-7 h-7 text-slate-800" />
                        </div>
                        <div>
                          <div className="text-[9px] font-bold text-slate-700 font-mono">VERIFIED</div>
                          <div className="text-[8px] text-slate-400 font-mono">ID SECURITY</div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="font-serif italic text-xs font-bold text-emerald-950">
                          Head of Institution
                        </div>
                        <div className="border-t border-slate-400 text-[9px] uppercase font-bold text-slate-600 px-2 pt-0.5">
                          Authorized Signature
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Print Note */}
            <div className="mt-4 text-center text-xs text-slate-500 font-medium print-hidden">
              Standard CR80 dimensions (85.6mm × 54mm) · High-resolution print output suitable for PVC card printers and laminators.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
