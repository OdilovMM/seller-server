const router = require('express').Router();
const adminAuthMiddleware = require('../middlewares/admin.middleware');

router.use('/auth', require('./auth'));
router.use('/otp', require('./otp'));
router.use('/admin', adminAuthMiddleware, require('./admin'));
router.use('/user', require('./user'));
router.use('/stripe', require('./stripe'));

module.exports = router;
