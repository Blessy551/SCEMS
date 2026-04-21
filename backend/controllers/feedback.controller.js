const pool = require('../db/pool');

const submitFeedback = async (req, res, next) => {
  try {
    const { eventId, venueRating, resourceRating, hodResponsivenessRating, comments } = req.body;
    const organizerId = req.user.userId;

    const [events] = await pool.query(
      'SELECT * FROM Events WHERE EventID = ? AND OrganizerID = ? AND Status = ?',
      [eventId, organizerId, 'Completed']
    );
    if (events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Feedback can only be submitted for completed events.'
      });
    }

    await pool.query(
      `INSERT INTO Feedback
       (EventID, OrganizerID, VenueRating, ResourceRating, HODResponsivenessRating, Comments)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [eventId, organizerId, venueRating, resourceRating, hodResponsivenessRating, comments || null]
    );

    res.status(201).json({ success: true, message: 'Feedback submitted. Thank you!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Feedback already submitted for this event.' });
    }
    next(err);
  }
};

const getFeedback = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, e.EventName, v.Name AS VenueName, u.Name AS OrganizerName, u.ClubName
      FROM Feedback f
      JOIN Events e ON f.EventID = e.EventID
      JOIN Venues v ON e.VenueID = v.VenueID
      JOIN Users u ON f.OrganizerID = u.UserID
      ORDER BY f.SubmittedAt DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitFeedback, getFeedback };
