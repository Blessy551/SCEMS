import React, { useEffect, useState } from "react";
import api from '../../api/axiosInstance';
import AvailabilityBanner from './AvailabilityBanner';

const BookingForm = ({ initialVenueId = '' }) => {
  const [form, setForm] = useState({
    venueId: initialVenueId,
    eventName: '',
    eventType: '',
    expectedAudience: '',
    resourcesRequired: '',
    requestedDate: '',
    startTime: '',
    endTime: ''
  });
  const [availability, setAvailability] = useState(null);
  const [message, setMessage] = useState('');
  const [venueName, setVenueName] = useState('Loading...');

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  useEffect(() => {
    if (form.venueId) {
      api.get(`/venues/${form.venueId}`)
        .then((res) => setVenueName(res.data.data.Name))
        .catch(() => setVenueName('Unknown Venue'));
    } else {
      setVenueName('No venue selected');
    }
  }, [form.venueId]);

  const check = async () => {
    const res = await api.get('/venues/availability', {
      params: {
        venueId: form.venueId,
        date: form.requestedDate,
        startTime: form.startTime,
        endTime: form.endTime
      }
    });
    setAvailability(res.data.data);
  };

  const submit = async (event) => {
    event.preventDefault();
    setMessage('');
    try {
      await api.post('/bookings', form);
      setMessage('Booking request submitted.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to submit booking.');
    }
  };

  return (
    <form className="grid" onSubmit={submit}>
      <div className="field">
        <label>Selected Venue</label>
        <div style={{ padding: '10px 12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 6, fontWeight: 600, color: 'var(--color-primary)' }}>
          {venueName}
        </div>
      </div>
      <div className="field">
        <label>Event name</label>
        <input value={form.eventName} onChange={(e) => update('eventName', e.target.value)} required />
      </div>
      <div className="field">
        <label>Event type</label>
        <input value={form.eventType} onChange={(e) => update('eventType', e.target.value)} />
      </div>
      <div className="field">
        <label>Expected audience</label>
        <input type="number" value={form.expectedAudience} onChange={(e) => update('expectedAudience', e.target.value)} />
      </div>
      <div className="field">
        <label>Resources required</label>
        <textarea value={form.resourcesRequired} onChange={(e) => update('resourcesRequired', e.target.value)} />
      </div>
      <div className="field">
        <label>Date</label>
        <input type="date" value={form.requestedDate} onChange={(e) => update('requestedDate', e.target.value)} required />
      </div>
      <div className="field">
        <label>Start time</label>
        <input type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} required />
      </div>
      <div className="field">
        <label>End time</label>
        <input type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} required />
      </div>
      <AvailabilityBanner result={availability} />
      {message && <div className="card" style={{ padding: 14 }}>{message}</div>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-outline" type="button" onClick={check}>Check Availability</button>
        <button className="btn btn-primary" type="submit">Submit Booking</button>
      </div>
    </form>
  );
};

export default BookingForm;
