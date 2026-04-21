const pool = require('../db/pool');
const audit = require('../utils/auditLog');

const getAllRequests = async (req, res, next) => {
  try {
    const [requests] = await pool.query(`
      SELECT br.*, u.Name AS OrganizerName, u.Department, u.ClubName,
             v.Name AS VenueName, v.Type AS VenueType
      FROM BookingRequests br
      JOIN Users u ON br.OrganizerID = u.UserID
      JOIN Venues v ON br.VenueID = v.VenueID
      ORDER BY br.SubmittedAt DESC
    `);
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};

const getAllEvents = async (req, res, next) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, v.Name AS VenueName, v.Type AS VenueType, u.Name AS OrganizerName, u.ClubName
      FROM Events e
      JOIN Venues v ON e.VenueID = v.VenueID
      JOIN Users u ON e.OrganizerID = u.UserID
      ORDER BY e.EventDate, e.StartTime
    `);
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

const getAuditLog = async (req, res, next) => {
  try {
    const { from, to, action } = req.query;
    let sql = `SELECT al.*, u.Name AS ActorName
               FROM AuditLog al
               LEFT JOIN Users u ON al.ActorUserID = u.UserID
               WHERE 1=1`;
    const params = [];

    if (from) {
      sql += ' AND al.Timestamp >= ?';
      params.push(from);
    }
    if (to) {
      sql += ' AND al.Timestamp <= ?';
      params.push(to);
    }
    if (action) {
      sql += ' AND al.ActionType = ?';
      params.push(action);
    }

    sql += ' ORDER BY al.Timestamp DESC LIMIT 200';
    const [logs] = await pool.query(sql, params);
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};

const overrideApprove = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    await connection.beginTransaction();

    const [requests] = await connection.query('SELECT * FROM BookingRequests WHERE RequestID = ? FOR UPDATE', [id]);
    if (requests.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const request = requests[0];
    await connection.query('UPDATE BookingRequests SET Status=? WHERE RequestID=?', ['Approved', id]);
    await connection.query(
      `INSERT INTO Events (RequestID, VenueID, OrganizerID, EventName, EventType, EventDate, StartTime, EndTime)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE Status='Upcoming'`,
      [id, request.VenueID, request.OrganizerID, request.EventName, request.EventType, request.RequestedDate, request.StartTime, request.EndTime]
    );
    await connection.query(
      'INSERT INTO Notifications (RecipientUserID, Message, Type) VALUES (?, ?, ?)',
      [request.OrganizerID, `Your booking "${request.EventName}" was approved by the Principal override.`, 'override_approved']
    );

    await connection.commit();
    await audit.log(req.user.userId, 'Principal', 'PrincipalOverride', 'BookingRequest', id, { previousStatus: request.Status });
    res.json({ success: true, message: 'Override approved. Event created.' });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

const forceCancel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    await pool.query(
      `UPDATE BookingRequests
       SET Status='Cancelled', CancellationReason=?, IsLateCancellation=FALSE
       WHERE RequestID=?`,
      [`[Force Cancel by Principal] ${reason || 'No reason provided'}`, id]
    );
    await pool.query('UPDATE Events SET Status=? WHERE RequestID=?', ['Cancelled', id]);

    await audit.log(req.user.userId, 'Principal', 'ForceCancelled', 'BookingRequest', id, { reason });
    res.json({ success: true, message: 'Event force-cancelled.' });
  } catch (err) {
    next(err);
  }
};

const getEscalations = async (req, res, next) => {
  try {
    const [escalations] = await pool.query(`
      SELECT br.*, u.Name AS OrganizerName, v.Name AS VenueName,
             TIMESTAMPDIFF(HOUR, br.SubmittedAt, NOW()) AS HoursPending
      FROM BookingRequests br
      JOIN Users u ON br.OrganizerID = u.UserID
      JOIN Venues v ON br.VenueID = v.VenueID
      WHERE br.Status = 'Pending'
        AND TIMESTAMPDIFF(HOUR, br.SubmittedAt, NOW()) >= 48
      ORDER BY HoursPending DESC
    `);
    res.json({ success: true, data: escalations });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllRequests,
  getAllEvents,
  getAuditLog,
  overrideApprove,
  forceCancel,
  getEscalations
};
