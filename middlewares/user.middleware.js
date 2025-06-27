const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const { UnauthorizedError } = require('../errors');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

const authUserMiddleware = asyncErrorHandler(async (req, res, next) => {
	const authorization = req.headers.authorization;
	if (!authorization) {
		throw new UnauthorizedError('Authorization header missing');
	}

	const token = authorization.split(' ')[1];
	if (!token) {
		throw new UnauthorizedError('Token not provided');
	}

	const decoded = jwt.verify(token, process.env.JWT_SECRET);
	if (!decoded?.userId) {
		throw new UnauthorizedError('Invalid token payload');
	}

	const user = await userModel.findById(decoded.userId);
	if (!user) {
		throw new UnauthorizedError('User not found');
	}

	req.user = user;
	next();
});

module.exports = authUserMiddleware;
