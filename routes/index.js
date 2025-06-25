const router = require('express').Router();
const adminMiddleware = require('../middlewares/admin.middleware');

router.use('/auth', require('./auth'));
router.use('/otp', require('./otp'));
router.use('/admin', adminMiddleware, require('./admin'));
router.use('/user', require('./user'));

module.exports = router;
