const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/escalations', verifyToken, checkRole('HOD'), ctrl.getEscalations);

module.exports = router;
