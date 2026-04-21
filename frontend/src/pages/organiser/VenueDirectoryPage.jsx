import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import VenueCard from '../../components/booking/VenueCard';
import PageShell from '../PageShell';

const links = [
  { to: '/organiser', icon: 'M', label: 'My Bookings' },
  { to: '/organiser/venues', icon: 'V', label: 'Book a Venue' },
  { to: '/calendar', icon: 'C', label: 'Calendar' }
];

const VenueDirectoryPage = () => {
  const [venues, setVenues] = useState([]);
  const [type, setType] = useState('');

  useEffect(() => {
    api.get(type ? '/venues/search' : '/venues', { params: type ? { type } : {} })
      .then((res) => setVenues(res.data.data))
      .catch(() => setVenues([]));
  }, [type]);

  return (
    <PageShell links={links}>
      <h1 className="section-title">Venue Directory</h1>
      <div className="card" style={{ padding: 16, marginBottom: 18 }}>
        <div className="field">
          <label>Filter by type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All venues</option>
            <option>Auditorium</option>
            <option>Seminar Hall</option>
            <option>Lab</option>
            <option>Open Ground</option>
            <option>Classroom</option>
          </select>
        </div>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {venues.map((venue) => <VenueCard key={venue.VenueID} venue={venue} />)}
      </div>
    </PageShell>
  );
};

export default VenueDirectoryPage;
