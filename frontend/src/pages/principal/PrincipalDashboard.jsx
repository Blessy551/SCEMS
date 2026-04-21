import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axiosInstance';
import StatusBadge from '../../components/common/StatusBadge';
import PageShell from '../PageShell';

const links = [
  { to: '/principal', icon: '📊', label: 'Dashboard' },
  { to: '/calendar', icon: '📅', label: 'All Events' },
  { to: '/principal', icon: '🛑', label: 'Cancel Events' }
];

const PrincipalDashboard = () => {
  const [requests, setRequests] = useState([]);

  const load = () => api.get('/admin/events').then((res) => setRequests(res.data.data));

  useEffect(() => {
    load().catch(() => setRequests([]));
  }, []);

  const stats = useMemo(() => ({
    total: requests.length,
    upcoming: requests.filter((r) => r.Status === 'Upcoming').length,
    cancelled: requests.filter((r) => r.Status === 'Cancelled').length
  }), [requests]);

  const forceCancel = async (id) => {
    const reason = window.prompt('Reason for force cancellation') || '';
    await api.post(`/events/${id}/cancel`, { reason });
    load();
  };

  return (
    <PageShell links={links}>
      <h1 className="section-title">Principal Events Console</h1>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', marginBottom: 20 }}>
        {[
          ['Total Events', stats.total],
          ['Upcoming Events', stats.upcoming],
          ['Cancelled Events', stats.cancelled]
        ].map(([label, value]) => (
          <div className="card" key={label} style={{ borderTop: '4px solid var(--color-accent)', padding: 16 }}>
            <strong style={{ color: 'var(--color-primary)', fontSize: '2rem' }}>{value}</strong>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>
      <section className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Organiser</th>
              <th>Venue</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.EventID}>
                <td>{request.EventName}</td>
                <td>{request.OrganizerName}<br />{request.ClubName}</td>
                <td>{request.VenueName}</td>
                <td><StatusBadge status={request.Status} /></td>
                <td>{request.EventDate}</td>
                <td>
                  {request.Status !== 'Cancelled' && (
                    <button className="btn btn-danger" type="button" onClick={() => forceCancel(request.EventID)}>Cancel Event</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageShell>
  );
};

export default PrincipalDashboard;
