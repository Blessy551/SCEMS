import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const PageShell = ({ links, children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        setUnreadCount(res.data.data.filter((n) => !n.IsRead).length);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 45000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-shell">
      <Navbar unreadCount={unreadCount} />
      <div className="layout">
        <Sidebar links={links} />
        <main className="main">{children}</main>
      </div>
    </div>
  );
};

export default PageShell;
