const { Schema, model } = require('mongoose');

const userSchema = new Schema(
	{
		email: {
			type: String,
			require: true,
			unique: true,
		},
		fullName: {
			type: String,
			require: true,
		},
		password: {
			type: String,
			require: true,
		},
		role: {
			type: String,
			require: true,
			default: 'user',
		},
		avatar: {
			type: String,
		},
		avatarKey: {
			type: String,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
		deletedAt: {
			type: Date,
		},
		favorites: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Product',
			},
		],
		customerId: { type: String },
	},
	{
		timestamps: true,
	},
);

module.exports = model('User', userSchema);
