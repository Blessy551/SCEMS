const router = require('express').Router();
const ctrl = require('../controllers/venue.controller');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/', verifyToken, ctrl.getVenues);
router.get('/search', verifyToken, ctrl.searchVenues);
router.get('/availability', verifyToken, ctrl.checkAvailability);
router.get('/blocked-slots', verifyToken, ctrl.getBlockedSlots);
router.post('/blocked-slots', verifyToken, checkRole('HOD'), ctrl.addBlockedSlot);
router.delete('/blocked-slots/:id', verifyToken, checkRole('HOD'), ctrl.deleteBlockedSlot);
router.get('/:id', verifyToken, ctrl.getVenueById);

module.exports = router;
