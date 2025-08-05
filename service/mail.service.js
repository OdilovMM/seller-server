const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const otpModel = require('../models/otm.model');
const otpTemplate = require('../template/otp.template');
const successTemplate = require('../template/success.template');
const cancelTemplate = require('../template/cancel.template');
const updateTemplate = require('../template/update.template');
const logger = require('../logger');

class MailService {
	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: process.env.SMTP_PORT,
			secure: false,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_KEY,
			},
		});
		logger.info(`[MailService] Mail transporter initialized`);
	}

	async sendOtpMail(email) {
		logger.info(`[MailService] Generating OTP for: ${email}`);

		const otp = Math.floor(100000 + Math.random() * 900000);
		const hashedOtp = await bcrypt.hash(otp.toString(), 10);

		await otpModel.deleteMany({ email });
		logger.info(`[MailService] Cleared previous OTPs for: ${email}`);

		await otpModel.create({ email, otp: hashedOtp, expireAt: Date.now() + 5 * 60 * 1000 });
		logger.info(`[MailService] New OTP saved for: ${email}`);

		await this.transporter.sendMail({
			from: process.env.SMTP_USER,
			to: email,
			subject: `OTP for verification ${new Date().toLocaleString()}`,
			html: otpTemplate(otp),
		});
		logger.info(`[MailService] OTP email sent to: ${email}`);
	}

	async sendSuccessMail({ user, product }) {
		const email = user.email;
		logger.info(`[MailService] Sending success email to: ${email}`);
		await this.transporter.sendMail({
			from: process.env.SMTP_USER,
			to: email,
			subject: `Order Confirmation ${new Date().toLocaleString()}`,
			html: successTemplate({ user, product }),
		});
		logger.info(`[MailService] Success email sent to: ${email}`);
	}

	async sendCancelMail({ user, product }) {
		const email = user.email;
		logger.info(`[MailService] Sending cancellation email to: ${email}`);
		await this.transporter.sendMail({
			from: process.env.SMTP_USER,
			to: email,
			subject: `Order Cancellation ${new Date().toLocaleString()}`,
			html: cancelTemplate({ user, product }),
		});
		logger.info(`[MailService] Cancellation email sent to: ${email}`);
	}

	async sendUpdateMail({ user, product, status }) {
		const email = user.email;
		logger.info(`[MailService] Sending update email to: ${email}, status: ${status}`);
		await this.transporter.sendMail({
			from: process.env.SMTP_USER,
			to: email,
			subject: `Order Update ${new Date().toLocaleString()}`,
			html: updateTemplate({ user, product, status }),
		});
		logger.info(`[MailService] Update email sent to: ${email}`);
	}

	async verifyOtp(email, otp) {
		logger.info(`[MailService] Verifying OTP for: ${email}`);
		const record = await otpModel.find({ email });

		if (!record || record.length === 0) {
			logger.warn(`[MailService] No OTP record found for: ${email}`);
			return { failure: 'Record not found' };
		}

		const lastRecord = record[record.length - 1];
		if (lastRecord.expireAt < new Date()) {
			logger.warn(`[MailService] OTP expired for: ${email}`);
			return { status: 301 };
		}

		const isValid = await bcrypt.compare(otp, lastRecord.otp);
		if (!isValid) {
			logger.warn(`[MailService] Invalid OTP for: ${email}`);
			return { failure: 'Invalid verification code' };
		}

		await otpModel.deleteMany({ email });
		logger.info(`[MailService] OTP verified and deleted for: ${email}`);
		return { status: 200 };
	}
}

module.exports = new MailService();
