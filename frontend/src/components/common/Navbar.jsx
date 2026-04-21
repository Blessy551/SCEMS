import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = ({ unreadCount = 0, notifications = [], onMarkRead, onMarkAllRead }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <span>SCEMS</span>
        <small>VNRVJIET</small>
      </Link>
      <nav className="navbar-links">
        {user?.role === 'Organiser' && (
          <Link to="/book/venues" className="nav-link">Book a Venue</Link>
        )}
        {user?.role === 'HOD' && (
          <Link to="/hod/requests" className="nav-link">Pending Requests</Link>
        )}
        <Link to="/notifications" className="nav-link">Notifications</Link>
      </nav>
      <div className="navbar-spacer" />
      <div className="navbar-actions">
        <button className="bell" type="button" title="Notifications" aria-label="Notifications" onClick={() => setShowDropdown((s) => !s)}>
          <span aria-hidden="true">🔔</span>
          {unreadCount > 0 && <strong>{unreadCount}</strong>}
        </button>
        {showDropdown && (
          <div className="notif-dropdown">
            <div className="notif-dropdown-head">
              <span>Notifications</span>
              <button type="button" onClick={onMarkAllRead}>Mark all read</button>
            </div>
            <div className="notif-list">
              {notifications.length === 0 && <p className="notif-empty">No notifications yet.</p>}
              {notifications.map((notif) => (
                <button
                  key={notif.NotifID}
                  type="button"
                  className={notif.IsRead ? 'notif-item' : 'notif-item unread'}
                  onClick={() => {
                    onMarkRead(notif.NotifID);
                    navigate('/notifications');
                  }}
                >
                  <span>{notif.Message}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="user-profile">
          <span className="user-name">{user?.name}</span>
          <span className="role-chip">{user?.role}</span>
        </div>
        <button className="logout" type="button" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Navbar;
