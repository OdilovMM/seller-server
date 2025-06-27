const asyncErrorHandler = require('../utils/asyncErrorHandler');
const userService = require('../service/user.service');

class UserController {
	getProducts = asyncErrorHandler(async (req, res) => {
		const result = await userService.getProducts(req.query);
		res.json(result);
	});

	getProduct = asyncErrorHandler(async (req, res) => {
		const product = await userService.getProductById(req.params.id);
		res.json({ product });
	});

	getProfile = asyncErrorHandler(async (req, res) => {
		const user = await userService.getUserProfile(req.params.id);
		res.json({ user });
	});

	getOrders = asyncErrorHandler(async (req, res) => {
		const result = await userService.getOrders(req.user, req.query);
		res.json(result);
	});

	getTransactions = asyncErrorHandler(async (req, res) => {
		const result = await userService.getTransactions(req.user, req.query);
		res.json(result);
	});

	getFavorites = asyncErrorHandler(async (req, res) => {
		const result = await userService.getFavorites(req.user, req.query);
		res.json(result);
	});

	getStatistics = asyncErrorHandler(async (req, res) => {
		const result = await userService.getStatistics(req.user);
		res.json(result);
	});

	addFavorite = asyncErrorHandler(async (req, res) => {
		await userService.addFavorite(req.user, req.body.productId);
		res.json({ status: 200 });
	});

	updateProfile = asyncErrorHandler(async (req, res) => {
		await userService.updateProfile(req.user, req.body);
		res.json({ status: 200 });
	});

	updatePassword = asyncErrorHandler(async (req, res) => {
		const { oldPassword, newPassword } = req.body;
		await userService.updatePassword(req.user, oldPassword, newPassword);
		res.json({ status: 200 });
	});

	deleteFavorite = asyncErrorHandler(async (req, res) => {
		await userService.deleteFavorite(req.user, req.params.id);
		res.json({ status: 200 });
	});

	stripeCheckout = asyncErrorHandler(async (req, res) => {
		const checkoutUrl = await userService.stripeCheckout(req.user, req.body.productId);
		res.json({ status: 200, checkoutUrl });
	});
}

module.exports = new UserController();
