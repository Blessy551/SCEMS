import { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import BookingForm from '../../components/booking/BookingForm';
import PageShell from '../PageShell';

const links = [
  { to: '/organiser', icon: '🏠', label: 'Dashboard' },
  { to: '/book/venues', icon: '📍', label: 'Book a Venue' },
  { to: '/calendar', icon: '📅', label: 'My Events' }
];

const BookingFormPage = () => {
  const [params] = useSearchParams();
  return (
    <PageShell links={links}>
      <h1 className="section-title">Booking Form</h1>
      <div className="card" style={{ padding: 20, maxWidth: 720 }}>
        <BookingForm initialVenueId={params.get('venueId') || ''} />
      </div>
    </PageShell>
  );
};

export default BookingFormPage;
