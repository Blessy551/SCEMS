const pool = require('../db/pool');

const isValidUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
};

const getPublicEvents = async (req, res, next) => {
  try {
    const [events] = await pool.query(
      `SELECT
         e.EventID AS id,
         e.EventName AS title,
         COALESCE(NULLIF(e.Instructions, ''), NULLIF(b.ResourcesRequired, ''), e.EventType, '') AS description,
         e.EventDate AS date,
         e.StartTime AS time,
         v.Name AS venue,
         COALESCE(NULLIF(e.Category, ''), e.EventType, 'General') AS category,
         e.RegistrationLink AS registration_link,
         e.Instructions AS instructions,
         e.PosterUrl AS poster_url,
         e.RegistrationDeadline AS registration_deadline
       FROM Events e
       JOIN BookingRequests b ON b.RequestID = e.RequestID
       JOIN Venues v ON v.VenueID = e.VenueID
       WHERE b.Status = 'Approved' AND e.IsPublished = TRUE
       ORDER BY e.EventDate ASC, e.StartTime ASC`
    );

    return res.json({ success: true, data: events });
  } catch (err) {
    return next(err);
  }
};

const publishEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      registration_link,
      instructions,
      poster_url,
      category,
      registration_deadline
    } = req.body;

    if (!registration_link || !instructions || !category || !registration_deadline) {
      return res.status(400).json({
        success: false,
        message: 'registration_link, instructions, category, and registration_deadline are required.'
      });
    }

    if (!isValidUrl(registration_link)) {
      return res.status(400).json({ success: false, message: 'registration_link must be a valid URL.' });
    }

    if (poster_url && !isValidUrl(poster_url)) {
      return res.status(400).json({ success: false, message: 'poster_url must be a valid URL when provided.' });
    }

    const deadline = new Date(registration_deadline);
    if (Number.isNaN(deadline.getTime())) {
      return res.status(400).json({ success: false, message: 'registration_deadline must be a valid datetime.' });
    }
    if (deadline < new Date()) {
      return res.status(400).json({ success: false, message: 'registration_deadline must be in the future.' });
    }

    const [rows] = await pool.query(
      `SELECT e.EventID, e.OrganizerID, b.Status AS BookingStatus
       FROM Events e
       JOIN BookingRequests b ON b.RequestID = e.RequestID
       WHERE e.EventID = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const event = rows[0];
    if (event.BookingStatus !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Only approved events can be published.' });
    }

    if (req.user.role === 'Organiser' && event.OrganizerID !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'You can publish only your own approved events.' });
    }

    await pool.query(
      `UPDATE Events
       SET RegistrationLink = ?,
           Instructions = ?,
           PosterUrl = ?,
           Category = ?,
           RegistrationDeadline = ?,
           IsPublished = TRUE
       WHERE EventID = ?`,
      [registration_link, instructions, poster_url || null, category, registration_deadline, id]
    );

    return res.json({ success: true, message: 'Event published successfully.' });
  } catch (err) {
    return next(err);
  }
};

const cancelEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const [rows] = await pool.query(
      `SELECT EventID, RequestID, OrganizerID, EventName, Status
       FROM Events WHERE EventID = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    const event = rows[0];
    const isHOD = req.user.role === 'HOD';

    if (req.user.role === 'Organiser' && event.OrganizerID !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'You can cancel only your own events.' });
    }

    await pool.query('UPDATE Events SET Status = ? WHERE EventID = ?', ['Cancelled', id]);
    await pool.query(
      `UPDATE BookingRequests SET Status='Cancelled', CancellationReason=?
       WHERE RequestID = ?`,
      [reason || null, event.RequestID]
    );

    if (isHOD) {
      await pool.query(
        'INSERT INTO Notifications (RecipientUserID, Message, Type) VALUES (?, ?, ?)',
        [event.OrganizerID, `Your event "${event.EventName}" was cancelled by your HOD.`, 'cancelled']
      );
    }

    return res.json({ success: true, message: 'Event cancelled successfully.' });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getPublicEvents,
  publishEvent,
  cancelEvent
};
