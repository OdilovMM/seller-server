const { UnauthorizedError } = require('../errors');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const logger = require('../logger');

const adminAuthMiddleware = asyncErrorHandler(async (req, res, next) => {
	const authorization = req.headers.authorization;

	if (!authorization) {
		logger.warn('[AdminAuth] Authorization header missing');
		throw new UnauthorizedError('Authorization header missing');
	}

	const token = authorization.split(' ')[1];
	if (!token) {
		logger.warn('[AdminAuth] Token missing in Authorization header');
		throw new UnauthorizedError('Token missing');
	}

	let payload;
	try {
		payload = jwt.verify(token, process.env.JWT_SECRET);
	} catch (err) {
		logger.warn(`[AdminAuth] Invalid or expired token: ${err.message}`);
		throw new UnauthorizedError('Invalid or expired token');
	}

	const { userId } = payload;
	if (!userId) {
		logger.warn('[AdminAuth] Token payload missing userId');
		throw new UnauthorizedError('Invalid token payload');
	}

	const user = await userModel.findById(userId);
	if (!user) {
		logger.warn(`[AdminAuth] User not found for userId: ${userId}`);
		throw new UnauthorizedError('User not found');
	}

	if (user.role !== 'admin') {
		logger.warn(`[AdminAuth] Access denied. User ${userId} is not an admin`);
		throw new UnauthorizedError('Admin privileges required');
	}

	logger.info(`[AdminAuth] Admin access granted for userId: ${userId}`);
	req.user = user;
	next();
});

module.exports = adminAuthMiddleware;
