const { UnauthorizedError } = require('../errors');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

const adminAuthMiddleware = asyncErrorHandler(async (req, res, next) => {
	const authorization = req.headers.authorization;
	if (!authorization) {
		throw new UnauthorizedError('Authorization header missing');
	}

	const token = authorization.split(' ')[1];
	if (!token) {
		throw new UnauthorizedError('Token missing');
	}

	const { userId } = jwt.verify(token, process.env.JWT_SECRET);
	if (!userId) {
		throw new UnauthorizedError('Invalid token payload');
	}

	const user = await userModel.findById(userId);
	if (!user) {
		throw new UnauthorizedError('User not found');
	}

	if (user.role !== 'admin') {
		throw new UnauthorizedError('Admin privileges required');
	}

	req.user = user;
	next();
});

module.exports = adminAuthMiddleware;
