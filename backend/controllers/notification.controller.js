const pool = require('../db/pool');

const getNotifications = async (req, res, next) => {
  try {
    const [notifications] = await pool.query(
      `SELECT * FROM Notifications
       WHERE RecipientUserID = ?
       ORDER BY CreatedAt DESC
       LIMIT 50`,
      [req.user.userId]
    );
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE Notifications SET IsRead=TRUE WHERE NotifID = ? AND RecipientUserID = ?',
      [req.params.id, req.user.userId]
    );
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await pool.query('UPDATE Notifications SET IsRead=TRUE WHERE RecipientUserID = ?', [req.user.userId]);
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markRead, markAllRead };
