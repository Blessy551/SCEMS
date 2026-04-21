const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/requests', verifyToken, checkRole('Principal'), ctrl.getAllRequests);
router.get('/events', verifyToken, checkRole('Principal'), ctrl.getAllEvents);
router.get('/escalations', verifyToken, checkRole('HOD'), ctrl.getEscalations);
router.post('/requests/:id/force-cancel', verifyToken, checkRole('Principal'), ctrl.forceCancel);
router.get('/audit-log', verifyToken, checkRole('Admin'), ctrl.getAuditLog);

module.exports = router;
