// Attendance percentage: lal = ochhu (low), lilo = barabar
export default function PercentBadge({ value, isLow }) {
  if (value === null || value === undefined) {
    return <span className="text-muted">N/A</span>;
  }
  return <span className={`badge ${isLow ? 'text-bg-danger' : 'text-bg-success'}`}>{value}%</span>;
}