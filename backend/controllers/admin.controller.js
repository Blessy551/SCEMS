const pool = require('../db/pool');

const getEscalations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const [escalations] = await pool.query(`
      SELECT br.*, u.Name AS OrganizerName, v.Name AS VenueName,
             TIMESTAMPDIFF(HOUR, br.SubmittedAt, NOW()) AS HoursPending
      FROM BookingRequests br
      JOIN Users u ON br.OrganizerID = u.UserID
      JOIN Venues v ON br.VenueID = v.VenueID
      JOIN Users current_hod ON current_hod.UserID = ?
      WHERE br.Status = 'Pending'
        AND TIMESTAMPDIFF(HOUR, br.SubmittedAt, NOW()) >= 48
        AND (v.HOD_UserID = current_hod.UserID OR (v.HOD_UserID IS NULL AND v.OwningDepartment = current_hod.Department))
      ORDER BY HoursPending DESC
    `, [userId, userId]);
    res.json({ success: true, data: escalations });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getEscalations
};
