import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const roleLinks = {
  Organiser: [
    { to: '/organiser', label: 'Dashboard' },
    { to: '/organiser/venues', label: 'Venues' },
    { to: '/calendar', label: 'Calendar' }
  ],
  HOD: [
    { to: '/hod', label: 'Approvals' },
    { to: '/hod/blocked-slots', label: 'Blocked Slots' },
    { to: '/calendar', label: 'Calendar' }
  ],
  Principal: [
    { to: '/principal', label: 'Control Room' },
    { to: '/principal/audit-log', label: 'Audit Log' },
    { to: '/calendar', label: 'Calendar' }
  ]
};

const Navbar = ({ unreadCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = roleLinks[user?.role] || [];

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
      <nav className="navbar-links" aria-label="Primary">
        {links.map((link) => (
          <Link key={link.to} to={link.to}>{link.label}</Link>
        ))}
      </nav>
      <div className="navbar-actions">
        <button className="bell" type="button" title="Notifications" aria-label="Notifications">
          <span aria-hidden="true">Bell</span>
          {unreadCount > 0 && <strong>{unreadCount}</strong>}
        </button>
        <span className="role-chip">{user?.role}</span>
        <button className="logout" type="button" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Navbar;
