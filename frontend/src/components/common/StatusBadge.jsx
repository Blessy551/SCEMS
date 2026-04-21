import './StatusBadge.css';

const map = {
  Pending: 'pending',
  Approved: 'approved',
  Rejected: 'rejected',
  Cancelled: 'cancelled',
  Queued: 'queued',
  'Awaiting Confirmation': 'awaiting'
};

const StatusBadge = ({ status }) => {
  const key = map[status] || 'pending';
  return <span className={`status status-${key}`}>{status}</span>;
};

export default StatusBadge;
