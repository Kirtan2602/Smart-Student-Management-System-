import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/report.service.js';
import { getSemesterResults } from '../services/result.service.js';
import { sendTable } from '../utils/exporter.js';
import { sendCsv } from '../utils/csv.js';
import {
  startPdf,
  pdfHeader,
  pdfSection,
  pdfKeyValues,
  pdfTable,
  finishPdf,
} from '../utils/pdf.js';
import { logActivity } from '../utils/activityLogger.js';

const RESULT_LABEL = { PASS: 'Pass', FAIL: 'Fail', INCOMPLETE: 'Incomplete', NOT_DECLARED: 'Not declared' };
const label = (r) => RESULT_LABEL[r] || '';
const blank = (v) => (v === null || v === undefined ? '' : v);
const fullName = (s) => `${s.firstName} ${s.lastName}`;
const toNum = (v) => (v ? Number(v) : undefined);

const logExport = (req, entity, details) =>
  logActivity({
    userId: req.user.id,
    action: 'EXPORT_REPORT',
    entity,
    details,
    ipAddress: req.ip,
  });

// ---------------- JSON ----------------
export const overview = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await service.getOverview() });
});

export const subjectReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const data = await service.getSubjectCombined(req.user, req.params.id, { from, to });
  res.json({ success: true, data });
});

export const studentReport = asyncHandler(async (req, res) => {
  const data = await service.getStudentReport(req.params.id);
  res.json({ success: true, data });
});

export const myReport = asyncHandler(async (req, res) => {
  const studentId = await service.getStudentIdByUser(req.user.id);
  res.json({ success: true, data: await service.getStudentReport(studentId) });
});

// ---------------- Exports ----------------
export const exportStudents = asyncHandler(async (req, res) => {
  const { format, departmentId, semesterId, isActive } = req.query;
  const students = await service.getStudentsForExport({
    departmentId: toNum(departmentId),
    semesterId: toNum(semesterId),
    isActive: isActive === undefined ? undefined : isActive === 'true',
  });

  await logExport(req, 'Student', `Exported students list (${format.toUpperCase()}, ${students.length} rows)`);

  sendTable(res, {
    format,
    filename: 'students-list',
    title: 'Students List',
    lines: [`Total students: ${students.length}`],
    landscape: true,
    columns: [
      { label: 'Enrollment No', w: 2 },
      { label: 'Name', w: 3 },
      { label: 'Email', w: 4 },
      { label: 'Dept', w: 1 },
      { label: 'Sem', w: 0.8, align: 'center' },
      { label: 'Academic Year', w: 1.6 },
      { label: 'Phone', w: 2 },
      { label: 'Status', w: 1.3 },
    ],
    rows: students.map((s) => [
      s.enrollmentNo,
      fullName(s),
      s.user.email,
      s.department.code,
      s.semester.number,
      s.academicYear.name,
      blank(s.phone),
      s.isActive ? 'Active' : 'Inactive',
    ]),
  });
});

export const exportSubject = asyncHandler(async (req, res) => {
  const { format, from, to } = req.query;
  const d = await service.getSubjectCombined(req.user, req.params.id, { from, to });

  await logExport(req, 'Subject', `Exported subject report ${d.subject.code} (${format.toUpperCase()})`);

  const lines = [
    `Academic Year: ${d.academicYear}`,
    `Lectures held: ${d.totalSessions}  |  Minimum attendance: ${d.threshold}%  |  Below minimum: ${d.lowCount} student(s)`,
  ];
  if (from || to) lines.push(`Attendance period: ${from || 'start'} to ${to || 'today'}`);

  sendTable(res, {
    format,
    filename: `subject-report-${d.subject.code}`,
    title: `Subject Report: ${d.subject.code} - ${d.subject.name}`,
    lines,
    landscape: true,
    columns: [
      { label: 'Enrollment No', w: 2.2 },
      { label: 'Name', w: 3.2 },
      { label: 'Present', w: 1, align: 'center' },
      { label: 'Absent', w: 1, align: 'center' },
      { label: 'Total', w: 1, align: 'center' },
      { label: 'Attendance %', w: 1.5, align: 'center' },
      { label: 'Marks', w: 1.1, align: 'center' },
      { label: 'Max', w: 1, align: 'center' },
      { label: 'Marks %', w: 1.2, align: 'center' },
      { label: 'Grade', w: 1, align: 'center' },
      { label: 'Result', w: 1.2, align: 'center' },
    ],
    rows: d.rows.map((r) => [
      r.enrollmentNo,
      fullName(r),
      r.present,
      r.absent,
      r.total,
      blank(r.percentage),
      blank(r.marksTotal),
      blank(r.marksMax),
      blank(r.marksPercentage),
      blank(r.grade),
      label(r.result),
    ]),
  });
});

export const exportSemester = asyncHandler(async (req, res) => {
  const { format, semesterId, departmentId, academicYearId } = req.query;
  const d = await getSemesterResults(req.user, {
    semesterId: Number(semesterId),
    departmentId: Number(departmentId),
    academicYearId: toNum(academicYearId),
  });

  await logExport(
    req,
    'Semester',
    `Exported semester results ${d.department.code} ${d.semester.name} (${format.toUpperCase()})`
  );

  sendTable(res, {
    format,
    filename: `semester-results-${d.department.code}-sem${d.semester.number}`,
    title: `Semester Results: ${d.department.name} - ${d.semester.name}`,
    lines: [
      `Academic Year: ${d.academicYear}`,
      `Students: ${d.stats.students}  |  Pass: ${d.stats.pass}  |  Fail: ${d.stats.fail}  |  Incomplete: ${d.stats.incomplete}  |  Pass %: ${d.stats.passPercentage ?? 'N/A'}`,
    ],
    landscape: true,
    columns: [
      { label: 'Enrollment No', w: 2.2 },
      { label: 'Name', w: 3 },
      ...d.subjects.map((s) => ({ label: s.code, w: 1.6, align: 'center' })),
      { label: 'Overall %', w: 1.3, align: 'center' },
      { label: 'Grade', w: 1, align: 'center' },
      { label: 'GPA', w: 1, align: 'center' },
      { label: 'Result', w: 1.5, align: 'center' },
    ],
    rows: d.rows.map((r) => {
      const bySubject = Object.fromEntries(r.subjects.map((s) => [s.subjectId, s]));
      return [
        r.student.enrollmentNo,
        fullName(r.student),
        ...d.subjects.map((s) => {
          const x = bySubject[s.id];
          return x?.hasResult ? `${x.percentage}% ${x.grade ?? ''}`.trim() : '';
        }),
        blank(r.overall?.percentage),
        blank(r.overall?.grade),
        blank(r.overall?.gpa),
        label(r.overall?.result),
      ];
    }),
  });
});

// Student report: admin (id thi) ane student (potani) banne mate same builder
const sendStudentReport = (res, format, r) => {
  const { student } = r;
  const name = fullName(student);
  const filename = `student-report-${student.enrollmentNo}`;

  const subjectRows = r.subjects.map((s) => [
    s.code,
    s.name,
    `${s.present}/${s.attendanceTotal}`,
    blank(s.attendancePercentage),
    blank(s.marksTotal),
    blank(s.marksMax),
    blank(s.marksPercentage),
    blank(s.grade),
    label(s.result),
  ]);

  if (format === 'csv') {
    return sendCsv(
      res,
      `${filename}.csv`,
      ['Subject Code', 'Subject', 'Lectures Present/Total', 'Attendance %', 'Marks', 'Max Marks', 'Marks %', 'Grade', 'Result'],
      subjectRows
    );
  }

  const doc = startPdf(res, `${filename}.pdf`);
  pdfHeader(doc, 'Student Performance Report', [
    `${name} (${student.enrollmentNo})`,
    `${student.department.name} | ${student.semester.name} | Academic Year ${r.academicYear}`,
    `Email: ${student.email}`,
  ]);

  const att = r.attendance;
  pdfSection(doc, 'Summary');
  pdfKeyValues(doc, [
    [
      'Overall attendance',
      att.percentage !== null ? `${att.percentage}% (${att.present}/${att.total} lectures)` : 'No attendance recorded',
    ],
    ['Minimum required', `${r.threshold}%`],
    ...r.semesters.map((g) => [
      g.semester.name,
      `${label(g.overall.result)}${
        g.overall.percentage !== null
          ? ` - ${g.overall.percentage}%, Grade ${g.overall.grade ?? '-'}, GPA ${g.overall.gpa ?? '-'}`
          : ''
      }`,
    ]),
    ...(r.insights.bestSubject
      ? [['Best subject', `${r.insights.bestSubject.code} (${r.insights.bestSubject.percentage}%)`]]
      : []),
    ...(r.insights.lowAttendanceSubjects.length
      ? [['Low attendance in', r.insights.lowAttendanceSubjects.join(', ')]]
      : []),
    ...(r.insights.failedSubjects.length ? [['Failed subjects', r.insights.failedSubjects.join(', ')]] : []),
  ]);

  pdfSection(doc, 'Subject-wise Attendance and Marks');
  pdfTable(
    doc,
    [
      { label: 'Code', w: 1.6 },
      { label: 'Subject', w: 3.4 },
      { label: 'Present', w: 1.3, align: 'center' },
      { label: 'Att %', w: 1, align: 'center' },
      { label: 'Marks', w: 1, align: 'center' },
      { label: 'Max', w: 1, align: 'center' },
      { label: '%', w: 1, align: 'center' },
      { label: 'Grade', w: 1, align: 'center' },
      { label: 'Result', w: 1.2, align: 'center' },
    ],
    subjectRows
  );

  pdfSection(doc, 'Exam-wise Marks (published exams)');
  pdfTable(
    doc,
    [
      { label: 'Subject', w: 1.5 },
      { label: 'Exam', w: 3.5 },
      { label: 'Marks', w: 1.3, align: 'center' },
      { label: '%', w: 1, align: 'center' },
      { label: 'Grade', w: 1, align: 'center' },
      { label: 'Result', w: 1.2, align: 'center' },
    ],
    r.exams.map((e) => [e.subjectCode, e.name, `${e.obtained}/${e.maxMarks}`, blank(e.percentage), blank(e.grade), label(e.result)])
  );

  return finishPdf(doc);
};

export const exportStudent = asyncHandler(async (req, res) => {
  const report = await service.getStudentReport(req.params.id);
  await logExport(
    req,
    'Student',
    `Exported student report ${report.student.enrollmentNo} (${req.query.format.toUpperCase()})`
  );
  sendStudentReport(res, req.query.format, report);
});

export const exportMy = asyncHandler(async (req, res) => {
  const studentId = await service.getStudentIdByUser(req.user.id);
  const report = await service.getStudentReport(studentId);
  await logExport(req, 'Student', `Downloaded own report (${req.query.format.toUpperCase()})`);
  sendStudentReport(res, req.query.format, report);
});