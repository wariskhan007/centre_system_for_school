import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './src/server/db.ts';
import {
  AdmissionApplication,
  AttendanceRecord,
  Exam,
  ExamSubjectSchedule,
  FeeInvoice,
  FeePayment,
  MarkRecord,
  QuestionBankItem,
  QuestionPaper,
  SchoolSettings,
  Staff,
  Student,
  TransferMigrationRecord,
  User,
  WithdrawalRecord,
} from './src/types/index.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// ==========================================
// 1. AUTHENTICATION & USERS
// ==========================================
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const data = db.getData();
  const user = data.users.find(
    (u) => (u.username === username || u.email === username) && u.status === 'active'
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Record login in audit log
  user.lastLogin = new Date().toISOString();
  db.logAudit(user.id, user.name, user.role, 'LOGIN', 'User', user.id, 'User logged in successfully');
  res.json({ user, token: 'mock-jwt-session-' + user.id });
});

app.get('/api/users', (req: Request, res: Response) => {
  res.json(db.getData().users);
});

app.post('/api/users', (req: Request, res: Response) => {
  const user: User = {
    ...req.body,
    id: 'usr-' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  db.getData().users.push(user);
  db.logAudit('usr-admin', 'Admin', 'Super Administrator', 'CREATE', 'User', user.id, `Created user ${user.name}`);
  db.saveDatabase();
  res.status(201).json(user);
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  const data = db.getData();
  const index = data.users.findIndex((u) => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const existing = data.users[index];
  data.users[index] = {
    ...existing,
    ...req.body,
    id: existing.id, // preserve ID
  };

  db.logAudit(
    'usr-admin',
    'Admin',
    'Super Administrator',
    'UPDATE',
    'User',
    req.params.id,
    `Updated account details for user "${data.users[index].name}" (Role: ${data.users[index].role}, Status: ${data.users[index].status})`
  );
  db.saveDatabase();
  res.json(data.users[index]);
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const data = db.getData();
  const user = data.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  data.users = data.users.filter((u) => u.id !== req.params.id);
  db.logAudit('usr-admin', 'Admin', 'Super Administrator', 'DELETE', 'User', req.params.id, `Deleted user ${user.name}`);
  db.saveDatabase();
  res.json({ success: true });
});

// ==========================================
// 2. SCHOOL SETTINGS & ACADEMICS
// ==========================================
app.get('/api/school/settings', (req: Request, res: Response) => {
  res.json(db.getData().settings);
});

app.put('/api/school/settings', (req: Request, res: Response) => {
  const data = db.getData();
  data.settings = { ...data.settings, ...req.body };
  db.logAudit('usr-admin', 'Admin', 'Super Administrator', 'UPDATE', 'SchoolSettings', 'main', 'Updated school profile');
  db.saveDatabase();
  res.json(data.settings);
});

app.get('/api/academic-years', (req: Request, res: Response) => {
  res.json(db.getData().academicYears);
});

app.post('/api/academic-years', (req: Request, res: Response) => {
  const ay = { ...req.body, id: 'ay-' + Date.now() };
  db.getData().academicYears.push(ay);
  db.logAudit('usr-admin', 'Admin', 'Super Administrator', 'CREATE', 'AcademicYear', ay.id, `Created academic year ${ay.name}`);
  db.saveDatabase();
  res.status(201).json(ay);
});

app.put('/api/academic-years/:id/activate', (req: Request, res: Response) => {
  const data = db.getData();
  const year = data.academicYears.find((y) => y.id === req.params.id);
  if (!year) return res.status(404).json({ error: 'Academic year not found' });

  data.academicYears.forEach((y) => {
    y.isCurrent = y.id === year.id;
    if (y.id === year.id) y.status = 'active';
  });
  data.settings.currentAcademicYearId = year.id;
  db.logAudit('usr-admin', 'Admin', 'Super Administrator', 'ACTIVATE', 'AcademicYear', year.id, `Activated academic year ${year.name}`);
  db.saveDatabase();
  res.json({ success: true, academicYears: data.academicYears });
});

app.get('/api/classes', (req: Request, res: Response) => {
  res.json(db.getData().classes);
});

app.post('/api/classes', (req: Request, res: Response) => {
  const newClass = { ...req.body, id: 'cls-' + Date.now() };
  db.getData().classes.push(newClass);
  db.saveDatabase();
  res.status(201).json(newClass);
});

app.get('/api/sections', (req: Request, res: Response) => {
  res.json(db.getData().sections);
});

app.post('/api/sections', (req: Request, res: Response) => {
  const newSec = { ...req.body, id: 'sec-' + Date.now() };
  db.getData().sections.push(newSec);
  db.saveDatabase();
  res.status(201).json(newSec);
});

app.get('/api/subjects', (req: Request, res: Response) => {
  res.json(db.getData().subjects);
});

app.post('/api/subjects', (req: Request, res: Response) => {
  const newSub = { ...req.body, id: 'sub-' + Date.now() };
  db.getData().subjects.push(newSub);
  db.saveDatabase();
  res.status(201).json(newSub);
});

// ==========================================
// 3. STUDENT MANAGEMENT
// ==========================================
app.get('/api/students', (req: Request, res: Response) => {
  const data = db.getData();
  let list = [...data.students];

  const search = (req.query.search as string)?.toLowerCase();
  const classId = req.query.classId as string;
  const sectionId = req.query.sectionId as string;
  const status = req.query.status as string;

  if (search) {
    list = list.filter(
      (s) =>
        s.fullName.toLowerCase().includes(search) ||
        s.admissionNumber.toLowerCase().includes(search) ||
        s.rollNumber.toLowerCase().includes(search) ||
        s.fatherName.toLowerCase().includes(search) ||
        s.bFormNumber.toLowerCase().includes(search) ||
        s.fatherCnic.toLowerCase().includes(search)
    );
  }

  if (classId) {
    list = list.filter((s) => s.currentClassId === classId);
  }
  if (sectionId) {
    list = list.filter((s) => s.currentSectionId === sectionId);
  }
  if (status) {
    list = list.filter((s) => s.status === status);
  }

  res.json(list);
});

app.get('/api/students/:id', (req: Request, res: Response) => {
  const student = db.getData().students.find((s) => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(student);
});

app.post('/api/students', (req: Request, res: Response) => {
  const data = db.getData();
  const count = data.students.length + 1;
  const yearSuffix = new Date().getFullYear();

  // Automatic admission number & student ID generator
  const autoAdmissionNo = `${data.settings.admissionPrefix || 'ABC-' + yearSuffix}-${String(count).padStart(4, '0')}`;
  const autoStudentId = `${data.settings.studentIdPrefix || 'STU-' + yearSuffix}-${String(count).padStart(4, '0')}`;

  const student: Student = {
    ...req.body,
    id: req.body.id || autoStudentId,
    admissionNumber: req.body.admissionNumber || autoAdmissionNo,
    rollNumber: req.body.rollNumber || String(count),
    status: req.body.status || 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  data.students.push(student);

  // Add initial academic record
  data.studentAcademicRecords.push({
    id: 'sar-' + Date.now(),
    studentId: student.id,
    academicYearId: student.currentAcademicYearId || data.settings.currentAcademicYearId,
    classId: student.currentClassId,
    sectionId: student.currentSectionId,
    rollNumber: student.rollNumber,
    promotionStatus: 'In Progress',
    remarks: 'Admitted on ' + student.admissionDate,
  });

  db.logAudit(
    'usr-admin',
    'Admin',
    'Administrator',
    'CREATE',
    'Student',
    student.id,
    `Registered new student ${student.fullName} (${student.admissionNumber})`
  );

  db.addNotification(
    'New Student Registered',
    `Student ${student.fullName} has been enrolled in Class ${student.currentClassId}.`,
    'admission',
    `/students/${student.id}`
  );

  db.saveDatabase();
  res.status(201).json(student);
});

app.put('/api/students/:id', (req: Request, res: Response) => {
  const data = db.getData();
  const index = data.students.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Student not found' });

  data.students[index] = {
    ...data.students[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  db.logAudit(
    'usr-admin',
    'Admin',
    'Administrator',
    'UPDATE',
    'Student',
    req.params.id,
    `Updated profile for ${data.students[index].fullName}`
  );

  db.saveDatabase();
  res.json(data.students[index]);
});

app.get('/api/students/:id/academic-history', (req: Request, res: Response) => {
  const records = db
    .getData()
    .studentAcademicRecords.filter((r) => r.studentId === req.params.id);
  res.json(records);
});

// ==========================================
// 4. ADMISSION MANAGEMENT
// ==========================================
app.get('/api/admissions', (req: Request, res: Response) => {
  res.json(db.getData().admissions);
});

app.post('/api/admissions', (req: Request, res: Response) => {
  const data = db.getData();
  const appNo = `APP-2026-${String(data.admissions.length + 1).padStart(3, '0')}`;
  const appItem: AdmissionApplication = {
    ...req.body,
    id: 'adm-' + Date.now(),
    applicationNo: appNo,
    applicationDate: new Date().toISOString().split('T')[0],
    stage: req.body.stage || 'Application',
  };
  data.admissions.unshift(appItem);

  db.logAudit(
    'usr-admin',
    'Admin',
    'Receptionist',
    'CREATE',
    'AdmissionApplication',
    appItem.id,
    `Received admission application ${appItem.applicationNo} for ${appItem.applicantName}`
  );

  db.addNotification(
    'New Admission Application',
    `Application received for ${appItem.applicantName} for Class ${appItem.desiredClassId}`,
    'admission'
  );

  db.saveDatabase();
  res.status(201).json(appItem);
});

app.put('/api/admissions/:id/stage', (req: Request, res: Response) => {
  const data = db.getData();
  const adm = data.admissions.find((a) => a.id === req.params.id);
  if (!adm) return res.status(404).json({ error: 'Application not found' });

  adm.stage = req.body.stage;
  adm.notes = req.body.notes || adm.notes;
  db.logAudit('usr-admin', 'Admin', 'School Administrator', 'UPDATE', 'AdmissionApplication', adm.id, `Status set to ${adm.stage}`);
  db.saveDatabase();
  res.json(adm);
});

// ==========================================
// 5. WITHDRAWALS & TRANSFERS
// ==========================================
app.get('/api/withdrawals', (req: Request, res: Response) => {
  res.json(db.getData().withdrawals);
});

app.post('/api/withdrawals', (req: Request, res: Response) => {
  const data = db.getData();
  const { studentId, withdrawalDate, lastAttendanceDate, reason, destinationSchool, parentRequest, remarks } = req.body;

  const student = data.students.find((s) => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  // Update student status to WITHDRAWN (Never delete historical records!)
  student.status = 'withdrawn';
  student.updatedAt = new Date().toISOString();

  const certNumber = `${data.settings.certificatePrefix || 'SLC-2026'}-${String(data.withdrawals.length + 1).padStart(4, '0')}`;

  const withdrawal: WithdrawalRecord = {
    id: 'wth-' + Date.now(),
    studentId: student.id,
    admissionNumber: student.admissionNumber,
    studentName: student.fullName,
    currentClassId: student.currentClassId,
    currentSectionId: student.currentSectionId,
    withdrawalDate,
    lastAttendanceDate: lastAttendanceDate || withdrawalDate,
    reason,
    destinationSchool: destinationSchool || '',
    parentRequest: Boolean(parentRequest),
    principalApprovedBy: 'Prof. Tariq Mehmood (Principal)',
    certificateNumber: certNumber,
    remarks,
    createdAt: new Date().toISOString(),
  };

  data.withdrawals.unshift(withdrawal);

  db.logAudit(
    'usr-admin',
    'Admin',
    'Principal',
    'WITHDRAW',
    'Student',
    student.id,
    `Student ${student.fullName} marked as Withdrawn. Issued SLC #${certNumber}`
  );

  db.addNotification(
    'Student Withdrawn',
    `SLC #${certNumber} generated for ${student.fullName}. Reason: ${reason}`,
    'withdrawal'
  );

  db.saveDatabase();
  res.status(201).json(withdrawal);
});

app.get('/api/transfers', (req: Request, res: Response) => {
  res.json(db.getData().transfers);
});

app.post('/api/transfers', (req: Request, res: Response) => {
  const data = db.getData();
  const { studentId, type, previousSchool, currentSchool, destinationSchool, transferDate, reason, remarks } = req.body;

  const student = data.students.find((s) => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  student.status = type === 'Migration' ? 'migrated' : 'transferred';
  student.updatedAt = new Date().toISOString();

  const certNumber = `TC-2026-${String(data.transfers.length + 1).padStart(4, '0')}`;

  const transferRecord: TransferMigrationRecord = {
    id: 'trf-' + Date.now(),
    studentId: student.id,
    studentName: student.fullName,
    type,
    previousSchool: previousSchool || data.settings.name,
    currentSchool: currentSchool || data.settings.name,
    destinationSchool,
    transferDate,
    reason,
    certificateNumber: certNumber,
    authorityApproval: 'BISE / Directorate of Education',
    remarks,
    createdAt: new Date().toISOString(),
  };

  data.transfers.unshift(transferRecord);

  db.logAudit(
    'usr-admin',
    'Admin',
    'Principal',
    'MIGRATE',
    'Student',
    student.id,
    `Recorded ${type} for ${student.fullName} to ${destinationSchool}`
  );

  db.saveDatabase();
  res.status(201).json(transferRecord);
});

// ==========================================
// 6. STAFF MANAGEMENT
// ==========================================
app.get('/api/staff', (req: Request, res: Response) => {
  const data = db.getData();
  let list = [...data.staff];
  const search = (req.query.search as string)?.toLowerCase();
  const category = req.query.category as string;
  const status = req.query.status as string;

  if (search) {
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(search) ||
        s.employeeId.toLowerCase().includes(search) ||
        s.cnic.toLowerCase().includes(search) ||
        s.designation.toLowerCase().includes(search) ||
        s.department.toLowerCase().includes(search)
    );
  }
  if (category) {
    list = list.filter((s) => s.category === category);
  }
  if (status) {
    list = list.filter((s) => s.status === status);
  }

  res.json(list);
});

app.post('/api/staff', (req: Request, res: Response) => {
  const data = db.getData();
  const empId = `EMP-${String(data.staff.length + 101).padStart(4, '0')}`;
  const staffMember: Staff = {
    ...req.body,
    id: 'stf-' + Date.now(),
    employeeId: req.body.employeeId || empId,
    status: req.body.status || 'Active',
    createdAt: new Date().toISOString(),
  };
  data.staff.unshift(staffMember);

  db.logAudit('usr-admin', 'Admin', 'HR Manager', 'CREATE', 'Staff', staffMember.id, `Created staff member ${staffMember.name}`);
  db.saveDatabase();
  res.status(201).json(staffMember);
});

app.put('/api/staff/:id', (req: Request, res: Response) => {
  const data = db.getData();
  const index = data.staff.findIndex((s) => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Staff member not found' });

  data.staff[index] = { ...data.staff[index], ...req.body };
  db.logAudit('usr-admin', 'Admin', 'HR Manager', 'UPDATE', 'Staff', req.params.id, `Updated details for ${data.staff[index].name}`);
  db.saveDatabase();
  res.json(data.staff[index]);
});

// ==========================================
// 7. ATTENDANCE MANAGEMENT
// ==========================================
app.get('/api/attendance', (req: Request, res: Response) => {
  const data = db.getData();
  const date = req.query.date as string;
  const classId = req.query.classId as string;
  const sectionId = req.query.sectionId as string;
  const targetType = (req.query.targetType as string) || 'student';

  let list = data.attendance.filter((a) => a.targetType === targetType);
  if (date) list = list.filter((a) => a.date === date);
  if (classId) list = list.filter((a) => a.classId === classId);
  if (sectionId) list = list.filter((a) => a.sectionId === sectionId);

  res.json(list);
});

app.post('/api/attendance/bulk', (req: Request, res: Response) => {
  const data = db.getData();
  const { records } = req.body as { records: AttendanceRecord[] };

  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ error: 'Invalid attendance array' });
  }

  // Remove existing entries for matching targetId and date to prevent duplicate rows
  records.forEach((rec) => {
    data.attendance = data.attendance.filter(
      (a) => !(a.targetId === rec.targetId && a.date === rec.date)
    );
    data.attendance.push({
      ...rec,
      id: rec.id || 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    });
  });

  db.logAudit(
    'usr-admin',
    'Admin',
    'Teacher',
    'ATTENDANCE_SUBMIT',
    'Attendance',
    'bulk',
    `Marked attendance for ${records.length} records on date ${records[0]?.date}`
  );

  db.saveDatabase();
  res.json({ success: true, count: records.length });
});

// ==========================================
// 8. EXAMINATION & RESULTS
// ==========================================
app.get('/api/exams', (req: Request, res: Response) => {
  res.json(db.getData().exams);
});

app.get('/api/marks', (req: Request, res: Response) => {
  res.json(db.getData().marks);
});

app.post('/api/exams', (req: Request, res: Response) => {
  const data = db.getData();
  const exam: Exam = {
    ...req.body,
    id: 'exm-' + Date.now(),
    status: req.body.status || 'Scheduled',
  };
  data.exams.unshift(exam);
  db.logAudit('usr-admin', 'Admin', 'Examination Officer', 'CREATE', 'Exam', exam.id, `Created exam schedule: ${exam.name}`);
  db.saveDatabase();
  res.status(201).json(exam);
});

app.get('/api/exams/:id/schedules', (req: Request, res: Response) => {
  const schedules = db.getData().examSchedules.filter((s) => s.examId === req.params.id);
  res.json(schedules);
});

app.post('/api/exams/:id/schedules', (req: Request, res: Response) => {
  const data = db.getData();
  const schedule: ExamSubjectSchedule = {
    ...req.body,
    id: 'exs-' + Date.now(),
    examId: req.params.id,
  };
  data.examSchedules.push(schedule);
  db.saveDatabase();
  res.status(201).json(schedule);
});

app.get('/api/exams/:id/marks', (req: Request, res: Response) => {
  const marks = db.getData().marks.filter((m) => m.examId === req.params.id);
  res.json(marks);
});

app.post('/api/exams/:id/marks/bulk', (req: Request, res: Response) => {
  const data = db.getData();
  const { marks } = req.body as { marks: MarkRecord[] };

  if (!marks || !Array.isArray(marks)) {
    return res.status(400).json({ error: 'Invalid marks array' });
  }

  marks.forEach((mrk) => {
    data.marks = data.marks.filter(
      (m) => !(m.examId === mrk.examId && m.examSubjectId === mrk.examSubjectId && m.studentId === mrk.studentId)
    );
    data.marks.push({
      ...mrk,
      id: mrk.id || 'mrk-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    });
  });

  db.logAudit('usr-admin', 'Admin', 'Teacher', 'MARKS_SUBMIT', 'Marks', req.params.id, `Entered marks for ${marks.length} entries`);
  db.saveDatabase();
  res.json({ success: true, count: marks.length });
});

// Calculate class results with positions, total marks, percentage, and Pakistani Board Grade
app.get('/api/exams/:id/results/:classId', (req: Request, res: Response) => {
  const data = db.getData();
  const examId = req.params.id;
  const classId = req.params.classId;

  const studentsInClass = data.students.filter(
    (s) => s.currentClassId === classId && s.status === 'active'
  );
  const examSchedules = data.examSchedules.filter((s) => s.examId === examId);
  const examMarks = data.marks.filter((m) => m.examId === examId);

  const results = studentsInClass.map((student) => {
    let totalObtained = 0;
    let totalMaximum = 0;
    let failedSubjectsCount = 0;

    const subjectBreakdown = examSchedules.map((schedule) => {
      const subject = data.subjects.find((sub) => sub.id === schedule.subjectId);
      const mark = examMarks.find(
        (m) => m.examSubjectId === schedule.id && m.studentId === student.id
      );

      const obtained = mark ? (mark.isAbsent ? 0 : mark.obtainedMarks) : 0;
      const isAbsent = mark?.isAbsent || false;
      const passed = obtained >= schedule.passingMarks;

      if (!passed) failedSubjectsCount++;
      totalObtained += obtained;
      totalMaximum += schedule.totalMarks;

      return {
        subjectId: schedule.subjectId,
        subjectName: subject?.name || 'Subject',
        subjectCode: subject?.code || '',
        totalMarks: schedule.totalMarks,
        passingMarks: schedule.passingMarks,
        obtainedMarks: obtained,
        isAbsent,
        passed,
        grade: mark?.grade || '',
      };
    });

    const percentage = totalMaximum > 0 ? Number(((totalObtained / totalMaximum) * 100).toFixed(2)) : 0;

    // Pakistani Grading scale:
    // A+ / A-1 (80% and above)
    // A (70% - 79.99%)
    // B (60% - 69.99%)
    // C (50% - 59.99%)
    // D (40% - 49.99%)
    // E (33% - 39.99%)
    // F (Below 33%)
    let overallGrade = 'F';
    if (percentage >= 80) overallGrade = 'A+';
    else if (percentage >= 70) overallGrade = 'A';
    else if (percentage >= 60) overallGrade = 'B';
    else if (percentage >= 50) overallGrade = 'C';
    else if (percentage >= 40) overallGrade = 'D';
    else if (percentage >= 33) overallGrade = 'E';

    const status = failedSubjectsCount === 0 && percentage >= 33 ? 'Passed' : 'Failed';

    return {
      studentId: student.id,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber,
      studentName: student.fullName,
      fatherName: student.fatherName,
      totalObtained,
      totalMaximum,
      percentage,
      overallGrade,
      status,
      failedSubjectsCount,
      subjectBreakdown,
    };
  });

  // Sort by marks descending to assign Positions (1st, 2nd, 3rd)
  results.sort((a, b) => b.totalObtained - a.totalObtained);
  results.forEach((r, idx) => {
    (r as Record<string, unknown>).position = idx + 1;
  });

  res.json(results);
});

// ==========================================
// 9. FEES & INVOICING
// ==========================================
app.get('/api/fees/invoices', (req: Request, res: Response) => {
  res.json(db.getData().feeInvoices);
});

app.post('/api/fees/invoices', (req: Request, res: Response) => {
  const data = db.getData();
  const invoiceNo = `${data.settings.receiptPrefix || 'REC-2026'}-${String(data.feeInvoices.length + 1001).padStart(5, '0')}`;

  const tuition = Number(req.body.tuitionFee) || 0;
  const exam = Number(req.body.examFee) || 0;
  const transport = Number(req.body.transportFee) || 0;
  const admission = Number(req.body.admissionFee) || 0;
  const fine = Number(req.body.fineAmount) || 0;
  const discount = Number(req.body.discountAmount) || 0;
  const scholarship = Number(req.body.scholarshipAmount) || 0;

  const netPayable = tuition + exam + transport + admission + fine - discount - scholarship;

  const invoice: FeeInvoice = {
    ...req.body,
    id: 'inv-' + Date.now(),
    invoiceNo,
    netPayable,
    paidAmount: 0,
    remainingAmount: netPayable,
    status: 'Unpaid',
  };

  data.feeInvoices.unshift(invoice);
  db.logAudit('usr-admin', 'Admin', 'Accountant', 'FEE_INVOICE_CREATE', 'FeeInvoice', invoice.id, `Created invoice ${invoice.invoiceNo} for PKR ${netPayable}`);
  db.saveDatabase();
  res.status(201).json(invoice);
});

app.post('/api/fees/payments', (req: Request, res: Response) => {
  const data = db.getData();
  const { invoiceId, amountPaid, paymentMethod, bankReference, remarks } = req.body;

  const invoice = data.feeInvoices.find((i) => i.id === invoiceId);
  if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

  const numericPaid = Number(amountPaid);
  invoice.paidAmount += numericPaid;
  invoice.remainingAmount = Math.max(0, invoice.netPayable - invoice.paidAmount);
  invoice.status = invoice.remainingAmount === 0 ? 'Paid' : invoice.paidAmount > 0 ? 'Partial' : 'Unpaid';
  invoice.paymentDate = new Date().toISOString().split('T')[0];

  const receiptNo = `RCP-${new Date().getFullYear()}-${String(data.feePayments.length + 1).padStart(4, '0')}`;

  const payment: FeePayment = {
    id: 'pay-' + Date.now(),
    receiptNo,
    invoiceId,
    studentId: invoice.studentId,
    amountPaid: numericPaid,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod,
    bankReference,
    receivedBy: 'Bilal Ahmad (Accountant)',
    remarks,
  };

  data.feePayments.unshift(payment);

  db.logAudit(
    'usr-admin',
    'Admin',
    'Accountant',
    'FEE_PAYMENT_COLLECT',
    'FeePayment',
    payment.id,
    `Collected PKR ${numericPaid} for invoice ${invoice.invoiceNo} via ${paymentMethod}`
  );

  db.saveDatabase();
  res.status(201).json({ success: true, payment, updatedInvoice: invoice });
});

// ==========================================
// 10. QUESTION BANK & PAPER GENERATOR
// ==========================================
app.get('/api/question-bank', (req: Request, res: Response) => {
  const data = db.getData();
  let list = [...data.questionBank];
  const subjectId = req.query.subjectId as string;
  const classId = req.query.classId as string;
  const difficulty = req.query.difficulty as string;
  const type = req.query.questionType as string;

  if (subjectId) list = list.filter((q) => q.subjectId === subjectId);
  if (classId) list = list.filter((q) => q.classId === classId);
  if (difficulty) list = list.filter((q) => q.difficulty === difficulty);
  if (type) list = list.filter((q) => q.questionType === type);

  res.json(list);
});

app.post('/api/question-bank', (req: Request, res: Response) => {
  const data = db.getData();
  const item: QuestionBankItem = {
    ...req.body,
    id: 'qb-' + Date.now(),
    isApproved: req.body.isApproved !== undefined ? req.body.isApproved : true,
    createdAt: new Date().toISOString(),
  };
  data.questionBank.unshift(item);
  db.saveDatabase();
  res.status(201).json(item);
});

app.put('/api/question-bank/:id', (req: Request, res: Response) => {
  const data = db.getData();
  const index = data.questionBank.findIndex((q) => q.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Question not found' });

  data.questionBank[index] = { ...data.questionBank[index], ...req.body };
  db.saveDatabase();
  res.json(data.questionBank[index]);
});

app.delete('/api/question-bank/:id', (req: Request, res: Response) => {
  const data = db.getData();
  data.questionBank = data.questionBank.filter((q) => q.id !== req.params.id);
  db.saveDatabase();
  res.json({ success: true });
});

// Papers
app.get('/api/papers', (req: Request, res: Response) => {
  res.json(db.getData().questionPapers);
});

app.get('/api/papers/:id', (req: Request, res: Response) => {
  const paper = db.getData().questionPapers.find((p) => p.id === req.params.id);
  if (!paper) return res.status(404).json({ error: 'Question paper not found' });
  res.json(paper);
});

app.post('/api/papers', (req: Request, res: Response) => {
  const data = db.getData();
  const paper: QuestionPaper = {
    ...req.body,
    id: 'paper-' + Date.now(),
    status: req.body.status || 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.questionPapers.unshift(paper);
  db.logAudit('usr-admin', 'Admin', 'Teacher', 'CREATE', 'QuestionPaper', paper.id, `Created question paper: ${paper.title}`);
  db.saveDatabase();
  res.status(201).json(paper);
});

app.put('/api/papers/:id', (req: Request, res: Response) => {
  const data = db.getData();
  const index = data.questionPapers.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Paper not found' });

  data.questionPapers[index] = {
    ...data.questionPapers[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  db.saveDatabase();
  res.json(data.questionPapers[index]);
});

// ==========================================
// 11. AI QUESTION GENERATOR (Gemini 3.8 Flash)
// ==========================================
app.post('/api/ai/generate-questions', async (req: Request, res: Response) => {
  try {
    const { subject, className, chapter, difficulty, questionType, count } = req.body;

    const numQuestions = Math.min(Math.max(Number(count) || 3, 1), 10);
    const ai = getGeminiClient();

    const prompt = `You are a senior exam paper setter for Pakistani Boards of Intermediate & Secondary Education (BISE) curriculum.
Generate ${numQuestions} ${difficulty} level questions of type '${questionType}' for:
- Subject: ${subject || 'General Science'}
- Class / Grade: ${className || 'Class 9'}
- Chapter / Topic: ${chapter || 'Core Concepts'}

Guidelines:
1. Ensure curriculum alignment with Pakistani national curriculum (e.g. Federal Board FBISE, Punjab Curriculum & Textbook Board PCTB, KP BISE Peshawar).
2. For MCQs, provide exactly 4 distinct options and identify the correct answer.
3. For Short Questions, provide an appropriate model answer (2-4 lines).
4. For Long Questions, provide an outline of expected points.
5. All generated questions are DRAFTS requiring human teacher review.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert exam coordinator for ABC School in Pakistan. Respond strictly with structured JSON array according to the specified schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionText: { type: Type.STRING, description: 'The question wording.' },
              questionType: { type: Type.STRING, description: 'MCQ, Short Question, Long Question, etc.' },
              difficulty: { type: Type.STRING, description: 'Easy, Medium, or Hard' },
              marks: { type: Type.NUMBER, description: 'Suggested marks.' },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Four options for MCQs. Empty if not MCQ.',
              },
              answer: { type: Type.STRING, description: 'The correct answer or model solution.' },
              explanation: { type: Type.STRING, description: 'Brief curriculum note or explanation.' },
            },
            required: ['questionText', 'questionType', 'marks', 'answer'],
          },
        },
      },
    });

    const text = response.text || '[]';
    const parsed = JSON.parse(text);

    db.logAudit(
      'usr-admin',
      'Teacher',
      'Teacher',
      'AI_QUESTION_GENERATE',
      'Gemini',
      'ai-drafts',
      `Generated ${parsed.length} AI question drafts for ${subject} (${className})`
    );

    res.json({ questions: parsed });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Gemini question generation error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate questions with AI' });
  }
});

// ==========================================
// 12. AUDIT LOGS, NOTIFICATIONS & BACKUP
// ==========================================
app.get('/api/audit-logs', (req: Request, res: Response) => {
  res.json(db.getData().auditLogs);
});

app.get('/api/notifications', (req: Request, res: Response) => {
  res.json(db.getData().notifications);
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const data = db.getData();
  const notif = data.notifications.find((n) => n.id === req.params.id);
  if (notif) notif.read = true;
  db.saveDatabase();
  res.json({ success: true });
});

app.post('/api/admin/seed-demo', (req: Request, res: Response) => {
  db.seedDemoData();
  res.json({ success: true, message: 'Demo data loaded successfully' });
});

app.post('/api/admin/reset-data', (req: Request, res: Response) => {
  db.resetToZeroData();
  res.json({ success: true, message: 'Reset to Zero-Data complete' });
});

app.get('/api/backup/export', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="abc_school_backup_${new Date().toISOString().split('T')[0]}.json"`
  );
  res.json(db.getData());
});

app.post('/api/backup/restore', (req: Request, res: Response) => {
  try {
    const backupData = req.body;
    if (!backupData || !backupData.settings || !Array.isArray(backupData.students)) {
      return res.status(400).json({ error: 'Invalid backup JSON file structure' });
    }
    db.saveDatabase(backupData);
    res.json({ success: true, message: 'Database restored successfully' });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// Bulk Promotion Workflow
app.post('/api/promotion/execute', (req: Request, res: Response) => {
  const data = db.getData();
  const { studentIds, fromClassId, toClassId, targetAcademicYearId, action } = req.body;

  if (!studentIds || !Array.isArray(studentIds)) {
    return res.status(400).json({ error: 'No students selected for promotion' });
  }

  let count = 0;
  studentIds.forEach((id: string) => {
    const student = data.students.find((s) => s.id === id);
    if (student) {
      if (action === 'promote') {
        student.currentClassId = toClassId;
        student.currentAcademicYearId = targetAcademicYearId;
        data.studentAcademicRecords.push({
          id: 'sar-' + Date.now() + '-' + count,
          studentId: student.id,
          academicYearId: targetAcademicYearId,
          classId: toClassId,
          sectionId: student.currentSectionId,
          rollNumber: student.rollNumber,
          promotionStatus: 'Promoted',
          remarks: `Promoted from class ${fromClassId} to ${toClassId}`,
        });
        count++;
      } else if (action === 'repeat') {
        student.currentAcademicYearId = targetAcademicYearId;
        data.studentAcademicRecords.push({
          id: 'sar-' + Date.now() + '-' + count,
          studentId: student.id,
          academicYearId: targetAcademicYearId,
          classId: student.currentClassId,
          sectionId: student.currentSectionId,
          rollNumber: student.rollNumber,
          promotionStatus: 'Repeated',
          remarks: 'Repeating class for academic improvement',
        });
        count++;
      }
    }
  });

  db.logAudit(
    'usr-admin',
    'Admin',
    'School Administrator',
    'BULK_PROMOTION',
    'Students',
    'bulk',
    `Executed ${action} for ${count} students`
  );

  db.saveDatabase();
  res.json({ success: true, count });
});

// Mount Vite or static files
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ABC School Management System server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
