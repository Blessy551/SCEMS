import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import PageShell from './PageShell';
import { useAuth } from '../context/AuthContext';

const linksByRole = {
  Organiser: [
    { to: '/organiser', icon: '🏠', label: 'Dashboard' },
    { to: '/organiser/venues', icon: '📍', label: 'Book Venue' },
    { to: '/calendar', icon: '📅', label: 'My Events' },
    { to: '/notifications', icon: '🔔', label: 'Notifications' }
  ],
  HOD: [
    { to: '/hod', icon: '🏠', label: 'Dashboard' },
    { to: '/hod', icon: '📝', label: 'Pending Requests' },
    { to: '/calendar', icon: '✅', label: 'Approved Events' },
    { to: '/notifications', icon: '🔔', label: 'Notifications' }
  ],
  Principal: [
    { to: '/principal', icon: '🏠', label: 'Dashboard' },
    { to: '/calendar', icon: '📅', label: 'All Events' },
    { to: '/principal', icon: '🛑', label: 'Cancel Events' }
  ]
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/notifications').then((res) => setItems(res.data.data || [])).catch(() => setItems([]));
  }, []);

  return (
    <PageShell links={linksByRole[user?.role] || []}>
      <h1 className="section-title">Notifications</h1>
      <section className="card" style={{ padding: 16 }}>
        {items.length === 0 && <p style={{ margin: 0 }}>No notifications found.</p>}
        {items.map((item) => (
          <article key={item.NotifID} style={{ borderBottom: '1px solid var(--color-border)', padding: '10px 0' }}>
            <strong>{item.Message}</strong>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{item.Type} | {item.CreatedAt}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
};

export default NotificationsPage;
