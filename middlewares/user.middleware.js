const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const { UnauthorizedError } = require('../errors');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const logger = require('../logger');


const authUserMiddleware = asyncErrorHandler(async (req, res, next) => {
	const authorization = req.headers.authorization;
	if (!authorization) {
		logger.warn('[AuthUser] Missing Authorization header');
		throw new UnauthorizedError('Authorization header missing');
	}

	const token = authorization.split(' ')[1];
	if (!token) {
		logger.warn('[AuthUser] Token not provided');
		throw new UnauthorizedError('Token not provided');
	}

	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	if (!decoded?.userId) {
		logger.warn(`[AuthUser] Token verification failed: ${err.message}`);
		throw new UnauthorizedError('Invalid token payload');
	}

	if (!decoded?.userId) {
		logger.warn('[AuthUser] Invalid token payload — missing userId');
		throw new UnauthorizedError('Invalid token payload');
	}

	const user = await userModel.findById(decoded.userId);
	if (!user) {
		logger.warn(`[AuthUser] User not found for userId: ${decoded.userId}`);
		throw new UnauthorizedError('User not found');
	}

	req.user = user;
	next();
});

module.exports = authUserMiddleware;
