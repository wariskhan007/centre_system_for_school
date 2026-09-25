import React, { useState } from 'react';
import { X, Printer, Award, School, ExternalLink, Download, UserCheck, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { formatDate } from '../../utils/formatters.ts';
import { printDocument, openPrintInNewTab, downloadPrintableAsHtml } from '../../utils/printHelpers.ts';

interface CertificatePrintModalProps {
  docType: string;
  studentId?: string;
  onClose: () => void;
}

export const CertificatePrintModal: React.FC<CertificatePrintModalProps> = ({
  docType: initialDocType,
  studentId: initialStudentId,
  onClose,
}) => {
  const { students, classes, sections, settings } = useApp();

  const [currentDocType, setCurrentDocType] = useState<string>(
    initialDocType === 'student_id' || initialDocType === 'staff_id'
      ? 'bonafide'
      : initialDocType
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || students[0]?.id || ''
  );

  const student = students.find((s) => s.id === selectedStudentId) || students[0];
  const className = classes.find((c) => c.id === student?.currentClassId)?.name || 'Class 9';
  const sectionName = sections.find((s) => s.id === student?.currentSectionId)?.name || 'A';

  const docTitle =
    currentDocType === 'slc'
      ? `School Leaving Certificate (SLC) - ${student?.fullName || 'Student'}`
      : currentDocType === 'character'
      ? `Character Certificate - ${student?.fullName || 'Student'}`
      : currentDocType === 'merit_list'
      ? `Merit Certificate - ${student?.fullName || 'Student'}`
      : `Bonafide Student Certificate - ${student?.fullName || 'Student'}`;

  const certNumber = `${settings?.certificatePrefix || 'SES-CERT'}-${new Date().getFullYear()}-${Math.floor(
    1000 + Math.random() * 9000
  )}`;

  const handlePrint = () => {
    printDocument('printable-certificate-container', docTitle);
  };

  const handleOpenNewTab = () => {
    openPrintInNewTab('printable-certificate-container', docTitle);
  };

  const handleDownload = () => {
    downloadPrintableAsHtml('printable-certificate-container', docTitle);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh]">
        {/* Top Header Toolbar */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 print-hidden">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-800" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Official Institutional Certificate (A4 Government Format)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Government-compliant verified institutional testimonials with official school seals and reference serial numbers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Print directly"
            >
              <Printer className="w-4 h-4" />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={handleOpenNewTab}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              title="Open in new window for direct print"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Print Tab</span>
            </button>
            <button
              onClick={handleDownload}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              title="Download clean HTML document"
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

        {/* Certificate Controls: Select Type & Student */}
        <div className="p-3 sm:px-6 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs print-hidden">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-slate-600 font-semibold whitespace-nowrap">Document Type:</span>
            <select
              value={currentDocType}
              onChange={(e) => setCurrentDocType(e.target.value)}
              className="w-full max-w-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-semibold text-emerald-950 focus:border-emerald-600"
            >
              <option value="bonafide">Bonafide Student Certificate</option>
              <option value="slc">School Leaving Certificate (SLC)</option>
              <option value="character">Character Certificate</option>
              <option value="merit_list">Merit / Tabulation Certificate</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-slate-600 font-semibold whitespace-nowrap">Select Student:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full max-w-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-none font-medium text-slate-800 focus:border-emerald-600"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.admissionNumber} - Roll #{s.rollNumber})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Certificate Paper Canvas Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/50 flex items-center justify-center">
          <div
            id="printable-certificate-container"
            className="w-full max-w-3xl bg-white text-slate-900 font-serif shadow-xl rounded-sm p-6 sm:p-12 relative border-8 border-double border-emerald-900"
          >
            {/* Corner Decorative Elements */}
            <div className="absolute top-2 left-2 text-[10px] text-emerald-800 font-mono">✦</div>
            <div className="absolute top-2 right-2 text-[10px] text-emerald-800 font-mono">✦</div>
            <div className="absolute bottom-2 left-2 text-[10px] text-emerald-800 font-mono">✦</div>
            <div className="absolute bottom-2 right-2 text-[10px] text-emerald-800 font-mono">✦</div>

            {/* Institutional Header */}
            <div className="text-center border-b-2 border-emerald-900 pb-4 mb-6">
              <div className="text-2xl sm:text-3xl font-black uppercase text-emerald-950 tracking-wider font-serif">
                {settings?.name || 'Splended Education System'}
              </div>
              <div className="text-xs font-sans uppercase tracking-widest text-slate-600 mt-1 font-semibold">
                {settings?.address || 'Gandi Chowk Lakki Marwat'} · {settings?.province || 'Khyber Pakhtunkhwa, Pakistan'}
              </div>
              <div className="text-[11px] font-sans text-slate-500 mt-0.5">
                EMIS Code: {settings?.emisCode || '25010492'} · Phone: {settings?.phone || '+92 969 510000'} · Email: {settings?.email || 'info@ses.edu.pk'}
              </div>

              {/* Document Title Banner */}
              <div className="mt-4">
                <span className="inline-block px-6 py-1.5 text-sm sm:text-base font-black uppercase tracking-wider text-emerald-950 border-b-2 border-t-2 border-emerald-900 font-serif bg-emerald-50/50">
                  {currentDocType === 'slc' && 'SCHOOL LEAVING CERTIFICATE (SLC)'}
                  {currentDocType === 'bonafide' && 'BONAFIDE STUDENT CERTIFICATE'}
                  {currentDocType === 'character' && 'CHARACTER & CONDUCT CERTIFICATE'}
                  {currentDocType === 'merit_list' && 'MERIT & TABULATION CERTIFICATE'}
                </span>
              </div>
            </div>

            {/* Serial & Date */}
            <div className="flex justify-between items-center text-xs font-sans font-medium text-slate-700 mb-6 border-b border-slate-200 pb-2">
              <div>
                Serial No: <strong className="font-mono text-slate-900">{certNumber}</strong>
              </div>
              <div>
                Issue Date: <strong>{formatDate(new Date().toISOString())}</strong>
              </div>
            </div>

            {/* Certificate Formal Text */}
            <div className="text-sm leading-loose text-justify text-slate-800 space-y-4 font-serif">
              {currentDocType === 'bonafide' && (
                <p>
                  This is to certify that{' '}
                  <strong className="font-bold underline uppercase text-slate-950">
                    {student?.fullName || 'Muhammad Hamza Khan'}
                  </strong>
                  , Son / Daughter of{' '}
                  <strong className="font-bold underline uppercase text-slate-950">
                    {student?.fatherName || 'Iftikhar Ahmad Khan'}
                  </strong>
                  , holding B-Form No.{' '}
                  <strong className="font-mono font-bold text-slate-900">
                    {student?.bFormNumber || '17301-1122334-1'}
                  </strong>
                  , is a bonafide enrolled student of this institution studying in{' '}
                  <strong className="font-bold underline text-emerald-950">
                    {className} ({sectionName})
                  </strong>{' '}
                  under Admission Number{' '}
                  <strong className="font-mono font-bold text-slate-900">
                    {student?.admissionNumber || 'SES-2026-0001'}
                  </strong>{' '}
                  and Roll Number{' '}
                  <strong className="font-mono font-bold text-slate-900">
                    {student?.rollNumber || '01'}
                  </strong>
                  .
                  <br />
                  His / Her date of birth recorded in the official school admission register is{' '}
                  <strong className="font-bold text-slate-900">
                    {formatDate(student?.dob || '2010-04-12')}
                  </strong>
                  .
                  <br />
                  This certificate is issued upon the official request of the parent / guardian for passport, scholarship, or administrative verification purposes.
                </p>
              )}

              {currentDocType === 'slc' && (
                <p>
                  This is to certify that{' '}
                  <strong className="font-bold underline uppercase text-slate-950">
                    {student?.fullName || 'Muhammad Hamza Khan'}
                  </strong>
                  , Son / Daughter of{' '}
                  <strong className="font-bold underline uppercase text-slate-950">
                    {student?.fatherName || 'Iftikhar Ahmad Khan'}
                  </strong>
                  , was admitted to this institution under Admission No.{' '}
                  <strong className="font-mono font-bold">
                    {student?.admissionNumber || 'SES-2026-0001'}
                  </strong>
                  .
                  <br />
                  He / She left this school having completed his / her coursework in{' '}
                  <strong className="font-bold underline text-emerald-950">{className}</strong>.
                  <br />
                  All institutional dues, examination charges, and library liabilities have been paid in full up to the current session. His / Her conduct, discipline, and moral standing throughout the period of enrollment have been{' '}
                  <strong className="font-bold uppercase text-emerald-950">EXEMPLARY</strong>.
                </p>
              )}

              {currentDocType === 'character' && (
                <p>
                  Certified that{' '}
                  <strong className="font-bold underline uppercase text-slate-950">
                    {student?.fullName || 'Muhammad Hamza Khan'}
                  </strong>
                  , Son / Daughter of{' '}
                  <strong className="font-bold underline uppercase text-slate-950">
                    {student?.fatherName || 'Iftikhar Ahmad Khan'}
                  </strong>
                  , is an enrolled student in{' '}
                  <strong className="font-bold underline text-emerald-950">{className}</strong> at{' '}
                  {settings?.name || 'Splended Education System'}.
                  <br />
                  During his / her academic term, his / her character, moral behavior, adherence to institutional discipline, and participation in co-curricular activities have been evaluated as{' '}
                  <strong className="font-bold uppercase text-emerald-950">EXCELLENT</strong>.
                  <br />
                  We wish him / her every success in all future academic and professional endeavors.
                </p>
              )}

              {currentDocType === 'merit_list' && (
                <p>
                  This Certificate of Merit is proudly conferred upon{' '}
                  <strong className="font-bold underline uppercase text-slate-950">
                    {student?.fullName || 'Muhammad Hamza Khan'}
                  </strong>{' '}
                  in recognition of outstanding academic performance and scholarly dedication in{' '}
                  <strong className="font-bold underline text-emerald-950">{className}</strong>.
                  <br />
                  He / She has demonstrated commendable discipline, exceptional diligence, and an exemplary attitude toward academic excellence.
                </p>
              )}
            </div>

            {/* Official Signatures & Seal Section */}
            <div className="mt-14 pt-6 border-t border-slate-300 flex items-end justify-between font-sans text-xs">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-emerald-800 flex items-center justify-center text-[10px] text-emerald-800 font-bold uppercase tracking-wider mb-2">
                  Official Seal
                </div>
                <div className="text-[10px] text-slate-500">Institution Seal</div>
              </div>

              <div className="text-center">
                <div className="font-serif italic font-bold text-slate-800 text-sm mb-1">
                  Examination Controller
                </div>
                <div className="border-t border-slate-400 pt-1 font-semibold text-[11px] text-slate-700 uppercase">
                  Prepared By / Incharge
                </div>
              </div>

              <div className="text-center">
                <div className="font-serif italic font-bold text-emerald-950 text-base mb-1">
                  Head of Institution
                </div>
                <div className="border-t border-slate-900 pt-1 font-bold text-[11px] text-slate-900 uppercase">
                  Principal Signature
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
