const asyncErrorHandler = require('../utils/asyncErrorHandler');
const adminService = require('../service/admin.service');

class AdminController {
	getProducts = asyncErrorHandler(async (req, res) => {
		const result = await adminService.getProducts(req.query);
		res.json(result);
	});

	getCustomers = asyncErrorHandler(async (req, res) => {
		const result = await adminService.getCustomers(req.query);
		res.json(result);
	});

	getOrders = asyncErrorHandler(async (req, res) => {
		const result = await adminService.getOrders(req.query);
		res.json(result);
	});

	getTransactions = asyncErrorHandler(async (req, res) => {
		const result = await adminService.getTransactions(req.query);
		res.json(result);
	});

	createProduct = asyncErrorHandler(async (req, res) => {
		const result = await adminService.createProduct(req.user._id, req.body);
		res.status(201).json(result);
	});

	updateProduct = asyncErrorHandler(async (req, res) => {
		const result = await adminService.updateProduct(req.user._id, req.params.id, req.body);
		res.status(200).json(result);
	});

	updateOrder = asyncErrorHandler(async (req, res) => {
		const result = await adminService.updateOrder(req.params.id, req.body.status, req.user);
		res.json(result);
	});

	deleteProduct = asyncErrorHandler(async (req, res) => {
		const result = await adminService.deleteProduct(req.params.id);
		res.status(result.status).json(result);
	});
}

module.exports = new AdminController();
