const asyncErrorHandler = require('../utils/asyncErrorHandler');
const userService = require('../service/user.service');
const logger = require('../logger');

class UserController {
	getProducts = asyncErrorHandler(async (req, res) => {
		logger.info('GET /products - Fetching products', { query: req.query });
		const result = await userService.getProducts(req.query);
		logger.info('Products fetched successfully');
		res.json(result);
	});

	getProduct = asyncErrorHandler(async (req, res) => {
		logger.info(`GET /product/${req.params.id} - Fetching product`);
		const product = await userService.getProductById(req.params.id);
		logger.info('Product fetched successfully');
		res.json({ product });
	});

	getProfile = asyncErrorHandler(async (req, res) => {
		logger.info(`GET /profile/${req.params.id} - Fetching profile`);
		const user = await userService.getUserProfile(req.params.id);
		logger.info('User profile fetched successfully');
		res.json({ user });
	});

	getOrders = asyncErrorHandler(async (req, res) => {
		logger.info(`GET /orders - Fetching orders for user ${req.user._id}`);
		const result = await userService.getOrders(req.user, req.query);
		res.json(result);
	});

	getTransactions = asyncErrorHandler(async (req, res) => {
		logger.info(`GET /transactions - Fetching transactions for user ${req.user._id}`);
		const result = await userService.getTransactions(req.user, req.query);
		res.json(result);
	});

	getFavorites = asyncErrorHandler(async (req, res) => {
		logger.info(`GET /favorites - Fetching favorites for user ${req.user._id}`);
		const result = await userService.getFavorites(req.user, req.query);
		res.json(result);
	});

	getStatistics = asyncErrorHandler(async (req, res) => {
		logger.info(`GET /statistics - Fetching statistics for user ${req.user._id}`);
		const result = await userService.getStatistics(req.user);
		res.json(result);
	});

	addFavorite = asyncErrorHandler(async (req, res) => {
		logger.info(`POST /favorites - Adding product ${req.body.productId} to favorites for user ${req.user._id}`);
		await userService.addFavorite(req.user, req.body.productId);
		res.json({ status: 200 });
	});

	updateProfile = asyncErrorHandler(async (req, res) => {
		logger.info(`PUT /profile - Updating profile for user ${req.user._id}`);
		await userService.updateProfile(req.user, req.body);
		res.json({ status: 200 });
	});

	updatePassword = asyncErrorHandler(async (req, res) => {
		logger.info(`PUT /password - Updating password for user ${req.user._id}`);
		const { oldPassword, newPassword } = req.body;
		await userService.updatePassword(req.user, oldPassword, newPassword);
		res.json({ status: 200 });
	});

	deleteFavorite = asyncErrorHandler(async (req, res) => {
		logger.info(`DELETE /favorites/${req.params.id} - Removing favorite for user ${req.user._id}`);
		await userService.deleteFavorite(req.user, req.params.id);
		res.json({ status: 200 });
	});

	stripeCheckout = asyncErrorHandler(async (req, res) => {
		logger.info(`POST /checkout - Creating Stripe checkout for user ${req.user._id}, product ${req.body.productId}`);
		const checkoutUrl = await userService.stripeCheckout(req.user, req.body.productId);
		res.json({ status: 200, checkoutUrl });
	});
}

module.exports = new UserController();
