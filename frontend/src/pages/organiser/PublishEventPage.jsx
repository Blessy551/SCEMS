import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosInstance';
import PageShell from '../PageShell';

const links = [
  { to: '/organiser', icon: '🏠', label: 'Dashboard' },
  { to: '/book/venues', icon: '📍', label: 'Book a Venue' },
  { to: '/calendar', icon: '📅', label: 'My Events' },
  { to: '/notifications', icon: '🔔', label: 'Notifications' }
];

const PublishEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    registration_link: '',
    instructions: '',
    category: '',
    poster_url: '',
    registration_deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.put(`/events/${id}/publish`, form);
      alert('Event published successfully!');
      navigate('/organiser');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell links={links}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <h1 className="section-title">Add Event Details</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
          Your booking is approved. Now, add public details to display this event on the public portal.
        </p>

        <form className="card" style={{ padding: 24 }} onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{error}</div>}
          
          <div className="grid" style={{ gap: 20 }}>
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={(e) => update('category', e.target.value)} required>
                <option value="">Select category...</option>
                <option>Technical</option>
                <option>Cultural</option>
                <option>Workshop</option>
                <option>Hackathon</option>
                <option>Seminar</option>
                <option>Other</option>
              </select>
            </div>

            <div className="field">
              <label>Registration Link (URL)</label>
              <input type="url" value={form.registration_link} onChange={(e) => update('registration_link', e.target.value)} placeholder="https://example.com/register" required />
            </div>

            <div className="field">
              <label>Registration Deadline</label>
              <input type="datetime-local" value={form.registration_deadline} onChange={(e) => update('registration_deadline', e.target.value)} required />
            </div>

            <div className="field">
              <label>Poster URL (Optional)</label>
              <input type="url" value={form.poster_url} onChange={(e) => update('poster_url', e.target.value)} placeholder="https://example.com/poster.jpg" />
            </div>

            <div className="field">
              <label>Instructions / Description</label>
              <textarea value={form.instructions} onChange={(e) => update('instructions', e.target.value)} placeholder="What should attendees know?" style={{ minHeight: 120 }} required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Event'}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/organiser')}>Cancel</button>
          </div>
        </form>
      </div>
    </PageShell>
  );
};

export default PublishEventPage;
