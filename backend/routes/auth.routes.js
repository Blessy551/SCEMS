const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth');

router.post('/login', ctrl.login);
router.post('/register', ctrl.registerHod);
router.post('/register/hod', ctrl.registerHod);
router.post('/register/organiser', ctrl.registerOrganiser);
router.get('/me', verifyToken, ctrl.getMe);

module.exports = router;
