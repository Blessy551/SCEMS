import { useState } from 'react';
import api from '../../api/axiosInstance';
import VenueCard from '../../components/booking/VenueCard';
import PageShell from '../PageShell';

const organiserLinks = [
  { to: '/organiser', icon: '🏠', label: 'Dashboard' },
  { to: '/book/venues', icon: '📍', label: 'Book a Venue' },
  { to: '/calendar', icon: '📅', label: 'My Events' },
  { to: '/notifications', icon: '🔔', label: 'Notifications' }
];

const RESOURCE_OPTIONS = ['Projector', 'Mic', 'PA System', 'Stage Lighting', 'Whiteboard', 'Generator', 'Display'];
const TYPE_OPTIONS = ['Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Other'];

const VenueDirectoryPage = () => {
  const [step, setStep] = useState(1);
  const [reqs, setReqs] = useState({
    eventType: '',
    audience: '',
    resources: [],
    preferredDate: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setReqs(prev => ({ ...prev, [field]: value }));

  const toggleResource = (res) => {
    setReqs(prev => ({
      ...prev,
      resources: prev.resources.includes(res)
        ? prev.resources.filter(item => item !== res)
        : [...prev.resources, res]
    }));
  };

  const findVenues = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get('/venues/by-requirements', {
        params: {
          audience: reqs.audience,
          eventType: reqs.eventType,
          resources: reqs.resources.join(',')
        }
      });

      const scored = res.data.data.map(venue => {
        let score = 0;
        const venueResources = venue.AvailableResources?.split(',').map(s => s.trim().toLowerCase()) || [];
        const requestedResources = reqs.resources.map(r => r.toLowerCase());

        // Score: +40 if venue.Capacity >= expectedAudience
        if (venue.Capacity >= Number(reqs.audience)) score += 40;

        // Score: +5 for each required resource found in venue.AvailableResources
        requestedResources.forEach(r => {
          if (venueResources.includes(r)) score += 5;
        });

        // Score: -10 if capacity is more than 3x the expected audience (over-provisioned)
        if (venue.Capacity > 3 * Number(reqs.audience)) score -= 10;

        // Normalization
        const maxScore = 40 + (reqs.resources.length * 5);
        const percentage = Math.max(0, Math.round((score / maxScore) * 100));

        return { ...venue, matchScore: percentage };
      });

      scored.sort((a, b) => b.matchScore - a.matchScore);
      setResults(scored);
      setStep(2);
    } catch (err) {
      console.error('Failed to find venues', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell links={organiserLinks}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 className="section-title">{step === 1 ? 'Find the Perfect Venue' : 'Recommended Venues'}</h1>

        {step === 1 ? (
          <form className="card" style={{ padding: 24 }} onSubmit={findVenues}>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              <div className="field">
                <label>Event Type</label>
                <select value={reqs.eventType} onChange={(e) => update('eventType', e.target.value)} required>
                  <option value="">Select type...</option>
                  {TYPE_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Expected Audience</label>
                <input type="number" value={reqs.audience} onChange={(e) => update('audience', e.target.value)} placeholder="e.g. 50" required />
              </div>
              <div className="field">
                <label>Preferred Date (Optional)</label>
                <input type="date" value={reqs.preferredDate} onChange={(e) => update('preferredDate', e.target.value)} />
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: 12 }}>
                Resources Needed
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {RESOURCE_OPTIONS.map(res => (
                  <label key={res} className="card" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', background: reqs.resources.includes(res) ? 'var(--color-primary-light)' : 'white', color: reqs.resources.includes(res) ? 'white' : 'inherit' }}>
                    <input type="checkbox" checked={reqs.resources.includes(res)} onChange={() => toggleResource(res)} style={{ display: 'none' }} />
                    <span style={{ fontSize: '0.9rem' }}>{res}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" type="submit" style={{ marginTop: 32, width: '100%', padding: 16, fontSize: '1.1rem' }} disabled={loading}>
              {loading ? 'Finding Best Matches...' : 'Find Venues'}
            </button>
          </form>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Found {results.length} matching venues</p>
              <button className="btn btn-outline" onClick={() => setStep(1)}>&larr; Change Requirements</button>
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              {results.map(venue => (
                <VenueCard key={venue.VenueID} venue={venue} matchScore={venue.matchScore} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default VenueDirectoryPage;
