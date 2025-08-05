const logger = require('../logger');
const mailService = require('../service/mail.service');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

class OtpController {
	sendOtp = asyncErrorHandler(async (req, res) => {
		const { email } = req.body;
		logger.info(`[OtpController] Sending OTP to: ${email}`);

		await mailService.sendOtpMail(email);

		logger.info(`[OtpController] OTP sent successfully to: ${email}`);
		res.json({ status: 200 });
	});

	verifyOtp = asyncErrorHandler(async (req, res) => {
		const { email, otp } = req.body;
		logger.info(`[OtpController] Verifying OTP for: ${email}`);

		const result = await mailService.verifyOtp(email, otp);

		if (result.status === 200) {
			logger.info(`[OtpController] OTP verification successful for: ${email}`);
		} else {
			logger.warn(`[OtpController] OTP verification failed for: ${email} - ${JSON.stringify(result)}`);
		}

		res.json(result);
	});
}

module.exports = new OtpController();
