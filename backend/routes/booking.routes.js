const router = require('express').Router();
const ctrl = require('../controllers/booking.controller');
const { verifyToken, checkRole } = require('../middleware/auth');

router.post('/', verifyToken, checkRole('Organiser'), ctrl.createBooking);
router.get('/my', verifyToken, checkRole('Organiser'), ctrl.getMyBookings);
router.get('/hod', verifyToken, checkRole('HOD'), ctrl.getHodBookings);
router.put('/:id', verifyToken, checkRole('Organiser'), ctrl.updateBooking);
router.post('/:id/approve', verifyToken, checkRole('HOD', 'Principal'), ctrl.approveBooking);
router.post('/:id/reject', verifyToken, checkRole('HOD', 'Principal'), ctrl.rejectBooking);
router.post('/:id/cancel', verifyToken, checkRole('Organiser', 'HOD', 'Principal'), ctrl.cancelBooking);
router.post('/:id/reschedule', verifyToken, checkRole('Organiser'), ctrl.rescheduleBooking);

module.exports = router;
