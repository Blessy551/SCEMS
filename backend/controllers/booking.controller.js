const pool = require('../db/pool');
const audit = require('../utils/auditLog');

const overlapSql = '(? < EndTime) AND (StartTime < ?)';

const notify = async (connection, userId, message, type) => {
  await connection.query(
    'INSERT INTO Notifications (RecipientUserID, Message, Type) VALUES (?, ?, ?)',
    [userId, message, type]
  );
};

const findVenueHod = async (connection, venueId) => {
  const [rows] = await connection.query('SELECT Name, HOD_UserID, OwningDepartment FROM Venues WHERE VenueID = ?', [venueId]);
  if (rows.length === 0) return { hodId: null, venueName: 'Unknown Venue' };
  
  const venue = rows[0];
  if (venue.HOD_UserID) return { hodId: venue.HOD_UserID, venueName: venue.Name };

  // Fallback: Find any HOD in the venue's department
  const [deptHods] = await connection.query(
    'SELECT UserID FROM Users WHERE Role="HOD" AND Department = ? LIMIT 1',
    [venue.OwningDepartment]
  );
  return { hodId: deptHods[0]?.UserID || null, venueName: venue.Name };
};

const createBooking = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    const organizerId = req.user.userId;
    const {
      venueId,
      eventName,
      eventType,
      expectedAudience,
      resourcesRequired,
      requestedDate,
      startTime,
      endTime
    } = req.body;

    if (!venueId || !eventName || !requestedDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Venue, event name, date, start time, and end time are required.' });
    }

    await connection.beginTransaction();

    const [conflicts] = await connection.query(
      `SELECT RequestID FROM BookingRequests
       WHERE VenueID = ? AND RequestedDate = ? AND Status IN ('Pending','Approved')
       AND ${overlapSql}
       FOR UPDATE`,
      [venueId, requestedDate, startTime, endTime]
    );

    const day = new Date(`${requestedDate}T00:00:00`).getDay();
    const [blocked] = await connection.query(
      `SELECT SlotID FROM BlockedSlots
       WHERE VenueID = ?
       AND (SpecificDate = ? OR (SpecificDate IS NULL AND DayOfWeek = ?))
       AND ${overlapSql}`,
      [venueId, requestedDate, day, startTime, endTime]
    );

    if (conflicts.length > 0 || blocked.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'Slot was just taken or blocked.',
        data: { canJoinQueue: true }
      });
    }

    const [result] = await connection.query(
      `INSERT INTO BookingRequests
       (OrganizerID, VenueID, EventName, EventType, ExpectedAudience, ResourcesRequired,
        RequestedDate, StartTime, EndTime)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [organizerId, venueId, eventName, eventType || null, expectedAudience || null, resourcesRequired || null, requestedDate, startTime, endTime]
    );

    const { hodId, venueName } = await findVenueHod(connection, venueId);
    if (hodId) {
      await notify(connection, hodId, `New booking request for "${venueName}" (${eventName}) is awaiting HOD approval.`, 'booking_submitted');
    }

    await connection.commit();
    await audit.log(req.user.userId, req.user.role, 'BookingSubmitted', 'BookingRequest', result.insertId, { venueId });

    res.status(201).json({ success: true, message: 'Booking request submitted.', data: { requestId: result.insertId } });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const [requests] = await pool.query(`
      SELECT br.*, e.EventID, e.Status AS EventStatus, v.Name AS VenueName, v.Type AS VenueType, u.ClubName
      FROM BookingRequests br
      LEFT JOIN Events e ON e.RequestID = br.RequestID
      JOIN Venues v ON br.VenueID = v.VenueID
      JOIN Users u ON br.OrganizerID = u.UserID
      WHERE br.OrganizerID = ?
      ORDER BY br.RequestedDate DESC, br.StartTime DESC
    `, [req.user.userId]);
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};

const getHodBookings = async (req, res, next) => {
  try {
    const [requests] = await pool.query(`
      SELECT br.*, u.Name AS OrganizerName, u.ClubName, v.Name AS VenueName, v.Type AS VenueType,
             TIMESTAMPDIFF(HOUR, NOW(), DATE_ADD(br.SubmittedAt, INTERVAL 48 HOUR)) AS HoursLeft
      FROM BookingRequests br
      JOIN Users u ON br.OrganizerID = u.UserID
      JOIN Venues v ON br.VenueID = v.VenueID
      JOIN Users hod ON hod.UserID = ?
      WHERE (v.HOD_UserID = hod.UserID OR (v.HOD_UserID IS NULL AND v.OwningDepartment = hod.Department))
        AND br.Status = 'Pending'
      ORDER BY br.SubmittedAt
    `, [req.user.userId, req.user.userId]);
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};

const getHodApprovedBookings = async (req, res, next) => {
  try {
    const [requests] = await pool.query(`
      SELECT br.*, e.EventID, e.Status AS EventStatus, u.Name AS OrganizerName,
             u.ClubName, v.Name AS VenueName, v.Type AS VenueType
      FROM BookingRequests br
      JOIN Events e ON e.RequestID = br.RequestID
      JOIN Users u ON br.OrganizerID = u.UserID
      JOIN Venues v ON br.VenueID = v.VenueID
      JOIN Users hod ON hod.UserID = ?
      WHERE (v.HOD_UserID = hod.UserID OR (v.HOD_UserID IS NULL AND v.OwningDepartment = hod.Department))
        AND br.Status = 'Approved'
      ORDER BY br.RequestedDate DESC
    `, [req.user.userId, req.user.userId]);
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};

const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      eventName,
      eventType,
      expectedAudience,
      resourcesRequired,
      requestedDate,
      startTime,
      endTime
    } = req.body;

    const [existing] = await pool.query(
      `SELECT * FROM BookingRequests
       WHERE RequestID = ? AND OrganizerID = ? AND Status = 'Pending'
       AND TIMESTAMPDIFF(HOUR, NOW(), CONCAT(RequestedDate, ' ', StartTime)) > 24`,
      [id, req.user.userId]
    );
    if (existing.length === 0) {
      return res.status(400).json({ success: false, message: 'Only pending bookings more than 24 hours away can be edited.' });
    }

    await pool.query(
      `UPDATE BookingRequests
       SET EventName=?, EventType=?, ExpectedAudience=?, ResourcesRequired=?,
           RequestedDate=?, StartTime=?, EndTime=?, LastEditedAt=NOW()
       WHERE RequestID=?`,
      [eventName, eventType, expectedAudience, resourcesRequired, requestedDate, startTime, endTime, id]
    );

    await audit.log(req.user.userId, req.user.role, 'BookingEdited', 'BookingRequest', id);
    res.json({ success: true, message: 'Booking updated.' });
  } catch (err) {
    next(err);
  }
};

const approveBooking = async (req, res, next) => {
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
    await notify(connection, request.OrganizerID, `Your booking "${request.EventName}" was approved.`, 'approved');

    await connection.commit();
    await audit.log(req.user.userId, req.user.role, 'BookingApproved', 'BookingRequest', id);
    res.json({ success: true, message: 'Booking approved. Event created.' });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

const rejectBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;
    const [requests] = await pool.query('SELECT OrganizerID, EventName FROM BookingRequests WHERE RequestID = ?', [id]);
    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    await pool.query('UPDATE BookingRequests SET Status=?, HOD_Remarks=? WHERE RequestID=?', ['Rejected', remarks || null, id]);
    await pool.query(
      'INSERT INTO Notifications (RecipientUserID, Message, Type) VALUES (?, ?, ?)',
      [requests[0].OrganizerID, `Your booking "${requests[0].EventName}" was rejected.`, 'rejected']
    );
    await audit.log(req.user.userId, req.user.role, 'BookingRejected', 'BookingRequest', id, { remarks });
    res.json({ success: true, message: 'Booking rejected.' });
  } catch (err) {
    next(err);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const [requests] = await pool.query('SELECT * FROM BookingRequests WHERE RequestID = ?', [id]);
    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const request = requests[0];
    const isOwner = request.OrganizerID === req.user.userId;
    if (req.user.role === 'Organiser' && !isOwner) {
      return res.status(403).json({ success: false, message: 'You can cancel only your own bookings.' });
    }

    const [lateRows] = await pool.query(
      `SELECT TIMESTAMPDIFF(HOUR, NOW(), CONCAT(RequestedDate, ' ', StartTime)) AS HoursUntil
       FROM BookingRequests WHERE RequestID = ?`,
      [id]
    );
    const isLate = Number(lateRows[0].HoursUntil) < 24;
    if (isLate && !reason) {
      return res.status(400).json({ success: false, message: 'Late cancellation requires a reason.' });
    }

    await pool.query(
      `UPDATE BookingRequests
       SET Status='Cancelled', CancellationReason=?, IsLateCancellation=?
       WHERE RequestID=?`,
      [reason || null, isLate, id]
    );
    await pool.query('UPDATE Events SET Status=? WHERE RequestID=?', ['Cancelled', id]);

    const [nextQueue] = await pool.query(
      `SELECT q.QueueID, q.OrganizerID, q.VenueID, q.RequestedDate, q.StartTime, q.EndTime, br.EventName
       FROM Queue q
       LEFT JOIN BookingRequests br
         ON br.OrganizerID = q.OrganizerID
         AND br.VenueID = q.VenueID
         AND br.RequestedDate = q.RequestedDate
         AND br.StartTime = q.StartTime
         AND br.EndTime = q.EndTime
       WHERE q.VenueID = ? AND q.RequestedDate = ? AND q.StartTime = ? AND q.EndTime = ?
         AND q.ConfirmationStatus IN ('Pending','Confirmed')
         AND q.QueueStatus = 'queued'
       ORDER BY q.QueuePosition ASC
       LIMIT 1`,
      [request.VenueID, request.RequestedDate, request.StartTime, request.EndTime]
    );

    if (nextQueue.length > 0) {
      const queued = nextQueue[0];
      await pool.query(
        `UPDATE Queue
         SET QueueStatus='active', ConfirmationStatus='Pending',
             ConfirmationDeadline=DATE_ADD(NOW(), INTERVAL 24 HOUR)
         WHERE QueueID=?`,
        [queued.QueueID]
      );

      await pool.query(
        'INSERT INTO Notifications (RecipientUserID, Message, Type) VALUES (?, ?, ?)',
        [queued.OrganizerID, `A slot has opened for "${queued.EventName || request.EventName}". Confirm within 24 hours.`, 'queue_promoted']
      );

      const { hodId, venueName } = await findVenueHod(pool, request.VenueID);
      if (hodId) {
        await pool.query(
          'INSERT INTO Notifications (RecipientUserID, Message, Type) VALUES (?, ?, ?)',
          [hodId, `Queue item #${queued.QueueID} for "${venueName}" moved to active after a cancellation.`, 'queue_activated']
        );
      }
    }

    await audit.log(req.user.userId, req.user.role, 'BookingCancelled', 'BookingRequest', id, { isLate, reason });
    res.json({ success: true, message: 'Booking cancelled.', data: { isLateCancellation: isLate } });
  } catch (err) {
    next(err);
  }
};

const rescheduleBooking = async (req, res, next) => {
  req.body.eventName = req.body.eventName || req.body.currentEventName;
  return updateBooking(req, res, next);
};

module.exports = {
  createBooking,
  getMyBookings,
  getHodBookings,
  getHodApprovedBookings,
  updateBooking,
  approveBooking,
  rejectBooking,
  cancelBooking,
  rescheduleBooking
};
