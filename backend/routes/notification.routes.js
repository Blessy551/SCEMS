const router = require('express').Router();
const ctrl = require('../controllers/notification.controller');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/', verifyToken, ctrl.getNotifications);
router.post('/', verifyToken, checkRole('HOD'), ctrl.createNotification);
router.post('/:id/read', verifyToken, ctrl.markRead);
router.post('/read-all', verifyToken, ctrl.markAllRead);

module.exports = router;
