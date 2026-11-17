import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import ConfirmModal from './ConfirmModal';
import NotificationBell from './NotificationBell';
import { ROLE_HOME, ROLE_LABEL } from '../utils/roles';
import { getDisplayName } from '../utils/format';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
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

        <div className="ms-auto d-flex align-items-center gap-2 gap-md-3">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={toggle}
            aria-label="Toggle dark mode"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <i className={`bi ${theme === 'dark' ? 'bi-sun' : 'bi-moon-stars'}`} />
          </button>

          <NotificationBell />

          <Link
            to={`${ROLE_HOME[user.role]}/profile`}
            className="text-end lh-sm text-decoration-none text-reset"
            title="My profile"
          >
            <div className="fw-semibold small">{getDisplayName(user)}</div>
            <span className="badge text-bg-primary">{ROLE_LABEL[user.role]}</span>
          </Link>

          <button className="btn btn-outline-danger btn-sm" onClick={() => setShowConfirm(true)}>
            <i className="bi bi-box-arrow-right me-1" />
            <span className="d-none d-sm-inline">Logout</span>
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