export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.total === 0) return null;

  const { page, totalPages, total, limit } = meta;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3 border-top">
      <small className="text-muted">
        Showing {from}-{to} of {total}
      </small>
      <div className="btn-group">
        <button
          className="btn btn-sm btn-outline-primary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <i className="bi bi-chevron-left" /> Prev
        </button>
        <span className="btn btn-sm btn-light disabled">
          Page {page} / {totalPages}
        </span>
        <button
          className="btn btn-sm btn-outline-primary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next <i className="bi bi-chevron-right" />
        </button>
      </div>
    </div>
  );
}