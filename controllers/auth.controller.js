const asyncErrorHandler = require('../utils/asyncErrorHandler');
const authService = require('../service/auth.service');

class AuthController {
	login = asyncErrorHandler(async (req, res) => {
		const user = await authService.login(req.body);
		res.json({ user });
	});

	register = asyncErrorHandler(async (req, res) => {
		const user = await authService.register(req.body);
		res.json({ user });
	});
}

module.exports = new AuthController();
