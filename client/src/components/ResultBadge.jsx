const MAP = {
  PASS: ['success', 'Pass'],
  FAIL: ['danger', 'Fail'],
  INCOMPLETE: ['warning', 'Incomplete'],
  NOT_DECLARED: ['secondary', 'Not declared'],
};

export default function ResultBadge({ result }) {
  if (!result || !MAP[result]) return <span className="text-muted">-</span>;
  const [color, label] = MAP[result];
  return <span className={`badge text-bg-${color}`}>{label}</span>;
}