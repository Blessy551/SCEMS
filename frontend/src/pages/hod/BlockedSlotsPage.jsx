import { useEffect, useState } from 'react';
import api from '../../api/axiosInstance';
import PageShell from '../PageShell';

const links = [
  { to: '/hod', icon: 'P', label: 'Pending Approvals' },
  { to: '/hod/blocked-slots', icon: 'B', label: 'Blocked Slots' },
  { to: '/calendar', icon: 'C', label: 'Calendar' }
];

const BlockedSlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ venueId: '', dayOfWeek: '', specificDate: '', startTime: '', endTime: '', reason: '' });

  const load = () => api.get('/venues/blocked-slots').then((res) => setSlots(res.data.data));

  useEffect(() => {
    load().catch(() => setSlots([]));
  }, []);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    await api.post('/venues/blocked-slots', form);
    setForm({ venueId: '', dayOfWeek: '', specificDate: '', startTime: '', endTime: '', reason: '' });
    load();
  };

  return (
    <PageShell links={links}>
      <h1 className="section-title">Blocked Slots</h1>
      <form className="card grid" style={{ padding: 16, marginBottom: 20 }} onSubmit={submit}>
        <div className="field"><label>Venue ID</label><input value={form.venueId} onChange={(e) => update('venueId', e.target.value)} required /></div>
        <div className="field"><label>Day of week</label><input type="number" min="0" max="6" value={form.dayOfWeek} onChange={(e) => update('dayOfWeek', e.target.value)} /></div>
        <div className="field"><label>Specific date</label><input type="date" value={form.specificDate} onChange={(e) => update('specificDate', e.target.value)} /></div>
        <div className="field"><label>Start time</label><input type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} required /></div>
        <div className="field"><label>End time</label><input type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} required /></div>
        <div className="field"><label>Reason</label><input value={form.reason} onChange={(e) => update('reason', e.target.value)} /></div>
        <button className="btn btn-primary" type="submit">Add Blocked Slot</button>
      </form>
      <div className="grid">
        {slots.map((slot) => (
          <div className="card" key={slot.SlotID} style={{ padding: 14 }}>
            <strong>{slot.VenueName}</strong>
            <p style={{ margin: '6px 0', color: 'var(--color-text-muted)' }}>{slot.SpecificDate || `Day ${slot.DayOfWeek}`} | {slot.StartTime} - {slot.EndTime}</p>
            <span>{slot.Reason}</span>
          </div>
        ))}
      </div>
    </PageShell>
  );
};

export default BlockedSlotsPage;
