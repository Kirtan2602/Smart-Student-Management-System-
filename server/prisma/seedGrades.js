import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default grades. Pachhi admin panel mathi badli shakay.
// "update: {}" etle admin e badlela grades fari seed karta overwrite nahi thay
const rules = [
  { grade: 'A+', minPercent: 90, gradePoint: 10 },
  { grade: 'A', minPercent: 80, gradePoint: 9 },
  { grade: 'B', minPercent: 70, gradePoint: 8 },
  { grade: 'C', minPercent: 60, gradePoint: 7 },
  { grade: 'D', minPercent: 50, gradePoint: 6 },
  { grade: 'E', minPercent: 35, gradePoint: 5 },
  { grade: 'F', minPercent: 0, gradePoint: 0 },
];

async function main() {
  for (const r of rules) {
    await prisma.gradeRule.upsert({
      where: { grade: r.grade },
      update: {},
      create: r,
    });
  }
  console.log(`Grade rules ready (${rules.length})`);
}

main()
  .catch((err) => {
    console.error('Grade seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());