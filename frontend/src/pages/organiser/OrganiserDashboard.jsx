import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import EventCard from '../../components/common/EventCard';
import PageShell from '../PageShell';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/organiser', icon: '🏠', label: 'Dashboard' },
  { to: '/organiser/venues', icon: '📍', label: 'Book Venue' },
  { to: '/calendar', icon: '📅', label: 'My Events' },
  { to: '/notifications', icon: '🔔', label: 'Notifications' }
];

const OrganiserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  const load = async () => {
    const res = await api.get('/bookings/my');
    setBookings(res.data.data);
  };

  useEffect(() => {
    load().catch(() => setBookings([]));
  }, []);

  const stats = useMemo(() => ({
    total: bookings.length,
    approved: bookings.filter((b) => b.Status === 'Approved').length,
    pending: bookings.filter((b) => b.Status === 'Pending').length
  }), [bookings]);

  const cancel = async (booking) => {
    const reason = window.prompt('Cancellation reason, required for late cancellation') || '';
    await api.post(`/bookings/${booking.RequestID}/cancel`, { reason });
    load();
  };

  const cancelEvent = async (booking) => {
    if (!booking.EventID) return;
    const reason = window.prompt('Reason for event cancellation') || '';
    await api.post(`/events/${booking.EventID}/cancel`, { reason });
    load();
  };

  return (
    <PageShell links={links}>
      <section className="card" style={{ background: 'var(--color-primary)', color: 'white', padding: 24, marginBottom: 20 }}>
        <h1 style={{ margin: 0 }}>Welcome back, {user?.name}</h1>
        <p style={{ color: 'var(--color-accent)', margin: '6px 0 18px' }}>{user?.clubName}</p>
        <Link className="btn" style={{ background: 'var(--color-accent)', color: 'var(--color-primary-dark)' }} to="/organiser/venues">Book a Venue</Link>
      </section>

      <section className="grid stats-grid" style={{ marginBottom: 24 }}>
        {[
          ['Total Requests', stats.total],
          ['Approved', stats.approved],
          ['Pending', stats.pending]
        ].map(([label, value]) => (
          <div className="card" key={label} style={{ padding: 18 }}>
            <strong style={{ color: 'var(--color-primary)', fontSize: '2rem' }}>{value}</strong>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>{label}</p>
          </div>
        ))}
      </section>

      <h2 className="section-title">My Booking Requests</h2>
      <div className="grid">
        {bookings.map((booking) => (
          <EventCard
            key={booking.RequestID}
            event={booking}
            actions={
              <>
                {booking.Status === 'Pending' && <Link className="btn btn-outline" to={`/organiser/book?venueId=${booking.VenueID}`}>Edit</Link>}
                {booking.Status !== 'Cancelled' && <button className="btn btn-danger" type="button" onClick={() => cancel(booking)}>Cancel</button>}
                {booking.Status === 'Approved' && booking.EventID && <button className="btn btn-outline" type="button" onClick={() => cancelEvent(booking)}>Cancel Event</button>}
              </>
            }
          />
        ))}
      </div>
    </PageShell>
  );
};

export default OrganiserDashboard;
