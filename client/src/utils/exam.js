export const EXAM_TYPES = [
  { value: 'UNIT_TEST', label: 'Unit Test' },
  { value: 'MID_TERM', label: 'Mid Term' },
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'PRACTICAL', label: 'Practical' },
  { value: 'FINAL', label: 'Final' },
];

export const examTypeLabel = (value) =>
  EXAM_TYPES.find((t) => t.value === value)?.label || value;

export const calcPercentage = (obtained, max) => Math.round((obtained / max) * 10000) / 100;

// rules backend thi minPercent ghatta (desc) order ma aave chhe
export const gradeFromRules = (percentage, rules) => {
  if (percentage === null || percentage === undefined || Number.isNaN(percentage)) return null;
  return rules.find((r) => percentage >= r.minPercent)?.grade ?? null;
};