import StatusBadge from './StatusBadge';
import './EventCard.css';

const EventCard = ({ event, actions }) => (
  <article className="event-card">
    <div className="event-card-head">
      <h3>{event.EventName || event.eventName}</h3>
      <StatusBadge status={event.Status || 'Pending'} />
    </div>
    <p className="event-meta">
      {event.VenueName || event.venueName || 'Venue'} | {event.RequestedDate || event.EventDate} | {event.StartTime} - {event.EndTime}
    </p>
    <p className="event-club">{event.ClubName || event.club || event.OrganizerName || 'Organising club'}</p>
    {actions && <div className="event-actions">{actions}</div>}
  </article>
);

export default EventCard;
