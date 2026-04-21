import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ links }) => (
  <aside className="sidebar">
    {links.map((link) => (
      <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? 'active' : undefined}>
        <span>{link.icon}</span>
        <strong>{link.label}</strong>
      </NavLink>
    ))}
  </aside>
);

export default Sidebar;
