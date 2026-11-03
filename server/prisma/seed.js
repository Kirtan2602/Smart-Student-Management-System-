import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const seedPassword = process.env.SEED_PASSWORD;

  if (!adminEmail || !seedPassword) {
    throw new Error('SEED_ADMIN_EMAIL ane SEED_PASSWORD .env ma set karo');
  }

  // Password ne hash karo (plain password kyarey store nahi thase)
  const passwordHash = await bcrypt.hash(seedPassword, 10);

  // ---------- 1. Departments ----------
  const deptData = [
    { name: 'Computer Engineering', code: 'CE' },
    { name: 'Information Technology', code: 'IT' },
    { name: 'Mechanical Engineering', code: 'ME' },
  ];
  const departments = {};
  for (const d of deptData) {
    departments[d.code] = await prisma.department.upsert({
      where: { code: d.code },
      update: {},
      create: d,
    });
  }

  // ---------- 2. Semesters 1 to 6 ----------
  const semesters = {};
  for (let n = 1; n <= 6; n++) {
    semesters[n] = await prisma.semester.upsert({
      where: { number: n },
      update: {},
      create: { number: n, name: `Semester ${n}` },
    });
  }

  // ---------- 3. Academic Year ----------
  const academicYear = await prisma.academicYear.upsert({
    where: { name: '2026-27' },
    update: {},
    create: {
      name: '2026-27',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2027-05-31'),
      isCurrent: true,
    },
  });

  // ---------- 4. Admin user ----------
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash, role: 'ADMIN' },
  });

  // ---------- 5. Subjects (CE, Semester 5) ----------
  const subjectData = [
    { code: 'CE-501', name: 'Full Stack Development' },
    { code: 'CE-502', name: 'Software Engineering' },
    { code: 'CE-503', name: 'Computer Networks' },
    { code: 'CE-504', name: 'Operating System' },
  ];
  const subjects = [];
  for (const s of subjectData) {
    const subject = await prisma.subject.upsert({
      where: { code: s.code },
      update: {},
      create: {
        ...s,
        departmentId: departments.CE.id,
        semesterId: semesters[5].id,
      },
    });
    subjects.push(subject);
  }

  // ---------- 6. Sample teacher ----------
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@example.com' },
    update: {},
    create: {
      email: 'teacher@example.com',
      passwordHash,
      role: 'TEACHER',
      teacher: {
        create: {
          employeeCode: 'T001',
          firstName: 'Rajesh',
          lastName: 'Patel',
          phone: '9000000001',
          designation: 'Lecturer',
          departmentId: departments.CE.id,
        },
      },
    },
  });
  const teacher = await prisma.teacher.findUnique({
    where: { userId: teacherUser.id },
  });

  // ---------- 7. Sample student ----------
  const studentUser = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      passwordHash,
      role: 'STUDENT',
      student: {
        create: {
          enrollmentNo: 'ENR2026001',
          firstName: 'Amit',
          lastName: 'Shah',
          phone: '9000000002',
          gender: 'MALE',
          departmentId: departments.CE.id,
          semesterId: semesters[5].id,
          academicYearId: academicYear.id,
        },
      },
    },
  });
  const student = await prisma.student.findUnique({
    where: { userId: studentUser.id },
  });

  // ---------- 8. Teacher ne subjects assign + Student ne enroll ----------
  for (const subject of subjects) {
    await prisma.teacherSubject.upsert({
      where: {
        teacherId_subjectId_academicYearId: {
          teacherId: teacher.id,
          subjectId: subject.id,
          academicYearId: academicYear.id,
        },
      },
      update: {},
      create: {
        teacherId: teacher.id,
        subjectId: subject.id,
        academicYearId: academicYear.id,
      },
    });

    await prisma.studentSubject.upsert({
      where: {
        studentId_subjectId_academicYearId: {
          studentId: student.id,
          subjectId: subject.id,
          academicYearId: academicYear.id,
        },
      },
      update: {},
      create: {
        studentId: student.id,
        subjectId: subject.id,
        academicYearId: academicYear.id,
      },
    });
  }

  console.log('Seed completed successfully');
  console.log(`Admin login   : ${adminEmail}`);
  console.log('Teacher login : teacher@example.com');
  console.log('Student login : student@example.com');
  console.log('Password (badha mate): .env ma SEED_PASSWORD ma chhe');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });