const router = require('express').Router();
const ctrl = require('../controllers/notification.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, ctrl.getNotifications);
router.post('/:id/read', verifyToken, ctrl.markRead);
router.post('/read-all', verifyToken, ctrl.markAllRead);

module.exports = router;
