export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="alert alert-danger d-flex align-items-center justify-content-between flex-wrap gap-2">
      <div>
        <i className="bi bi-exclamation-triangle-fill me-2" />
        {message}
      </div>
      {onRetry && (
        <button className="btn btn-sm btn-outline-danger" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}