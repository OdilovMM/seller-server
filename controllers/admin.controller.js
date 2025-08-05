const asyncErrorHandler = require('../utils/asyncErrorHandler');
const adminService = require('../service/admin.service');
const logger = require('../logger');

class AdminController {
	getProducts = asyncErrorHandler(async (req, res) => {
		logger.info(`[AdminController] Fetching products | User: ${req.user?.email || 'guest'}`);
		const result = await adminService.getProducts(req.query);

		logger.info(`[AdminController] Products fetched: ${result.products.length}`);
		res.json(result);
	});

	getCustomers = asyncErrorHandler(async (req, res) => {
		logger.info(`[AdminController] Fetching customers | User: ${req.user?.email || 'guest'}`);
		const result = await adminService.getCustomers(req.query);

		logger.info(`[AdminController] Customers fetched: ${result.customers.length}`);
		res.json(result);
	});

	getOrders = asyncErrorHandler(async (req, res) => {
		logger.info(`[AdminController] Fetching orders | User: ${req.user?.email || 'guest'}`);
		const result = await adminService.getOrders(req.query);

		logger.info(`[AdminController] Orders fetched: ${result.orders.length}`);
		res.json(result);
	});
	
	getTransactions = asyncErrorHandler(async (req, res) => {
		logger.info(`[AdminController] Fetching transactions | User: ${req.user?.email || 'guest'}`);
		const result = await adminService.getTransactions(req.query);

		logger.info(`[AdminController] Transactions fethced: ${result.transactions.length}`);
		res.json(result);
	});

	createProduct = asyncErrorHandler(async (req, res) => {
		logger.info(`[AdminController] Creating a product with ${req.body} | User: ${req.user?.email || 'guest'}`);
		const result = await adminService.createProduct(req.user._id, req.body);

		logger.info(`[AdminController] A product created ${result.newProduct}`);
		res.status(201).json(result);
	});

	updateProduct = asyncErrorHandler(async (req, res) => {
		logger.info(`[AdminController] Update a product with ${req.params.id} id with ${req.body} data  | User: ${req.user?.email || 'guest'}`);
		const result = await adminService.updateProduct(req.user._id, req.params.id, req.body);

		logger.info(`[AdminController] An updated product ${result.updateProduct} with status ${result.status}`);
		res.status(200).json(result);
	});

	updateOrder = asyncErrorHandler(async (req, res) => {
		logger.info(`[AdminController] Update order with ${req.params.id} id with ${req.body} data  | User: ${req.user?.email || 'guest'}`);
		const result = await adminService.updateOrder(req.params.id, req.body.status, req.user);

		logger.info(`[AdminController] An updated order ${result.updatedOrder} with status ${result.status}`);
		res.json(result);
	});

	deleteProduct = asyncErrorHandler(async (req, res) => {
		logger.info(`[AdminController] delete product with ${req.params.id} id with ${req.body} data  | User: ${req.user?.email || 'guest'}`);
		const result = await adminService.deleteProduct(req.params.id);
		
		logger.info(`[AdminController] An delete product ${result.product} with status ${result.status}`);
		res.status(result.status).json(result);
	});
}

module.exports = new AdminController();
