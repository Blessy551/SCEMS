import { Link } from 'react-router-dom';

const VenueCard = ({ venue }) => (
  <article className="event-card">
    <div className="event-card-head">
      <h3>{venue.Name}</h3>
      <span className="status status-awaiting">{venue.Type}</span>
    </div>
    <p className="event-meta">Block {venue.Block} | {venue.Floor} | Capacity {venue.Capacity}</p>
    <p className="event-club">{venue.AvailableResources}</p>
    <div className="event-actions">
      <Link className="btn btn-primary" to={`/organiser/book?venueId=${venue.VenueID}`}>Book Venue</Link>
    </div>
  </article>
);

export default VenueCard;
