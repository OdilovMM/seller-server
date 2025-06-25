const router = require('express').Router();
const adminMiddleware = require('../middlewares/admin.middleware');

router.use('/auth', require('./auth'));
router.use('/otp', require('./otp'));
router.use('/admin', adminMiddleware, require('./admin'));
router.use('/user', require('./user'));
router.use('/stripe', require('./stripe'))

module.exports = router;
