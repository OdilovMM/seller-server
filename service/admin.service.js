const userModel = require('../models/user.model');
const productModel = require('../models/product.model');
const orderModel = require('../models/order.model');
const transactionModel = require('../models/transaction.model');
const mailService = require('../service/mail.service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../logger');

class AdminService {
	async getProducts(queryParams) {
		logger.debug(`[AdminService] getProducts called with ${JSON.stringify(queryParams)}`);

		const { searchQuery, filter, category, page, pageSize } = queryParams;
		const skipAmount = (+page - 1) * +pageSize;
		const query = {};

		if (searchQuery) {
			const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			query.$or = [{ title: { $regex: new RegExp(escapedSearchQuery, 'i') } }];
		}

		if (category === 'All') query.category = { $exists: true };
		else if (category !== 'All' && category) query.category = category;

		let sortOptions = { createdAt: -1 };
		if (filter === 'newest') sortOptions = { createdAt: -1 };
		else if (filter === 'oldest') sortOptions = { createdAt: 1 };

		const products = await productModel
			.find(query)
			.sort(sortOptions)
			.skip(skipAmount)
			.limit(+pageSize);

		const totalProducts = await productModel.countDocuments(query);
		const isNext = totalProducts > skipAmount + +products.length;

		logger.info(`[AdminService] Found ${products.length} products`);
		return { products, isNext };
	}

	async getCustomers(queryParams) {
		logger.debug(`[AdminService] getCustomers called with ${JSON.stringify(queryParams)}`);
		const { searchQuery, filter, page, pageSize } = queryParams;
		const skipAmount = (+page - 1) * +pageSize;
		const query = {};

		if (searchQuery) {
			const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			query.$or = [
				{ fullName: { $regex: new RegExp(escapedSearchQuery, 'i') } },
				{ email: { $regex: new RegExp(escapedSearchQuery, 'i') } },
			];
		}

		let sortOptions = { createdAt: -1 };
		if (filter === 'newest') sortOptions = { createdAt: -1 };
		else if (filter === 'oldest') sortOptions = { createdAt: 1 };

		const customers = await userModel.aggregate([
			{ $match: query },
			{ $lookup: { from: 'orders', localField: '_id', foreignField: 'user', as: 'orders' } },
			{ $addFields: { orderCount: { $size: '$orders' } } },
			{ $unwind: { path: '$orders', preserveNullAndEmptyArrays: true } },
			{
				$group: {
					_id: '$_id',
					email: { $first: '$email' },
					fullName: { $first: '$fullName' },
					role: { $first: '$role' },
					createdAt: { $first: '$createdAt' },
					updatedAt: { $first: '$updatedAt' },
					totalPrice: { $sum: '$orders.price' },
					orderCount: { $first: '$orderCount' },
					isDeleted: { $first: '$isDeleted' },
				},
			},
			{ $sort: sortOptions },
			{ $skip: skipAmount },
			{ $limit: +pageSize },
		]);

		const totalCustomers = await userModel.countDocuments(query);
		const isNext = totalCustomers > skipAmount + +customers.length;

		logger.info(`[AdminService] Found ${customers.length} customers`);
		return { customers, isNext };
	}

	async getOrders(queryParams) {
		logger.debug(`[AdminService] getOrders called with ${JSON.stringify(queryParams)}`);
		
		const { searchQuery, filter, page, pageSize } = queryParams;
		const skipAmount = (page - 1) * pageSize;
		const query = {};

		if (searchQuery) {
			const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			query.$or = [
				{ 'user.fullName': { $regex: new RegExp(escapedSearchQuery, 'i') } },
				{ 'user.email': { $regex: new RegExp(escapedSearchQuery, 'i') } },
				{ 'product.title': { $regex: new RegExp(escapedSearchQuery, 'i') } },
			];
		}

		let sortOptions = { createdAt: -1 };
		if (filter === 'newest') sortOptions = { createdAt: -1 };
		else if (filter === 'oldest') sortOptions = { createdAt: 1 };

		const orders = await orderModel.aggregate([
			{ $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
			{ $unwind: '$user' },
			{ $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
			{ $unwind: '$product' },
			{ $match: query },
			{ $sort: sortOptions },
			{ $skip: skipAmount },
			{ $limit: +pageSize },
			{
				$project: {
					'user.email': 1,
					'user.fullName': 1,
					'product.title': 1,
					price: 1,
					createdAt: 1,
					status: 1,
				},
			},
		]);

		const totalOrders = await orderModel.countDocuments(query);
		const isNext = totalOrders > skipAmount + +orders.length;

		logger.info(`[AdminService] Found ${orders.length} orders`);

		return { orders, isNext };
	}

	async getTransactions(queryParams) {
		logger.debug(`[AdminService] getTransactions called with ${JSON.stringify(queryParams)}`);

		const { searchQuery, filter, page, pageSize } = queryParams;
		const skipAmount = (page - 1) * pageSize;
		const query = {};

		if (searchQuery) {
			const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			query.$or = [
				{ 'user.fullName': { $regex: new RegExp(escapedSearchQuery, 'i') } },
				{ 'user.email': { $regex: new RegExp(escapedSearchQuery, 'i') } },
				{ 'product.title': { $regex: new RegExp(escapedSearchQuery, 'i') } },
			];
		}

		let sortOptions = { createdAt: -1 };
		if (filter === 'newest') sortOptions = { createdAt: -1 };
		else if (filter === 'oldest') sortOptions = { createdAt: 1 };

		const transactions = await transactionModel.aggregate([
			{ $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
			{ $unwind: '$user' },
			{ $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
			{ $unwind: '$product' },
			{ $match: query },
			{ $sort: sortOptions },
			{ $skip: skipAmount },
			{ $limit: +pageSize },
			{
				$project: {
					'user.email': 1,
					'user.fullName': 1,
					'product.title': 1,
					'product.price': 1,
					amount: 1,
					createdAt: 1,
					state: 1,
					provider: 1,
				},
			},
		]);

		const totalTransactions = await transactionModel.countDocuments(query);
		const isNext = totalTransactions > skipAmount + +transactions.length;

		logger.info(`[AdminService] Found ${transactions.length} transactions`);
		return { transactions, isNext };
	}

	async createProduct(userId, productData) {
		logger.debug(`[AdminService] createProduct called with ${JSON.stringify(productData)}`);

		const newProduct = await productModel.create(productData);
		if (!newProduct) throw new Error('Fail while creating product');

		const product = await stripe.products.create({
			name: newProduct.title,
			images: [newProduct.image],
			metadata: { productId: newProduct._id.toString(), userId: userId.toString() },
		});

		const exchangeRate = 12500;
		const amountInUSD = newProduct.price / exchangeRate;

		const price = await stripe.prices.create({
			product: product.id,
			unit_amount: Math.round(amountInUSD * 100),
			currency: 'usd',
			metadata: { productId: newProduct._id.toString(), userId: userId.toString() },
		});

		logger.info(`[AdminService] created ${newProduct} products`);

		await productModel.findByIdAndUpdate(newProduct._id, {
			stripeProductId: product.id,
			stripePriceId: price.id,
		});

		return { status: 201, newProduct };
	}

	async updateProduct(userId, productId, updateData) {
		logger.debug(`[AdminService] updateProduct called with id of ${JSON.stringify(productId)} with ${JSON.stringify(updateData)}`);

		const updateProduct = await productModel.findByIdAndUpdate(productId, updateData, {
			new: true,
		});
		if (!updateProduct) throw new Error('Product not found');

		const exchangeRate = 12500;
		const amountInUSD = updateProduct.price / exchangeRate;

		const price = await stripe.prices.create({
			product: updateProduct.stripeProductId,
			unit_amount: Math.round(amountInUSD * 100),
			currency: 'usd',
			metadata: { productId: updateProduct._id.toString(), userId: userId.toString() },
		});

		await productModel.findByIdAndUpdate(updateProduct._id, { stripePriceId: price.id });

		logger.info(`[AdminService] updated ${updateProduct} product`);
		return { status: 200, updateProduct };
	}

	async updateOrder(orderId, status, adminUser) {
		logger.debug(`[AdminService] updateOrder called with id of ${JSON.stringify(orderId)} with ${JSON.stringify(status)}`);
		const updatedOrder = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
		if (!updatedOrder) throw new Error('Failed while updating order');

		const user = await userModel.findById(updatedOrder.user);
		const product = await productModel.findById(updatedOrder.product);

		await mailService.sendUpdateMail({ user: adminUser, product, status });

		logger.info(`[AdminService] updated Order ${updatedOrder, status}`);
		return { success: 200, updatedOrder };
	}

	async deleteProduct(productId) {
		logger.debug(`[AdminService] deleteProduct called with id of ${JSON.stringify(productId)}`);
		const product = await productModel.findById(productId);

		if (!product) {
			const error = new Error('Product not found');
			error.statusCode = 404;
			throw error;
		}

		if (product.stripePriceId) {
			await stripe.prices.update(product.stripePriceId, { active: false });
		}

		if (product.stripeProductId) {
			await stripe.products.update(product.stripeProductId, { active: false });
		}

		await productModel.findByIdAndDelete(productId);
		logger.info(`[AdminService] deleteProduct ${product}`);
		return { status: 204, product };
	}
}

module.exports = new AdminService();
