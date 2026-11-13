export default function GradeBadge({ grade }) {
  if (!grade) return <span className="text-muted">-</span>;
  return <span className="badge text-bg-primary">{grade}</span>;
}