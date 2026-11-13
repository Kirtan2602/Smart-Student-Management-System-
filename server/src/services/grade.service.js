import prisma from '../config/db.js';
import ApiError from '../utils/ApiError.js';

const toRule = (r) => ({
  id: r.id,
  grade: r.grade,
  minPercent: Number(r.minPercent),
  gradePoint: Number(r.gradePoint),
});

// Sauthi vadhare minPercent pehla (sorted), jethi gradeFor() saral rahe
export const getGradeRules = async () => {
  const rules = await prisma.gradeRule.findMany({ orderBy: { minPercent: 'desc' } });
  return rules.map(toRule);
};

// Percentage ne kayo grade malse? Pehlo rule jeni minPercent <= percentage
export const gradeFor = (percentage, rules) => {
  if (percentage === null || percentage === undefined) return null;
  return rules.find((r) => percentage >= r.minPercent) || null;
};

export const createGradeRule = async ({ grade, minPercent, gradePoint }) =>
  toRule(await prisma.gradeRule.create({ data: { grade, minPercent, gradePoint } }));

export const updateGradeRule = async (id, data) => {
  const existing = await prisma.gradeRule.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Grade rule not found');

  // 0% no rule hamesha hovo joie, nahi to koi percentage ne grade na male
  if (Number(existing.minPercent) === 0 && data.minPercent !== undefined && data.minPercent !== 0) {
    throw new ApiError(400, 'The lowest grade must always start from 0%');
  }

  const { grade, minPercent, gradePoint } = data;
  return toRule(
    await prisma.gradeRule.update({
      where: { id },
      data: {
        ...(grade !== undefined && { grade }),
        ...(minPercent !== undefined && { minPercent }),
        ...(gradePoint !== undefined && { gradePoint }),
      },
    })
  );
};

export const deleteGradeRule = async (id) => {
  const existing = await prisma.gradeRule.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Grade rule not found');
  if (Number(existing.minPercent) === 0) {
    throw new ApiError(400, 'The lowest grade (0%) cannot be deleted, otherwise some marks would have no grade');
  }
  await prisma.gradeRule.delete({ where: { id } });
};