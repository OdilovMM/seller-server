const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');

class AuthService {
	async register({ email, password, fullName }) {
		const existingUser = await userModel.findOne({ email });
		if (existingUser) throw new BadRequestError('User already exists');

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await userModel.create({
			email,
			password: hashedPassword,
			fullName,
		});
		return newUser;
	}

	async login({ email, password }) {
		const user = await userModel.findOne({ email });
		if (!user) throw new NotFoundError('User not found');

		if (user.isDeleted) {
			throw new BadRequestError(`User is deleted at ${user.deletedAt.toLocaleString()}`);
		}

		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) throw new UnauthenticatedError('Password does not match');

		return user;
	}
}

module.exports = new AuthService();
