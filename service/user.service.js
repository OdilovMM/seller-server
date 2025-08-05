const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const userModel = require('../models/user.model');
const transactionModel = require('../models/transaction.model');
const bcrypt = require('bcrypt');
const { getCustomer } = require('../libs/customer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../logger');

const { NotFoundError, BadRequestError, UnauthorizedError } = require('../errors');

class UserService {
	async getProducts(query) {
		logger.info('UserService: Fetching products', { query });

		const { searchQuery, filter, category, page, pageSize } = query;
		const skipAmount = (+page - 1) * +pageSize;
		const dbQuery = {};

		if (searchQuery) {
			const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			dbQuery.$or = [{ title: { $regex: new RegExp(escapedSearchQuery, 'i') } }];
		}

		if (category === 'All') dbQuery.category = { $exists: true };
		else if (category !== 'All' && category) dbQuery.category = category;

		let sortOptions = { createdAt: -1 };
		if (filter === 'newest') sortOptions = { createdAt: -1 };
		else if (filter === 'oldest') sortOptions = { createdAt: 1 };

		const products = await productModel.find(dbQuery).sort(sortOptions).skip(skipAmount).limit(+pageSize);
		const totalProducts = await productModel.countDocuments(dbQuery);
		const isNext = totalProducts > skipAmount + +products.length;

		logger.info(`Fetched ${products.length} products`);

		return { products, isNext };
	}

	async getProductById(productId) {
		logger.info(`UserService: Fetching product by ID: ${productId}`);
		const product = await productModel.findById(productId);
		if (!product) {
			logger.warn(`Product not found: ${productId}`);
			throw new NotFoundError('Product not found');
		}
		return product;
	}

	async getUserProfile(userId) {
		logger.info(`UserService: Fetching user profile for ID: ${userId}`);
		const user = await userModel.findById(userId).select('-password');
		if (!user) {
			logger.warn(`User not found: ${userId}`);
			throw new NotFoundError('User not found');
		}
		return user;
	}

	async getOrders(user, query) {
		logger.info(`UserService: Fetching orders for user ${user._id}`, { query });

		const { searchQuery, filter, page, pageSize } = query;
		const skipAmount = (page - 1) * pageSize;
		const matchQuery = { user: user._id };

		if (searchQuery) {
			const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			matchQuery.$or = [{ 'product.title': { $regex: new RegExp(escapedSearchQuery, 'i') } }];
		}

		let sortOptions = { createdAt: -1 };
		if (filter === 'oldest') sortOptions = { createdAt: 1 };

		const orders = await orderModel.aggregate([
			{ $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
			{ $unwind: '$product' },
			{ $match: matchQuery },
			{ $sort: sortOptions },
			{ $skip: skipAmount },
			{ $limit: +pageSize },
			{
				$project: {
					'product.title': 1,
					'product.image': 1,
					createdAt: 1,
					updatedAt: 1,
					price: 1,
					status: 1,
				},
			},
		]);

		const totalOrders = await orderModel.countDocuments(matchQuery);
		const isNext = totalOrders > skipAmount + orders.length;

		logger.info(`Fetched ${orders.length} orders`);

		return { orders, isNext };
	}

	async getTransactions(user, query) {
		logger.info(`UserService: Fetching transactions for user ${user._id}`, { query });

		const { searchQuery, filter, page, pageSize } = query;
		const skipAmount = (page - 1) * pageSize;
		const matchQuery = { user: user._id };

		if (searchQuery) {
			const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			matchQuery.$or = [{ 'product.title': { $regex: new RegExp(escapedSearchQuery, 'i') } }];
		}

		let sortOptions = { createdAt: -1 };
		if (filter === 'oldest') sortOptions = { createdAt: 1 };

		const transactions = await transactionModel.aggregate([
			{ $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
			{ $unwind: '$product' },
			{ $match: matchQuery },
			{ $sort: sortOptions },
			{ $skip: skipAmount },
			{ $limit: +pageSize },
			{
				$project: {
					'product.title': 1,
					amount: 1,
					state: 1,
					create_time: 1,
					perform_time: 1,
					cancel_time: 1,
					reason: 1,
					provider: 1,
				},
			},
		]);

		const totalTransactions = await transactionModel.countDocuments(matchQuery);
		const isNext = totalTransactions > skipAmount + transactions.length;

		logger.info(`Fetched ${transactions.length} transactions`);

		return { transactions, isNext };
	}

	async getFavorites(user, query) {
		logger.info(`UserService: Fetching favorites for user ${user._id}`, { query });

		const { searchQuery, filter, page, pageSize, category } = query;
		const skipAmount = (page - 1) * pageSize;
		const userDoc = await userModel.findById(user._id);
		if (!userDoc) {
			logger.warn(`User not found for favorites: ${user._id}`);
			throw new NotFoundError('User not found');
		}

		const matchQuery = { _id: { $in: userDoc.favorites } };

		if (searchQuery) {
			const escapedSearchQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			matchQuery.$or = [{ title: { $regex: new RegExp(escapedSearchQuery, 'i') } }];
		}

		if (category === 'All') matchQuery.category = { $exists: true };
		else if (category !== 'All' && category) matchQuery.category = category;

		let sortOptions = {};
		if (filter === 'newest') sortOptions = { createdAt: -1 };
		else if (filter === 'oldest') sortOptions = { createdAt: 1 };

		const products = await productModel.find(matchQuery).sort(sortOptions).skip(skipAmount).limit(+pageSize);
		const totalProducts = await productModel.countDocuments(matchQuery);
		const isNext = totalProducts > skipAmount + +products.length;

		logger.info(`Fetched ${products.length} favorite products`);

		return { products, isNext };
	}

	async getStatistics(user) {
		logger.info(`UserService: Fetching statistics for user ${user._id}`);
		const userDoc = await userModel.findById(user._id);
		if (!userDoc) {
			logger.warn(`User not found for statistics: ${user._id}`);
			throw new NotFoundError('User not found');
		}

		const totalOrders = await orderModel.countDocuments({ user: userDoc._id });
		const totalTransactions = await transactionModel.countDocuments({ user: userDoc._id });
		const totalFavorites = userDoc.favorites.length;

		logger.info('Statistics fetched successfully');

		return { totalOrders, totalTransactions, totalFavorites };
	}

	async addFavorite(user, productId) {
		logger.info(`UserService: Adding favorite product ${productId} for user ${user._id}`);
		const isExist = await userModel.findOne({ _id: user._id, favorites: productId });
		if (isExist) {
			logger.warn(`Product already in favorites: ${productId}`);
			throw new BadRequestError('Product already in favorites');
		}

		await userModel.findByIdAndUpdate(user._id, { $push: { favorites: productId } });
		logger.info('Favorite added successfully');
	}

	async updateProfile(user, updateData) {
		logger.info(`UserService: Updating profile for user ${user._id}`);
		const userDoc = await userModel.findById(user._id);
		if (!userDoc) {
			logger.warn(`User not found for profile update: ${user._id}`);
			throw new NotFoundError('User not found');
		}

		await userModel.findByIdAndUpdate(user._id, updateData);
		logger.info('Profile updated successfully');
	}

	async updatePassword(user, oldPassword, newPassword) {
		logger.info(`UserService: Updating password for user ${user._id}`);
		const userDoc = await userModel.findById(user._id);
		if (!userDoc) {
			logger.warn(`User not found during password update: ${user._id}`);
			throw new NotFoundError('User not found');
		}

		const isPasswordMatch = await bcrypt.compare(oldPassword, userDoc.password);
		if (!isPasswordMatch) {
			logger.warn(`Incorrect old password for user ${user._id}`);
			throw new UnauthorizedError('Old password is incorrect');
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await userModel.findByIdAndUpdate(user._id, { password: hashedPassword });
		logger.info('Password updated successfully');
	}

	async deleteFavorite(user, favoriteId) {
		logger.info(`UserService: Removing favorite product ${favoriteId} for user ${user._id}`);
		const userDoc = await userModel.findById(user._id);
		if (!userDoc) {
			logger.warn(`User not found during favorite deletion: ${user._id}`);
			throw new NotFoundError('User not found');
		}
		userDoc.favorites.pull(favoriteId);
		await userDoc.save();
		logger.info('Favorite deleted successfully');
	}

	async stripeCheckout(user, productId) {
		logger.info(`UserService: Starting Stripe checkout for user ${user._id} and product ${productId}`);

		const customer = await getCustomer(user._id);
		const product = await productModel.findById(productId);
		if (!product) {
			logger.warn(`Product not found for checkout: ${productId}`);
			throw new NotFoundError('Product not found');
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			customer: customer.id,
			mode: 'payment',
			metadata: { productId: product._id.toString(), userId: user._id.toString() },
			line_items: [{ price: product.stripePriceId, quantity: 1 }],
			success_url: `${process.env.CLIENT_URL}/success?productId=${product._id}&userId=${user._id}`,
			cancel_url: `${process.env.CLIENT_URL}/cancel?productId=${product._id}&userId=${user._id}`,
			payment_intent_data: {
				metadata: { productId: product._id.toString(), userId: user._id.toString() },
			},
		});

		logger.info('Stripe checkout session created successfully');

		return session.url;
	}
}

module.exports = new UserService();
