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

const createNotification = async (req, res, next) => {
  try {
    const { recipientUserId, message, type } = req.body;
    if (!recipientUserId || !message) {
      return res.status(400).json({ success: false, message: 'recipientUserId and message are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO Notifications (RecipientUserID, Message, Type) VALUES (?, ?, ?)',
      [recipientUserId, message, type || 'manual']
    );
    res.status(201).json({ success: true, data: { notifId: result.insertId } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, markRead, markAllRead, createNotification };
