// Reusable popup form (add/edit mate)
export default function FormModal({
  title,
  onClose,
  onSubmit,
  submitting = false,
  error = '',
  submitText = 'Save',
  size = '',
  children,
}) {
  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className={`modal-dialog modal-dialog-centered modal-dialog-scrollable ${size}`}>
          <form className="modal-content" onSubmit={onSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger py-2">
                  <i className="bi bi-exclamation-circle me-2" />
                  {error}
                </div>
              )}
              {children}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}