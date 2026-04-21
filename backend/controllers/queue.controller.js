const pool = require('../db/pool');
const audit = require('../utils/auditLog');

const joinQueue = async (req, res, next) => {
  try {
    const { venueId, requestedDate, startTime, endTime } = req.body;
    if (!venueId || !requestedDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Venue, date, start time, and end time are required.' });
    }

    const [activeConflicts] = await pool.query(
      `SELECT RequestID FROM BookingRequests
       WHERE VenueID = ? AND RequestedDate = ? AND Status IN ('Pending','Approved')
       AND (? < EndTime) AND (StartTime < ?)`,
      [venueId, requestedDate, startTime, endTime]
    );
    const queueStatus = activeConflicts.length === 0 ? 'active' : 'queued';

    const [positions] = await pool.query(
      `SELECT COALESCE(MAX(QueuePosition), 0) + 1 AS NextPosition
       FROM Queue
       WHERE VenueID = ? AND RequestedDate = ? AND StartTime = ? AND EndTime = ?
       AND ConfirmationStatus IN ('Pending','Confirmed')`,
      [venueId, requestedDate, startTime, endTime]
    );
    const position = positions[0].NextPosition;

    const [result] = await pool.query(
      `INSERT INTO Queue
       (VenueID, RequestedDate, StartTime, EndTime, OrganizerID, QueuePosition, QueueStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [venueId, requestedDate, startTime, endTime, req.user.userId, position, queueStatus]
    );

    await audit.log(req.user.userId, req.user.role, 'QueueJoined', 'Queue', result.insertId, { position });
    res.status(201).json({ success: true, message: 'Joined queue.', data: { queueId: result.insertId, position, queueStatus } });
  } catch (err) {
    next(err);
  }
};

const getMyQueue = async (req, res, next) => {
  try {
    const [items] = await pool.query(`
      SELECT q.*, v.Name AS VenueName
      FROM Queue q
      JOIN Venues v ON q.VenueID = v.VenueID
      WHERE q.OrganizerID = ?
      ORDER BY q.RequestedDate DESC, q.StartTime
    `, [req.user.userId]);
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

const confirmQueue = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [items] = await pool.query(
      `SELECT * FROM Queue
       WHERE QueueID = ? AND OrganizerID = ? AND ConfirmationStatus = 'Pending'`,
      [id, req.user.userId]
    );
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Queue offer not found.' });
    }

    await pool.query(
      `UPDATE Queue
       SET ConfirmationStatus='Confirmed', ConfirmationDeadline=DATE_ADD(NOW(), INTERVAL 24 HOUR)
       WHERE QueueID=?`,
      [id]
    );
    await audit.log(req.user.userId, req.user.role, 'QueueConfirmed', 'Queue', id);
    res.json({ success: true, message: 'Queue offer confirmed. Submit a booking request for approval.' });
  } catch (err) {
    next(err);
  }
};

const withdrawQueue = async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE Queue SET ConfirmationStatus='Withdrawn'
       WHERE QueueID = ? AND OrganizerID = ?`,
      [req.params.id, req.user.userId]
    );
    await audit.log(req.user.userId, req.user.role, 'QueueWithdrawn', 'Queue', req.params.id);
    res.json({ success: true, message: 'Queue entry withdrawn.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { joinQueue, getMyQueue, confirmQueue, withdrawQueue };
