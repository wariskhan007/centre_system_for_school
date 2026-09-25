export type UserRole =
  | 'Super Administrator'
  | 'School Administrator'
  | 'Principal / Head Teacher'
  | 'Teacher'
  | 'Accountant'
  | 'Examination Officer'
  | 'Receptionist / Data Entry Operator'
  | 'HR / Staff Manager'
  | 'Read-Only User';

export type PermissionKey =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'export'
  | 'print'
  | 'approve'
  | 'manage_users'
  | 'manage_settings'
  | 'view_financial'
  | 'view_confidential'
  | 'generate_reports'
  | 'manage_exams';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: UserRole;
  permissions: PermissionKey[];
  avatarUrl?: string;
  phone?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
}

export interface SchoolSettings {
  name: string;
  address: string;
  country: string;
  province: string;
  district: string;
  tehsil: string;
  emisCode: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
  defaultCurrency: string;
  currentAcademicYearId: string;
  admissionPrefix: string;
  studentIdPrefix: string;
  employeeIdPrefix: string;
  receiptPrefix: string;
  certificatePrefix: string;
  paperHeaderInstructions: string;
  passingPercentage: number;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2025-2026", "2026-2027"
  startDate: string;
  endDate: string;
  status: 'active' | 'closed' | 'archived';
  isCurrent: boolean;
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "Playgroup", "Class 9", "Class 10"
  numericOrder: number;
  level: 'Primary' | 'Middle' | 'High / SSC' | 'Intermediate / HSSC' | 'Pre-School';
}

export interface Section {
  id: string;
  classId: string;
  name: string; // e.g. "A", "B", "Jinnah", "Iqbal"
  capacity: number;
  classTeacherId?: string;
}

export interface Subject {
  id: string;
  name: string; // e.g. "English", "Urdu", "Mathematics", "Islamiyat", "Pakistan Studies"
  code: string; // e.g. "ENG-09", "MTH-10"
  classId?: string; // Optional class binding, or universal
  totalMarks: number;
  passingMarks: number;
  isElective?: boolean;
}

export type StudentStatus =
  | 'new'
  | 'active'
  | 'withdrawn'
  | 'migrated'
  | 'transferred'
  | 'readmitted'
  | 'archived';

export interface Student {
  id: string; // Permanent internal ID e.g. "STU-2026-0001"
  admissionNumber: string; // e.g. "ABC-2026-0001"
  rollNumber: string; // e.g. "15"
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  nationality: string;
  religion: string;
  bFormNumber: string; // Pakistani B-Form / Form-B e.g. "12345-1234567-1"
  photoUrl?: string;

  // Parents / Guardians
  fatherName: string;
  fatherCnic: string; // Pakistani CNIC e.g. "12345-1234567-1"
  fatherContact: string;
  fatherOccupation?: string;
  motherName?: string;
  motherCnic?: string;
  motherContact?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianContact?: string;

  // Address
  houseStreet: string;
  mohalla?: string;
  villageCity: string;
  tehsil: string;
  district: string;
  province: string;
  postalCode?: string;

  // Academic
  admissionDate: string;
  admissionClassId: string;
  currentClassId: string;
  currentSectionId: string;
  currentAcademicYearId: string;
  previousSchool?: string;
  previousClass?: string;
  previousLeavingCertificateNo?: string;
  previousResult?: string;
  status: StudentStatus;

  // Emergency & Health
  emergencyContact: string;
  emergencyRelation: string;
  emergencyPhone: string;
  medicalNotes?: string;
  specialEducationalNotes?: string;
  remarks?: string;

  createdAt: string;
  updatedAt: string;
}

export interface StudentAcademicRecord {
  id: string;
  studentId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  rollNumber: string;
  promotionStatus: 'Promoted' | 'Repeated' | 'Withdrawn' | 'In Progress' | 'Transferred';
  totalMarksObtained?: number;
  totalMarksMaximum?: number;
  percentage?: number;
  grade?: string;
  attendancePercentage?: number;
  remarks?: string;
}

export interface AdmissionApplication {
  id: string;
  applicationNo: string;
  applicantName: string;
  fatherName: string;
  fatherContact: string;
  fatherCnic: string;
  dob: string;
  gender: 'Male' | 'Female';
  desiredClassId: string;
  previousSchool?: string;
  bFormNumber?: string;
  applicationDate: string;
  stage: 'Application' | 'Verification' | 'Admission Approved' | 'Enrolled' | 'Rejected';
  notes?: string;
  registeredStudentId?: string;
}

export interface WithdrawalRecord {
  id: string;
  studentId: string;
  admissionNumber: string;
  studentName: string;
  currentClassId: string;
  currentSectionId: string;
  withdrawalDate: string;
  lastAttendanceDate: string;
  reason:
    | 'School leaving'
    | 'Relocation'
    | 'Financial reasons'
    | 'Family relocation'
    | 'Transfer to another school'
    | 'Migration'
    | 'Other';
  destinationSchool?: string;
  parentRequest: boolean;
  principalApprovedBy: string;
  certificateNumber: string;
  remarks?: string;
  createdAt: string;
}

export interface TransferMigrationRecord {
  id: string;
  studentId: string;
  studentName: string;
  type: 'Transfer' | 'Migration';
  previousSchool: string;
  currentSchool: string;
  destinationSchool: string;
  transferDate: string;
  reason: string;
  certificateNumber: string;
  authorityApproval: string;
  remarks?: string;
  createdAt: string;
}

export type StaffCategory = 'Teaching Staff' | 'Non-Teaching Staff' | 'Administration' | 'Support Staff';
export type StaffStatus = 'Active' | 'On Leave' | 'Transferred' | 'Resigned' | 'Retired' | 'Terminated' | 'Archived';

export interface Staff {
  id: string;
  employeeId: string; // e.g. "EMP-001"
  name: string;
  fatherName?: string;
  fatherOrHusbandName?: string;
  dob: string;
  gender: 'Male' | 'Female';
  cnic: string;
  contact: string;
  email?: string;
  address: string;
  qualification: string; // e.g. "M.Sc. Mathematics, B.Ed"
  professionalQualification?: string;
  designation: string; // e.g. "Senior Science Teacher", "Headmistress", "Accountant"
  department: string;
  category: StaffCategory;
  bpsPayScale?: string; // e.g. "BPS-16", "BPS-17"
  monthlySalary?: number;
  joiningDate: string;
  employmentType: 'Permanent' | 'Contract' | 'Visiting';
  subjectSpecialization?: string;
  assignedClassIds: string[];
  assignedSectionIds: string[];
  emergencyContact?: string;
  status: StaffStatus;
  documents?: { name: string; type: string; date: string }[];
  createdAt: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Leave' | 'Half Day';

export interface AttendanceRecord {
  id: string;
  targetType: 'student' | 'staff';
  targetId: string; // studentId or staffId
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  classId?: string;
  sectionId?: string;
}

export type ExamType =
  | 'Monthly Test'
  | 'Class Test'
  | 'Mid Term'
  | 'Final Term'
  | 'Annual Exam'
  | 'Pre-Board'
  | 'Board Preparation'
  | 'Custom';

export interface Exam {
  id: string;
  name: string;
  examType: ExamType;
  academicYearId: string;
  classId: string;
  startDate: string;
  endDate: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Published';
  remarks?: string;
}

export interface ExamSubjectSchedule {
  id: string;
  examId: string;
  subjectId: string;
  examDate: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
}

export interface MarkRecord {
  id: string;
  examId: string;
  examSubjectId: string;
  studentId: string;
  obtainedMarks: number;
  totalMarks: number;
  grade: string;
  isAbsent?: boolean;
  remarks?: string;
}

export interface FeeCategory {
  id: string;
  name: string;
  code: string;
  defaultAmount: number;
  frequency: 'Monthly' | 'Annual' | 'One-Time' | 'Term';
}

export interface FeeInvoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  academicYearId: string;
  month: string; // e.g. "September 2026"
  issueDate: string;
  dueDate: string;
  tuitionFee: number;
  admissionFee?: number;
  examFee?: number;
  transportFee?: number;
  fineAmount?: number;
  discountAmount?: number;
  scholarshipAmount?: number;
  netPayable: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Paid' | 'Partial' | 'Unpaid' | 'Overdue';
  paymentDate?: string;
}

export interface FeePayment {
  id: string;
  receiptNo: string;
  invoiceId: string;
  studentId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'EasyPaisa' | 'JazzCash' | 'Cheque';
  bankReference?: string;
  receivedBy: string;
  remarks?: string;
}

export type QuestionType =
  | 'MCQ'
  | 'Short Question'
  | 'Long Question'
  | 'Fill in the Blank'
  | 'True/False'
  | 'Numerical'
  | 'Grammar'
  | 'Translation'
  | 'Essay'
  | 'Comprehension'
  | 'Custom Question';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export interface QuestionBankItem {
  id: string;
  subjectId: string;
  classId: string;
  chapter: string;
  topic?: string;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  questionText: string;
  options?: string[]; // for MCQs
  answer?: string;
  explanation?: string;
  marks: number;
  tags?: string[];
  isAiGenerated?: boolean;
  isApproved?: boolean;
  createdAt: string;
}

export interface QuestionPaperSection {
  id: string;
  title: string; // e.g. "SECTION A — MULTIPLE CHOICE QUESTIONS", "SECTION B — SHORT QUESTIONS"
  instructions: string; // e.g. "Attempt all questions. Each carries 1 mark."
  questionIds: {
    questionId: string;
    marks: number;
    customQuestionText?: string;
    options?: string[];
    answer?: string;
  }[];
}

export interface QuestionPaper {
  id: string;
  academicYearId: string;
  classId: string;
  sectionId?: string;
  subjectId: string;
  examType: ExamType;
  title: string; // e.g. "Mid-Term Examination 2026 - Mathematics"
  totalMarks: number;
  durationMinutes: number; // e.g. 120 (2 Hours)
  examDate: string;
  instructions: string;
  sections: QuestionPaperSection[];
  status: 'Draft' | 'Finalized' | 'Printed';
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string; // e.g. "CREATE", "UPDATE", "WITHDRAW", "MIGRATE", "FEE_COLLECT", "RESULT_ENTER"
  entity: string; // e.g. "Student", "FeeInvoice", "Mark", "ExamPaper", "Settings"
  entityId: string;
  details: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'admission' | 'withdrawal' | 'fee' | 'exam' | 'attendance' | 'system';
  timestamp: string;
  read: boolean;
  link?: string;
}
