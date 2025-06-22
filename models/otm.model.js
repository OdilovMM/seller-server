const { Schema, model } = require('mongoose');

const otpSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
		},
		otp: {
			type: String,
			required: true,
		},
		expireAt: {
			type: Date,
		},
	},
	{ timestamps: true },
);

module.exports = model('Otp', otpSchema);
