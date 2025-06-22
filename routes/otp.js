const otpController = require('../controllers/otp.controller');

const router = require('express').Router();

router.post('/send-otp', otpController.sendOtp);
router.post('/resend-otp', (req, res) => {});
router.post('/verify-otp', (req, res) => {});

module.exports = router;
