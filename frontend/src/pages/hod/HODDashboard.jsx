import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import PageShell from '../PageShell';

const hodLinks = [
  { to: '/hod',            icon: '🏠', label: 'Dashboard' },
  { to: '/hod/requests',   icon: '📝', label: 'Pending Requests' },
  { to: '/hod/approved',   icon: '✅', label: 'Approved Events' },
  { to: '/hod/calendar',   icon: '📅', label: 'Calendar' },
  { to: '/notifications',  icon: '🔔', label: 'Notifications' },
];

const HODDashboard = () => {
  const [stats, setStats] = useState({ pending: 0, approved: 0, escalations: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadDashboard = async () => {
    try {
      const [pendingRes, approvedRes, escRes] = await Promise.all([
        api.get('/bookings/hod'),
        api.get('/bookings/hod/approved'),
        api.get('/admin/escalations')
      ]);

      const pendingData = pendingRes.data.data;
      setStats({
        pending: pendingData.length,
        approved: approvedRes.data.data.length,
        escalations: escRes.data.data.length
      });
      setRecentRequests(pendingData.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <PageShell links={hodLinks}>
      <h1 className="section-title">HOD Overview</h1>

      {stats.escalations > 0 && (
        <div className="card" style={{ background: 'var(--color-rejected-bg)', color: 'var(--color-rejected-text)', padding: 16, marginBottom: 24, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>⚠️</span>
          <span>{stats.escalations} request(s) have been pending for more than 48 hours and require immediate action!</span>
        </div>
      )}

      <div className="stats-grid" style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: 32 }}>
        <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--color-primary)' }}>
          <small style={{ color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Approvals</small>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '8px 0' }}>{stats.pending}</div>
          <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.85rem' }} onClick={() => navigate('/hod/requests')}>Review All</button>
        </div>
        <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--color-approved-text)' }}>
          <small style={{ color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Approved Events</small>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '8px 0' }}>{stats.approved}</div>
          <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.85rem' }} onClick={() => navigate('/hod/approved')}>View List</button>
        </div>
        <div className="card" style={{ padding: 24, borderLeft: '4px solid var(--color-rejected-text)' }}>
          <small style={{ color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Escalations</small>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, margin: '8px 0' }}>{stats.escalations}</div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Over 48 hours pending</p>
        </div>
      </div>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Recent Pending Requests</h2>
          <button className="btn btn-primary" onClick={() => navigate('/hod/requests')}>Manage All</button>
        </div>

        {loading ? (
          <p>Loading requests...</p>
        ) : recentRequests.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--color-text-muted)' }}>
            No pending requests at the moment.
          </div>
        ) : (
          <div className="grid">
            {recentRequests.map((req) => (
              <div key={req.RequestID} className="card" style={{ padding: 16, cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/hod/requests')} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <strong style={{ fontSize: '1.1rem' }}>{req.EventName}</strong>
                  <span className="status" style={{ background: req.HoursLeft < 12 ? 'var(--color-rejected-bg)' : 'var(--color-awaiting-bg)', fontSize: '0.75rem' }}>
                    {req.HoursLeft}h left
                  </span>
                </div>
                <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  {req.OrganizerName} requested {req.VenueName}
                </p>
                <div style={{ marginTop: 12, fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                  Click to review &rarr;
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
};

export default HODDashboard;
