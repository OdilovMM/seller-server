const mailService = require('./mail.service');

class OtpService {
	async sendOtp(email) {
		await mailService.sendOtpMail(email);
	}

	async verifyOtp(email, otp) {
		return await mailService.verifyOtp(email, otp);
	}
}

module.exports = new OtpService();
