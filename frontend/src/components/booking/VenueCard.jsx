import { Link } from 'react-router-dom';

const VenueCard = ({ venue, matchScore }) => {
  const getBadgeColor = (score) => {
    if (score >= 80) return 'var(--color-approved-bg)';
    if (score >= 50) return 'var(--color-awaiting-bg)';
    return 'var(--color-cancelled-bg)';
  };
  const getTextColor = (score) => {
    if (score >= 80) return 'var(--color-approved-text)';
    if (score >= 50) return 'var(--color-awaiting-text)';
    return 'var(--color-cancelled-text)';
  };

  return (
    <article className="event-card">
      <div className="event-card-head">
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0 }}>{venue.Name}</h3>
          <small style={{ color: 'var(--color-text-muted)' }}>Block {venue.Block} | Floor {venue.Floor}</small>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          {matchScore !== undefined && (
            <span className="status" style={{ background: getBadgeColor(matchScore), color: getTextColor(matchScore), fontWeight: 700 }}>
              {matchScore}% Match
            </span>
          )}
          <span className="status status-awaiting" style={{ fontSize: '0.7rem' }}>{venue.Type}</span>
        </div>
      </div>
      <p className="event-meta">Capacity: <strong>{venue.Capacity}</strong></p>
      <div style={{ margin: '8px 0' }}>
        <small style={{ display: 'block', color: 'var(--color-text-muted)', marginBottom: 4 }}>Available Resources:</small>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {venue.AvailableResources?.split(',').map(r => (
            <span key={r} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 4 }}>
              {r.trim()}
            </span>
          ))}
        </div>
      </div>
      <div className="event-actions">
        <Link className="btn btn-primary" to={`/book?venueId=${venue.VenueID}`}>Book This Venue</Link>
      </div>
    </article>
  );
};

export default VenueCard;
