const asyncErrorHandler = require('../utils/asyncErrorHandler');
const authService = require('../service/auth.service');
const logger = require('../logger');


class AuthController {
	login = asyncErrorHandler(async (req, res) => {
		const { email } = req.body;
		logger.info(`[AuthController] Login attempt | Email: ${email}`);

		const user = await authService.login(req.body);

		logger.info(`[AuthController] Login success | User ID: ${user._id}`);
		res.json({ user });
	});

	register = asyncErrorHandler(async (req, res) => {
		const { email, fullName } = req.body;
		logger.info(`[AuthController] Register attempt | Email: ${email}, Name: ${fullName}`);
		const user = await authService.register(req.body);
		
		logger.info(`[AuthController] Register success | User ID: ${user._id}`);
		res.json({ user });
	});
}

module.exports = new AuthController();
