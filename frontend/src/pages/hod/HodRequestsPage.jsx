import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import EventCard from '../../components/common/EventCard';
import PageShell from '../PageShell';

const hodLinks = [
  { to: '/hod',            icon: '🏠', label: 'Dashboard' },
  { to: '/hod/requests',   icon: '📝', label: 'Pending Requests' },
  { to: '/hod/approved',   icon: '✅', label: 'Approved Events' },
  { to: '/hod/calendar',   icon: '📅', label: 'Calendar' },
  { to: '/notifications',  icon: '🔔', label: 'Notifications' },
];

const badgeColor = (hours) => {
  if (hours > 24) return 'var(--color-approved-bg)';
  if (hours >= 6) return 'var(--color-awaiting-bg)';
  return 'var(--color-rejected-bg)';
};

const HodRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState('');

  const load = async () => {
    const res = await api.get('/bookings/hod');
    setRequests(res.data.data);
    if (res.data.data.length > 0 && !selected) {
      setSelected(res.data.data[0]);
    }
  };

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const decide = async (action) => {
    if (!selected) return;
    await api.post(`/bookings/${selected.RequestID}/${action}`, { remarks });
    setRequests((current) => current.filter((item) => item.RequestID !== selected.RequestID));
    setSelected(null);
    setRemarks('');
  };

  return (
    <PageShell links={hodLinks}>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(280px, 380px) 1fr' }}>
        <section className="card" style={{ padding: 12 }}>
          <h1 className="section-title">Pending Requests</h1>
          <div className="grid">
            {requests.length === 0 && <p>No pending requests.</p>}
            {requests.map((request) => (
              <button
                key={request.RequestID}
                className="card"
                type="button"
                onClick={() => setSelected(request)}
                style={{
                  borderLeft: selected?.RequestID === request.RequestID ? '3px solid var(--color-primary)' : '3px solid transparent',
                  padding: 12,
                  textAlign: 'left'
                }}
              >
                <strong>{request.EventName}</strong>
                <p style={{ margin: '4px 0', color: 'var(--color-text-muted)' }}>{request.OrganizerName} | {request.RequestedDate}</p>
                <span className="status" style={{ background: badgeColor(request.HoursLeft), color: 'var(--color-text)' }}>
                  {request.HoursLeft}h left to respond
                </span>
              </button>
            ))}
          </div>
        </section>
        <section>
          {selected ? (
            <div className="grid">
              <EventCard event={selected} />
              <div className="card" style={{ padding: 16 }}>
                <div className="field">
                  <label>Reason for cancellation</label>
                  <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Provide a reason..." />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button className="btn btn-primary" type="button" onClick={() => decide('approve')}>Approve</button>
                  <button className="btn btn-danger" type="button" onClick={() => decide('reject')}>Cancel Request</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: 24 }}>Select a request to review.</div>
          )}
        </section>
      </div>
    </PageShell>
  );
};

export default HodRequestsPage;
