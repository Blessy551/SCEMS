const router = require('express').Router();
const ctrl = require('../controllers/feedback.controller');
const { verifyToken, checkRole } = require('../middleware/auth');

router.post('/', verifyToken, checkRole('Organiser'), ctrl.submitFeedback);
router.get('/', verifyToken, checkRole('HOD', 'Principal'), ctrl.getFeedback);

module.exports = router;
