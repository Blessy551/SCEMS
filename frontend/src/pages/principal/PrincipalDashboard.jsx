import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axiosInstance';
import StatusBadge from '../../components/common/StatusBadge';
import PageShell from '../PageShell';

const links = [
  { to: '/principal', icon: 'O', label: 'Overview' },
  { to: '/calendar', icon: 'C', label: 'Calendar' },
  { to: '/principal/audit-log', icon: 'A', label: 'Audit Log' }
];

const PrincipalDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('Overview');

  const load = () => api.get('/admin/requests').then((res) => setRequests(res.data.data));

  useEffect(() => {
    load().catch(() => setRequests([]));
  }, []);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((r) => r.Status === 'Pending').length,
    escalations: requests.filter((r) => r.Status === 'Pending').length,
    late: requests.filter((r) => r.IsLateCancellation).length
  }), [requests]);

  const overrideApprove = async (id) => {
    await api.post(`/admin/requests/${id}/override-approve`);
    load();
  };

  const forceCancel = async (id) => {
    const reason = window.prompt('Reason for force cancellation') || '';
    await api.post(`/admin/requests/${id}/force-cancel`, { reason });
    load();
  };

  const visible = activeTab === 'Late Cancellations'
    ? requests.filter((r) => r.IsLateCancellation)
    : activeTab === 'Escalations'
      ? requests.filter((r) => r.Status === 'Pending')
      : requests;

  return (
    <PageShell links={links}>
      <h1 className="section-title">Principal Control Room</h1>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', marginBottom: 20 }}>
        {[
          ['Total Events', stats.total],
          ['Pending Approvals', stats.pending],
          ['Active Escalations', stats.escalations],
          ['Late Cancellations', stats.late]
        ].map(([label, value]) => (
          <div className="card" key={label} style={{ borderTop: '4px solid var(--color-accent)', padding: 16 }}>
            <strong style={{ color: 'var(--color-primary)', fontSize: '2rem' }}>{value}</strong>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {['Overview', 'All Requests', 'Escalations', 'Late Cancellations'].map((tab) => (
          <button key={tab} className={activeTab === tab ? 'btn btn-primary' : 'btn btn-outline'} type="button" onClick={() => setActiveTab(tab)}>{tab}</button>
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
            {visible.map((request) => (
              <tr key={request.RequestID}>
                <td>{request.EventName}</td>
                <td>{request.OrganizerName}<br />{request.ClubName}</td>
                <td>{request.VenueName}</td>
                <td><StatusBadge status={request.Status} /></td>
                <td>{request.RequestedDate}</td>
                <td>
                  {request.Status !== 'Approved' && request.Status !== 'Cancelled' && (
                    <button className="btn btn-outline" type="button" onClick={() => overrideApprove(request.RequestID)}>Override Approve</button>
                  )}
                  {request.Status !== 'Cancelled' && (
                    <button className="btn btn-danger" type="button" onClick={() => forceCancel(request.RequestID)}>Force Cancel</button>
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
