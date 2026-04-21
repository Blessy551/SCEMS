import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import PageShell from '../PageShell';

const links = [
  { to: '/principal', icon: 'O', label: 'Overview' },
  { to: '/calendar', icon: 'C', label: 'Calendar' },
  { to: '/principal/audit-log', icon: 'A', label: 'Audit Log' }
];

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [action, setAction] = useState('');

  useEffect(() => {
    api.get('/admin/audit-log', { params: action ? { action } : {} })
      .then((res) => setLogs(res.data.data))
      .catch(() => setLogs([]));
  }, [action]);

  return (
    <PageShell links={links}>
      <h1 className="section-title">Audit Log</h1>
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="field">
          <label>Action type</label>
          <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="BookingApproved" />
        </div>
      </div>
      <section className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Role</th>
              <th>Action</th>
              <th>Entity</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.LogID}>
                <td>{log.Timestamp}</td>
                <td>{log.ActorName || log.ActorUserID}</td>
                <td>{log.ActorRole}</td>
                <td>{log.ActionType}</td>
                <td>{log.TargetEntityType} #{log.TargetEntityID}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageShell>
  );
};

export default AuditLogPage;
