import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.tsx';
import { Header } from './components/layout/Header.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal.tsx';
import { DashboardView } from './components/dashboard/DashboardView.tsx';
import { StudentListView } from './components/students/StudentListView.tsx';
import { AddStudentModal } from './components/students/AddStudentModal.tsx';
import { StudentProfileModal } from './components/students/StudentProfileModal.tsx';
import { AdmissionsView } from './components/students/AdmissionsView.tsx';
import { WithdrawalsView } from './components/students/WithdrawalsView.tsx';
import { TransfersView } from './components/students/TransfersView.tsx';
import { ClassesSectionsView } from './components/academics/ClassesSectionsView.tsx';
import { SubjectsView } from './components/academics/SubjectsView.tsx';
import { AcademicYearsView } from './components/academics/AcademicYearsView.tsx';
import { PromotionView } from './components/academics/PromotionView.tsx';
import { StaffListView } from './components/staff/StaffListView.tsx';
import { AddStaffModal } from './components/staff/AddStaffModal.tsx';
import { StaffProfileModal } from './components/staff/StaffProfileModal.tsx';
import { AttendanceView } from './components/attendance/AttendanceView.tsx';
import { ExamsListView } from './components/exams/ExamsListView.tsx';
import { MarksEntryModal } from './components/exams/MarksEntryModal.tsx';
import { ResultsGazetteModal } from './components/exams/ResultsGazetteModal.tsx';
import { ReportCardPrintModal } from './components/exams/ReportCardPrintModal.tsx';
import { FeeInvoicesView } from './components/fees/FeeInvoicesView.tsx';
import { CollectFeeModal } from './components/fees/CollectFeeModal.tsx';
import { FeeReceiptPrintModal } from './components/fees/FeeReceiptPrintModal.tsx';
import { QuestionBankView } from './components/papers/QuestionBankView.tsx';
import { PaperGeneratorView } from './components/papers/PaperGeneratorView.tsx';
import { AiQuestionModal } from './components/papers/AiQuestionModal.tsx';
import { PaperPrintView } from './components/papers/PaperPrintView.tsx';
import { DocumentsHubView } from './components/documents/DocumentsHubView.tsx';
import { CertificatePrintModal } from './components/documents/CertificatePrintModal.tsx';
import { IdCardModal } from './components/documents/IdCardModal.tsx';
import { ReportsView } from './components/reports/ReportsView.tsx';
import { UsersRolesView } from './components/admin/UsersRolesView.tsx';
import { AuditLogsView } from './components/admin/AuditLogsView.tsx';
import { SchoolSettingsView } from './components/admin/SchoolSettingsView.tsx';
import { BackupDemoView } from './components/admin/BackupDemoView.tsx';
import { FeeInvoice, QuestionPaper, WithdrawalRecord } from './types/index.ts';

const AppContent: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    selectedStudentId,
    setSelectedStudentId,
    selectedStaffId,
    setSelectedStaffId,
    toast,
    isLoading,
    settings,
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Student Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showStudentProfileModal, setShowStudentProfileModal] = useState(false);

  // Staff Modals
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [showStaffProfileModal, setShowStaffProfileModal] = useState(false);

  // Exam Modals
  const [marksEntryExamId, setMarksEntryExamId] = useState<string | null>(null);
  const [resultsGazetteExamId, setResultsGazetteExamId] = useState<string | null>(null);
  const [resultsGazetteClassId, setResultsGazetteClassId] = useState<string | null>(null);
  const [reportCardStudentId, setReportCardStudentId] = useState<string | null>(null);
  const [reportCardExamId, setReportCardExamId] = useState<string | null>(null);

  // Fee Modals
  const [collectPaymentInvoice, setCollectPaymentInvoice] = useState<FeeInvoice | null>(null);
  const [printReceiptInvoice, setPrintReceiptInvoice] = useState<FeeInvoice | null>(null);

  // Paper & AI Modals
  const [showAiQuestionModal, setShowAiQuestionModal] = useState(false);
  const [previewPaper, setPreviewPaper] = useState<QuestionPaper | null>(null);

  // Certificate Modals
  const [certModalDocType, setCertModalDocType] = useState<string | null>(null);
  const [certModalStudentId, setCertModalStudentId] = useState<string | undefined>(undefined);

  // Dedicated ID Card Modals
  const [idCardModalType, setIdCardModalType] = useState<'student' | 'staff' | null>(null);
  const [idCardModalTargetId, setIdCardModalTargetId] = useState<string | undefined>(undefined);

  const handleOpenStudentProfile = (sId: string) => {
    setSelectedStudentId(sId);
    setShowStudentProfileModal(true);
  };

  const handleOpenStaffProfile = (stfId: string) => {
    setSelectedStaffId(stfId);
    setShowStaffProfileModal(true);
  };

  const handleOpenWithdrawal = (sId: string) => {
    setSelectedStudentId(sId);
    setCurrentView('withdrawals');
  };

  const handlePrintSlcCertificate = (certData: WithdrawalRecord) => {
    setCertModalDocType('slc');
    setCertModalStudentId(certData.studentId);
  };

  const handleOpenCertificateModal = (docType: string, studentId?: string) => {
    if (docType === 'student_id' || docType === 'id_card') {
      handleOpenIdCardModal('student', studentId);
      return;
    }
    if (docType === 'staff_id') {
      handleOpenIdCardModal('staff', studentId);
      return;
    }
    setCertModalDocType(docType);
    setCertModalStudentId(studentId);
  };

  const handleOpenIdCardModal = (cardType: 'student' | 'staff', targetId?: string) => {
    setIdCardModalType(cardType);
    setIdCardModalTargetId(targetId);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            onOpenSearch={() => setSearchModalOpen(true)}
            onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
          />

          <main className="flex-1 p-3.5 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full">
            {isLoading ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-xs text-slate-500 font-medium">
                  Connecting to {settings?.name || 'Splended Education System'} Management System...
                </div>
              </div>
            ) : (
              <>
                {currentView === 'dashboard' && <DashboardView />}

                {currentView === 'students' && (
                  <StudentListView
                    onAddStudent={() => setShowAddStudentModal(true)}
                    onOpenProfile={handleOpenStudentProfile}
                    onOpenWithdrawal={handleOpenWithdrawal}
                    onOpenIdCard={(sId) => handleOpenIdCardModal('student', sId)}
                  />
                )}

                {currentView === 'admissions' && <AdmissionsView />}

                {currentView === 'withdrawals' && (
                  <WithdrawalsView onPrintCertificate={handlePrintSlcCertificate} />
                )}

                {currentView === 'transfers' && <TransfersView />}

                {currentView === 'classes' && <ClassesSectionsView />}

                {currentView === 'subjects' && <SubjectsView />}

                {currentView === 'academic-years' && <AcademicYearsView />}

                {currentView === 'promotion' && <PromotionView />}

                {currentView === 'staff' && (
                  <StaffListView
                    onAddStaff={() => setShowAddStaffModal(true)}
                    onOpenProfile={handleOpenStaffProfile}
                    onPrintCard={(stfId) => handleOpenIdCardModal('staff', stfId)}
                  />
                )}

                {currentView === 'attendance' && <AttendanceView />}

                {currentView === 'exams' && (
                  <ExamsListView
                    onOpenMarksEntry={(eId) => setMarksEntryExamId(eId)}
                    onOpenResults={(eId, cId) => {
                      setResultsGazetteExamId(eId);
                      setResultsGazetteClassId(cId);
                    }}
                  />
                )}

                {currentView === 'results' && (
                  <ExamsListView
                    onOpenMarksEntry={(eId) => setMarksEntryExamId(eId)}
                    onOpenResults={(eId, cId) => {
                      setResultsGazetteExamId(eId);
                      setResultsGazetteClassId(cId);
                    }}
                  />
                )}

                {currentView === 'fees' && (
                  <FeeInvoicesView
                    onCollectPayment={(inv) => setCollectPaymentInvoice(inv)}
                    onPrintReceipt={(inv) => setPrintReceiptInvoice(inv)}
                  />
                )}

                {currentView === 'question-bank' && (
                  <QuestionBankView
                    onOpenAiGenerator={() => setShowAiQuestionModal(true)}
                  />
                )}

                {currentView === 'paper-generator' && (
                  <PaperGeneratorView
                    onOpenAiGenerator={() => setShowAiQuestionModal(true)}
                    onPreviewPrint={(paper) => setPreviewPaper(paper)}
                  />
                )}

                {currentView === 'documents' && (
                  <DocumentsHubView
                    onOpenCertificateModal={handleOpenCertificateModal}
                    onOpenIdCardModal={handleOpenIdCardModal}
                  />
                )}

                {currentView === 'reports' && <ReportsView />}

                {currentView === 'users' && <UsersRolesView />}

                {currentView === 'audit-logs' && <AuditLogsView />}

                {currentView === 'settings' && <SchoolSettingsView />}

                {currentView === 'backup' && <BackupDemoView />}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <AddStudentModal
          isOpen={showAddStudentModal}
          onClose={() => setShowAddStudentModal(false)}
        />
      )}

      {/* View Student Profile Modal */}
      {showStudentProfileModal && selectedStudentId && (
        <StudentProfileModal
          studentId={selectedStudentId}
          onClose={() => {
            setShowStudentProfileModal(false);
            setSelectedStudentId(null);
          }}
          onGenerateDoc={(type, sId) => {
            if (type === 'student_id' || type === 'id_card') {
              handleOpenIdCardModal('student', sId);
            } else {
              handleOpenCertificateModal(type, sId);
            }
          }}
        />
      )}

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <AddStaffModal
          isOpen={showAddStaffModal}
          onClose={() => setShowAddStaffModal(false)}
        />
      )}

      {/* View Staff Profile Modal */}
      {showStaffProfileModal && selectedStaffId && (
        <StaffProfileModal
          staffId={selectedStaffId}
          onClose={() => {
            setShowStaffProfileModal(false);
            setSelectedStaffId(null);
          }}
          onPrintCard={(stfId) => {
            handleOpenIdCardModal('staff', stfId);
          }}
        />
      )}

      {/* Exam Modals */}
      {marksEntryExamId && (
        <MarksEntryModal
          examId={marksEntryExamId}
          onClose={() => setMarksEntryExamId(null)}
        />
      )}

      {resultsGazetteExamId && resultsGazetteClassId && (
        <ResultsGazetteModal
          examId={resultsGazetteExamId}
          classId={resultsGazetteClassId}
          onClose={() => {
            setResultsGazetteExamId(null);
            setResultsGazetteClassId(null);
          }}
          onPrintReportCard={(sId, eId) => {
            setReportCardStudentId(sId);
            setReportCardExamId(eId);
          }}
        />
      )}

      {reportCardStudentId && reportCardExamId && (
        <ReportCardPrintModal
          studentId={reportCardStudentId}
          examId={reportCardExamId}
          onClose={() => {
            setReportCardStudentId(null);
            setReportCardExamId(null);
          }}
        />
      )}

      {/* Fee Modals */}
      {collectPaymentInvoice && (
        <CollectFeeModal
          invoice={collectPaymentInvoice}
          onClose={() => setCollectPaymentInvoice(null)}
          onReceiptReady={(inv) => setPrintReceiptInvoice(inv)}
        />
      )}

      {printReceiptInvoice && (
        <FeeReceiptPrintModal
          invoice={printReceiptInvoice}
          onClose={() => setPrintReceiptInvoice(null)}
        />
      )}

      {/* Paper & AI Modals */}
      {showAiQuestionModal && (
        <AiQuestionModal
          isOpen={showAiQuestionModal}
          onClose={() => setShowAiQuestionModal(false)}
        />
      )}

      {previewPaper && (
        <PaperPrintView
          paper={previewPaper}
          onClose={() => setPreviewPaper(null)}
        />
      )}

      {/* Official Certificate Modal (Strictly A4 Certificates) */}
      {certModalDocType && (
        <CertificatePrintModal
          docType={certModalDocType}
          studentId={certModalStudentId}
          onClose={() => {
            setCertModalDocType(null);
            setCertModalStudentId(undefined);
          }}
        />
      )}

      {/* Dedicated Identity Card Modal (Strictly CR80 ID Cards) */}
      {idCardModalType && (
        <IdCardModal
          cardType={idCardModalType}
          targetId={idCardModalTargetId}
          onClose={() => {
            setIdCardModalType(null);
            setIdCardModalTargetId(undefined);
          }}
        />
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 transition-transform duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-800'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
