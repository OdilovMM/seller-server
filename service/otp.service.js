const logger = require('../logger');
const mailService = require('./mail.service');

class OtpService {
	async sendOtp(email) {
		logger.debug(`[OtpService] sendOtp called ${JSON.stringify(email)}`);
		logger.info(`[OtpService] Otp sent ${email}`);
		await mailService.sendOtpMail(email);
	}

	async verifyOtp(email, otp) {
		logger.debug(`[OtpService] verifyOtp called ${JSON.stringify(email, otp)}`);
		logger.info(`[OtpService] verifyOtp sent ${email, otp}`);
		return await mailService.verifyOtp(email, otp);
	}
}

module.exports = new OtpService();
