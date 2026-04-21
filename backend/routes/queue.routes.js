const router = require('express').Router();
const ctrl = require('../controllers/queue.controller');
const { verifyToken, checkRole } = require('../middleware/auth');

router.post('/', verifyToken, checkRole('Organiser'), ctrl.joinQueue);
router.get('/my', verifyToken, checkRole('Organiser'), ctrl.getMyQueue);
router.post('/:id/confirm', verifyToken, checkRole('Organiser'), ctrl.confirmQueue);
router.delete('/:id', verifyToken, checkRole('Organiser'), ctrl.withdrawQueue);

module.exports = router;
