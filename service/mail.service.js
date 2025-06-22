const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const otpModel = require('../models/otm.model');

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
	}

	async sendOtpMail(email) {
		const otp = Math.floor(100000 + Math.random() * 900000);
		const hashedOtp = await bcrypt.hash(otp.toString(), 10);
		await otpModel.create({ email, otp: hashedOtp, expireAt: Date.now() + 5 * 60 * 1000 }); // 5minutes
		await this.transporter.sendMail({
			from: process.env.SMTP_USER,
			to: email,
			subject: `OTP for verification ${new Date().toLocaleString()}`,
			html: `
            <h1>Your OTP is ${otp}</h1>
            <p>OTP will expire in 5 minutes</p>
            `,
		});
	}
}

module.exports = new MailService();
