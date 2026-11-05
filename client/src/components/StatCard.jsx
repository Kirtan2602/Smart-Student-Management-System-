export default function StatCard({ title, value, icon, color = 'primary', subtitle }) {
  return (
    <div className="card stat-card h-100">
      <div className="card-body d-flex align-items-center gap-3">
        <div className={`stat-icon bg-${color}-subtle text-${color}`}>
          <i className={`bi ${icon}`} />
        </div>
        <div>
          <div className="text-muted small">{title}</div>
          <div className="fs-3 fw-bold lh-1">{value}</div>
          {subtitle && <div className="text-muted small mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}