const pool = require('../db/pool');
const audit = require('../utils/auditLog');

const overlapSql = '(? < EndTime) AND (StartTime < ?)';

const getVenues = async (req, res, next) => {
  try {
    const [venues] = await pool.query(`
      SELECT v.*, u.Name AS HODName
      FROM Venues v
      LEFT JOIN Users u ON v.HOD_UserID = u.UserID
      ORDER BY v.Name
    `);
    res.json({ success: true, data: venues });
  } catch (err) {
    next(err);
  }
};

const searchVenues = async (req, res, next) => {
  try {
    const { type, capacity, department, q } = req.query;
    let sql = `
      SELECT v.*, u.Name AS HODName
      FROM Venues v
      LEFT JOIN Users u ON v.HOD_UserID = u.UserID
      WHERE 1=1`;
    const params = [];

    if (type) {
      sql += ' AND v.Type = ?';
      params.push(type);
    }
    if (capacity) {
      sql += ' AND v.Capacity >= ?';
      params.push(Number(capacity));
    }
    if (department) {
      sql += ' AND v.OwningDepartment = ?';
      params.push(department);
    }
    if (q) {
      sql += ' AND (v.Name LIKE ? OR v.Block LIKE ? OR v.AvailableResources LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    sql += ' ORDER BY v.Name';

    const [venues] = await pool.query(sql, params);
    res.json({ success: true, data: venues });
  } catch (err) {
    next(err);
  }
};

const getVenuesByRequirements = async (req, res, next) => {
  try {
    const { eventType, audience, resources } = req.query;
    let sql = `
      SELECT v.*, u.Name AS HODName
      FROM Venues v
      LEFT JOIN Users u ON v.HOD_UserID = u.UserID
      WHERE 1=1`;
    const params = [];

    if (audience) {
      sql += ' AND v.Capacity >= ?';
      params.push(Number(audience));
    }

    if (resources && resources.trim()) {
      const resourceList = resources.split(',').map((r) => r.trim()).filter(Boolean);
      if (resourceList.length > 0) {
        sql += ' AND (' + resourceList.map(() => 'v.AvailableResources LIKE ?').join(' OR ') + ')';
        resourceList.forEach((r) => params.push(`%${r}%`));
      }
    }

    sql += ' ORDER BY v.Name';

    const [venues] = await pool.query(sql, params);
    res.json({ success: true, data: venues });
  } catch (err) {
    next(err);
  }
};

const getVenueById = async (req, res, next) => {
  try {
    const [venues] = await pool.query(`
      SELECT v.*, u.Name AS HODName
      FROM Venues v
      LEFT JOIN Users u ON v.HOD_UserID = u.UserID
      WHERE v.VenueID = ?
    `, [req.params.id]);
    if (venues.length === 0) {
      return res.status(404).json({ success: false, message: 'Venue not found.' });
    }
    res.json({ success: true, data: venues[0] });
  } catch (err) {
    next(err);
  }
};

const checkAvailability = async (req, res, next) => {
  try {
    const { venueId, date, startTime, endTime } = req.query;
    if (!venueId || !date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'venueId, date, startTime, endTime are required.' });
    }

    const [bookings] = await pool.query(
      `SELECT RequestID, EventName, Status FROM BookingRequests
       WHERE VenueID = ? AND RequestedDate = ? AND Status IN ('Pending','Approved')
       AND ${overlapSql}`,
      [venueId, date, startTime, endTime]
    );

    const day = new Date(`${date}T00:00:00`).getDay();
    const [blocked] = await pool.query(
      `SELECT * FROM BlockedSlots
       WHERE VenueID = ?
       AND (SpecificDate = ? OR (SpecificDate IS NULL AND DayOfWeek = ?))
       AND ${overlapSql}`,
      [venueId, date, day, startTime, endTime]
    );

    res.json({
      success: true,
      data: {
        available: bookings.length === 0 && blocked.length === 0,
        conflicts: { bookings, blocked }
      }
    });
  } catch (err) {
    next(err);
  }
};

const getBlockedSlots = async (req, res, next) => {
  try {
    const [slots] = await pool.query(`
      SELECT bs.*, v.Name AS VenueName
      FROM BlockedSlots bs
      JOIN Venues v ON bs.VenueID = v.VenueID
      ORDER BY COALESCE(bs.SpecificDate, '9999-12-31'), bs.DayOfWeek, bs.StartTime
    `);
    res.json({ success: true, data: slots });
  } catch (err) {
    next(err);
  }
};

const addBlockedSlot = async (req, res, next) => {
  try {
    const { venueId, dayOfWeek, specificDate, startTime, endTime, reason } = req.body;
    if (!venueId || !startTime || !endTime || (!specificDate && dayOfWeek === undefined)) {
      return res.status(400).json({ success: false, message: 'Venue, date/day, start time, and end time are required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO BlockedSlots (VenueID, DayOfWeek, SpecificDate, StartTime, EndTime, Reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [venueId, dayOfWeek ?? null, specificDate || null, startTime, endTime, reason || null]
    );

    await audit.log(req.user.userId, req.user.role, 'BlockedSlotCreated', 'BlockedSlot', result.insertId, { venueId });
    res.status(201).json({ success: true, message: 'Blocked slot added.', data: { slotId: result.insertId } });
  } catch (err) {
    next(err);
  }
};

const deleteBlockedSlot = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM BlockedSlots WHERE SlotID = ?', [req.params.id]);
    await audit.log(req.user.userId, req.user.role, 'BlockedSlotDeleted', 'BlockedSlot', req.params.id);
    res.json({ success: true, message: 'Blocked slot removed.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVenues,
  searchVenues,
  getVenuesByRequirements,
  getVenueById,
  checkAvailability,
  getBlockedSlots,
  addBlockedSlot,
  deleteBlockedSlot
};
