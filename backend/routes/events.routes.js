const router = require('express').Router();
const ctrl = require('../controllers/events.controller');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/public', ctrl.getPublicEvents);
router.put('/:id/publish', verifyToken, checkRole('Organiser'), ctrl.publishEvent);
router.post('/:id/cancel', verifyToken, checkRole('Organiser', 'HOD'), ctrl.cancelEvent);

module.exports = router;
