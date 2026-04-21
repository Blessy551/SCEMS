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

const HODApprovedEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = () => {
    setLoading(true);
    api.get('/bookings/hod/approved')
      .then((res) => setEvents(res.data.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCancel = async (event) => {
    const reason = window.prompt(`Enter cancellation reason for "${event.EventName}":`);
    if (reason === null) return;
    if (!reason.trim()) {
      alert('Reason is required to cancel an event.');
      return;
    }

    try {
      await api.post(`/events/${event.EventID}/cancel`, { reason });
      setEvents((prev) => prev.filter((e) => e.EventID !== event.EventID));
      alert('Event successfully cancelled.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel the event.');
    }
  };

  return (
    <PageShell links={hodLinks}>
      <h1 className="section-title">Approved Events</h1>
      {loading ? (
        <p>Loading events...</p>
      ) : events.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <p>No approved events yet.</p>
        </div>
      ) : (
        <div className="grid">
          {events.map((event) => (
            <EventCard
              key={event.RequestID}
              event={event}
              actions={<button className="btn btn-danger" onClick={() => handleCancel(event)}>Cancel Event</button>}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default HODApprovedEventsPage;
