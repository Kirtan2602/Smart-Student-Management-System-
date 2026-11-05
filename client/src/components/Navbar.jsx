import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import ConfirmModal from './ConfirmModal';
import { ROLE_LABEL } from '../utils/roles';
import { getDisplayName } from '../utils/format';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    await logout(); // user null thase, ProtectedRoute /login par moklse
  };

  return (
    <>
      <header className="topbar">
        <button
          className="btn btn-outline-primary d-lg-none"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <i className="bi bi-list fs-5" />
        </button>

        <div className="fw-semibold d-none d-sm-block">Smart Student Management System</div>

        <div className="ms-auto d-flex align-items-center gap-3">
          <div className="text-end lh-sm">
            <div className="fw-semibold small">{getDisplayName(user)}</div>
            <span className="badge text-bg-primary">{ROLE_LABEL[user.role]}</span>
          </div>
          <button className="btn btn-outline-danger btn-sm" onClick={() => setShowConfirm(true)}>
            <i className="bi bi-box-arrow-right me-1" />
            Logout
          </button>
        </div>
      </header>

      <ConfirmModal
        show={showConfirm}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Yes, logout"
        busy={busy}
        onConfirm={handleLogout}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}