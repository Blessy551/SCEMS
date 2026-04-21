import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import PageShell from './PageShell';
import { useAuth } from '../context/AuthContext';

const linksByRole = {
  Organiser: [
    { to: '/organiser', icon: '🏠', label: 'Dashboard' },
    { to: '/book/venues', icon: '📍', label: 'Book a Venue' },
    { to: '/calendar', icon: '📅', label: 'My Events' },
    { to: '/notifications', icon: '🔔', label: 'Notifications' }
  ],
  HOD: [
    { to: '/hod',            icon: '🏠', label: 'Dashboard' },
    { to: '/hod/requests',   icon: '📝', label: 'Pending Requests' },
    { to: '/hod/approved',   icon: '✅', label: 'Approved Events' },
    { to: '/hod/calendar',   icon: '📅', label: 'Calendar' },
    { to: '/notifications',  icon: '🔔', label: 'Notifications' },
  ]
};

const NotificationsPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      setItems(res.data.data || []);
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <PageShell links={linksByRole[user?.role] || []}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 className="section-title" style={{ margin: 0 }}>Notifications</h1>
        <button className="btn btn-outline" onClick={load} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <section className="card" style={{ padding: 16 }}>
        {items.length === 0 && !loading && <p style={{ margin: 0 }}>No notifications found.</p>}
        {loading && <p style={{ margin: 0 }}>Loading notifications...</p>}
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
