import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const PageShell = ({ links, children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        const rows = res.data.data || [];
        const nextUnread = rows.filter((n) => !n.IsRead).length;
        setNotifications(rows);
        setUnreadCount((current) => {
          if (nextUnread > current && current >= 0) {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 880;
            gain.gain.value = 0.05;
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
          }
          return nextUnread;
        });
      } catch {
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 8000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    await api.post(`/notifications/${id}/read`);
    setNotifications((rows) => rows.map((n) => (n.NotifID === id ? { ...n, IsRead: 1 } : n)));
    setUnreadCount((count) => Math.max(0, count - 1));
  };

  const markAllRead = async () => {
    await api.post('/notifications/read-all');
    setNotifications((rows) => rows.map((n) => ({ ...n, IsRead: 1 })));
    setUnreadCount(0);
  };

  return (
    <div className="app-shell">
      <Navbar unreadCount={unreadCount} notifications={notifications} onMarkRead={markRead} onMarkAllRead={markAllRead} />
      <div className="layout">
        <Sidebar links={links} />
        <main className="main">{children}</main>
      </div>
    </div>
  );
};

export default PageShell;
