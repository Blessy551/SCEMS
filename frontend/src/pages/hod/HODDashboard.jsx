import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import EventCard from '../../components/common/EventCard';
import PageShell from '../PageShell';

const links = [
  { to: '/hod', icon: 'P', label: 'Pending Approvals' },
  { to: '/calendar', icon: 'A', label: 'Approved Events' },
  { to: '/hod/blocked-slots', icon: 'B', label: 'Blocked Slots' },
  { to: '/calendar', icon: 'C', label: 'Calendar' }
];

const badgeColor = (hours) => {
  if (hours > 24) return 'var(--color-approved-bg)';
  if (hours >= 6) return 'var(--color-awaiting-bg)';
  return 'var(--color-rejected-bg)';
};

const HODDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [escalations, setEscalations] = useState([]);

  const load = async () => {
    const [reqRes, escRes] = await Promise.all([
      api.get('/bookings/hod'),
      api.get('/admin/escalations')
    ]);
    setRequests(reqRes.data.data);
    setSelected(reqRes.data.data[0] || null);
    setEscalations(escRes.data.data);
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
    <PageShell links={links}>
      {escalations.length > 0 && (
        <div className="card" style={{ background: 'var(--color-awaiting-bg)', color: 'var(--color-awaiting-text)', padding: 14, marginBottom: 16 }}>
          {escalations.length} pending request(s) have crossed 48 hours.
        </div>
      )}
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(280px, 380px) 1fr' }}>
        <section className="card" style={{ padding: 12 }}>
          <h1 className="section-title">Pending Requests</h1>
          <div className="grid">
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
                  <label>HOD remarks</label>
                  <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button className="btn btn-primary" type="button" onClick={() => decide('approve')}>Approve</button>
                  <button className="btn btn-danger" type="button" onClick={() => decide('reject')}>Reject</button>
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

export default HODDashboard;
