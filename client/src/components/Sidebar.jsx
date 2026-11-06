import { NavLink } from 'react-router-dom';
import { MENU_BY_ROLE } from '../utils/roles';

export default function Sidebar({ role, open, onClose }) {
  const items = MENU_BY_ROLE[role] || [];

  return (
    <>
      {open && <div className="sidebar-overlay d-lg-none" onClick={onClose} />}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <i className="bi bi-mortarboard-fill fs-2" />
          <div>
            <div className="fw-bold lh-1">SSMS</div>
            <small className="opacity-75">Student Management</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {items.map((item) =>
            item.path ? (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
              </NavLink>
            ) : (
              <span
                key={item.label}
                className="sidebar-link disabled"
                title={`Available in ${item.phase}`}
              >
                <i className={`bi ${item.icon}`} />
                <span>{item.label}</span>
                <small className="badge text-bg-secondary ms-auto">Soon</small>
              </span>
            )
          )}
        </nav>
      </aside>
    </>
  );
}