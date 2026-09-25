import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  AcademicYear,
  AdmissionApplication,
  AttendanceRecord,
  AuditLog,
  Exam,
  MarkRecord,
  FeeInvoice,
  NotificationItem,
  QuestionBankItem,
  QuestionPaper,
  SchoolClass,
  SchoolSettings,
  Section,
  Staff,
  Student,
  Subject,
  TransferMigrationRecord,
  User,
  UserRole,
  WithdrawalRecord,
} from '../types/index.ts';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedStudentId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  selectedStaffId: string | null;
  setSelectedStaffId: (id: string | null) => void;
  selectedPaperId: string | null;
  setSelectedPaperId: (id: string | null) => void;
  
  // Data state
  settings: SchoolSettings | null;
  academicYears: AcademicYear[];
  classes: SchoolClass[];
  sections: Section[];
  subjects: Subject[];
  students: Student[];
  staff: Staff[];
  admissions: AdmissionApplication[];
  withdrawals: WithdrawalRecord[];
  transfers: TransferMigrationRecord[];
  exams: Exam[];
  marks: MarkRecord[];
  feeInvoices: FeeInvoice[];
  questionBank: QuestionBankItem[];
  questionPapers: QuestionPaper[];
  attendance: AttendanceRecord[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  users: User[];
  isLoading: boolean;
  
  // Actions
  refreshAllData: () => Promise<void>;
  seedDemoData: () => Promise<void>;
  resetToZeroData: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-admin',
    name: 'Waris Khan',
    email: 'admin@abcschool.edu.pk',
    username: 'admin',
    role: 'Super Administrator',
    permissions: [
      'view',
      'create',
      'edit',
      'delete',
      'export',
      'print',
      'approve',
      'manage_users',
      'manage_settings',
      'view_financial',
      'view_confidential',
      'generate_reports',
      'manage_exams',
    ],
    status: 'active',
    createdAt: new Date().toISOString(),
  });

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);

  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [transfers, setTransfers] = useState<TransferMigrationRecord[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [marks, setMarks] = useState<MarkRecord[]>([]);
  const [feeInvoices, setFeeInvoices] = useState<FeeInvoice[]>([]);
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>([]);
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  const refreshAllData = useCallback(async () => {
    try {
      const [
        settingsRes,
        yearsRes,
        classesRes,
        sectionsRes,
        subjectsRes,
        studentsRes,
        staffRes,
        admRes,
        withRes,
        trfRes,
        examsRes,
        marksRes,
        feesRes,
        qbRes,
        papersRes,
        attRes,
        notifRes,
        auditRes,
        usersRes,
      ] = await Promise.all([
        fetch('/api/school/settings').then((r) => r.json()),
        fetch('/api/academic-years').then((r) => r.json()),
        fetch('/api/classes').then((r) => r.json()),
        fetch('/api/sections').then((r) => r.json()),
        fetch('/api/subjects').then((r) => r.json()),
        fetch('/api/students').then((r) => r.json()),
        fetch('/api/staff').then((r) => r.json()),
        fetch('/api/admissions').then((r) => r.json()),
        fetch('/api/withdrawals').then((r) => r.json()),
        fetch('/api/transfers').then((r) => r.json()),
        fetch('/api/exams').then((r) => r.json()),
        fetch('/api/marks').then((r) => r.json()),
        fetch('/api/fees/invoices').then((r) => r.json()),
        fetch('/api/question-bank').then((r) => r.json()),
        fetch('/api/papers').then((r) => r.json()),
        fetch('/api/attendance').then((r) => r.json()),
        fetch('/api/notifications').then((r) => r.json()),
        fetch('/api/audit-logs').then((r) => r.json()),
        fetch('/api/users').then((r) => r.json()),
      ]);

      setSettings(settingsRes);
      setAcademicYears(yearsRes || []);
      setClasses(classesRes || []);
      setSections(sectionsRes || []);
      setSubjects(subjectsRes || []);
      setStudents(studentsRes || []);
      setStaff(staffRes || []);
      setAdmissions(admRes || []);
      setWithdrawals(withRes || []);
      setTransfers(trfRes || []);
      setExams(examsRes || []);
      setMarks(marksRes || []);
      setFeeInvoices(feesRes || []);
      setQuestionBank(qbRes || []);
      setQuestionPapers(papersRes || []);
      setAttendance(attRes || []);
      setNotifications(notifRes || []);
      setAuditLogs(auditRes || []);
      setUsers(usersRes || []);
    } catch (err) {
      console.error('Failed to load school data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  const switchRole = (role: UserRole) => {
    let permissions: User['permissions'] = ['view'];
    if (role === 'Super Administrator' || role === 'School Administrator') {
      permissions = [
        'view',
        'create',
        'edit',
        'delete',
        'export',
        'print',
        'approve',
        'manage_users',
        'manage_settings',
        'view_financial',
        'view_confidential',
        'generate_reports',
        'manage_exams',
      ];
    } else if (role === 'Principal / Head Teacher') {
      permissions = ['view', 'create', 'edit', 'export', 'print', 'approve', 'view_financial', 'view_confidential', 'generate_reports', 'manage_exams'];
    } else if (role === 'Teacher') {
      permissions = ['view', 'create', 'edit', 'print', 'manage_exams'];
    } else if (role === 'Accountant') {
      permissions = ['view', 'create', 'edit', 'print', 'export', 'view_financial', 'generate_reports'];
    } else if (role === 'Examination Officer') {
      permissions = ['view', 'create', 'edit', 'print', 'export', 'manage_exams', 'generate_reports'];
    } else if (role === 'HR / Staff Manager') {
      permissions = ['view', 'create', 'edit', 'print', 'export', 'view_confidential', 'generate_reports'];
    } else if (role === 'Receptionist / Data Entry Operator') {
      permissions = ['view', 'create', 'edit', 'print'];
    }

    setCurrentUser((prev) => ({
      ...prev,
      role,
      permissions,
    }));
    showToast(`Role switched to ${role}`, 'info');
  };

  const seedDemoData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/seed-demo', { method: 'POST' });
      if (res.ok) {
        await refreshAllData();
        showToast('Realistic Pakistani school demo data loaded successfully', 'success');
      }
    } catch {
      showToast('Error seeding demo data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToZeroData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/reset-data', { method: 'POST' });
      if (res.ok) {
        await refreshAllData();
        showToast('All operational records cleared. System in strict Zero-Data state.', 'info');
      }
    } catch {
      showToast('Error resetting to zero data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        currentView,
        setCurrentView,
        selectedStudentId,
        setSelectedStudentId,
        selectedStaffId,
        setSelectedStaffId,
        selectedPaperId,
        setSelectedPaperId,
        settings,
        academicYears,
        classes,
        sections,
        subjects,
        students,
        staff,
        admissions,
        withdrawals,
        transfers,
        exams,
        marks,
        feeInvoices,
        questionBank,
        questionPapers,
        attendance,
        notifications,
        auditLogs,
        users,
        isLoading,
        refreshAllData,
        seedDemoData,
        resetToZeroData,
        markNotificationRead,
        showToast,
        toast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
