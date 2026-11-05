// Confirmation dialog (Bootstrap ni CSS, React thi control)
export default function ConfirmModal({
  show,
  title,
  message,
  confirmText = 'Confirm',
  onConfirm,
  onCancel,
  busy = false,
}) {
  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" aria-label="Close" onClick={onCancel} />
            </div>
            <div className="modal-body">{message}</div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onCancel} disabled={busy}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={onConfirm} disabled={busy}>
                {busy ? 'Please wait...' : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}