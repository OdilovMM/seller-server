const mailService = require('../service/mail.service');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

class OtpController {
	sendOtp = asyncErrorHandler(async (req, res) => {
		const { email } = req.body;
		await mailService.sendOtpMail(email);
		res.json({ status: 200 });
	});

	verifyOtp = asyncErrorHandler(async (req, res) => {
		const { email, otp } = req.body;
		const result = await mailService.verifyOtp(email, otp);
		res.json(result);
	});
}

module.exports = new OtpController();
