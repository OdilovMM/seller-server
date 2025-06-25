const userModel = require('../models/user.model');
const bcrypt = require('bcrypt');

class AuthController {
	async login(req, res, next) {
		try {
			const { email, password } = req.body;
			const user = await userModel.findOne({ email });

			if (!user) return res.json({ failure: 'User not found' });

			if (user.isDeleted)
				return res.json({ failure: `User is deleted at ${user.deletedAt.toLocaleString()}` });
			const isValidPassword = await bcrypt.compare(password, user.password);
			if (!isValidPassword) return res.json({ failure: 'Password do not match' });

			return res.json({ user });
		} catch (error) {
			next(error);
		}
	}

	async register(req, res, next) {
		try {
			const { email, password, fullName } = req.body;
			const user = await userModel.findOne({ email });
			if (user) return res.json({ failure: 'User already exist' });

			const hashedPassword = await bcrypt.hash(password, 10);
			const newUser = await userModel.create({ email, password: hashedPassword, fullName });

			return res.json({ user: newUser });
		} catch (error) {
			next(error);
		}
	}
}

module.exports = new AuthController();
