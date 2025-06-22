const mailService = require('../service/mail.service');

class OtpController {
	async sendOtp(req, res, next) {
		try {
			const { email } = req.body;
			await mailService.sendOtpMail(email);
			res.json({ message: 'OTP sent successfully' });
		} catch (error) {
            console.log(error)
			next(error);
		}
	}
}

module.exports = new OtpController();
