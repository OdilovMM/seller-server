const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');
const { BadRequestError, NotFoundError, UnauthenticatedError } = require('../errors');
const logger = require('../logger');

class AuthService {
	async register({ email, password, fullName }) {
		logger.debug(`[AuthService] Register called | Email: ${email}, Name: ${fullName}`);

		const existingUser = await userModel.findOne({ email });
		if (existingUser) {
			logger.warn(`[AuthService] Register failed - User already exists | Email: ${email}`);
			throw new BadRequestError('User already exists');
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = await userModel.create({
			email,
			password: hashedPassword,
			fullName,
		});

		logger.info(`[AuthService] Register success | User ID: ${newUser._id}`);
		return newUser;
	}

	async login({ email, password }) {
		logger.debug(`[AuthService] Login called | Email: ${email}`);

		const user = await userModel.findOne({ email });
		if (!user) {
			logger.warn(`[AuthService] Login failed - User not found | Email: ${email}`);
			throw new NotFoundError('User not found');
		}

		if (user.isDeleted) {
			logger.warn(`[AuthService] Login failed - User deleted | Email: ${email}, DeletedAt: ${user.deletedAt}`);
			throw new BadRequestError(`User is deleted at ${user.deletedAt.toLocaleString()}`);
		}

		const isValidPassword = await bcrypt.compare(password, user.password);
		if (!isValidPassword) {
			logger.warn(`[AuthService] Login failed - Invalid password | Email: ${email}`);
			throw new UnauthenticatedError('Password does not match');
		}

		logger.info(`[AuthService] Login success | User ID: ${user._id}`);
		return user;
	}
}

module.exports = new AuthService();
