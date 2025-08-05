const logger = require('../logger');
const userModel = require('../models/user.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCustomer = async userId => {
	try {
		logger.info(`[StripeService] Creating Stripe customer for userId: ${userId}`);

		const user = await userModel.findById(userId);
		if (!user) {
			logger.warn(`[StripeService] User not found for userId: ${userId}`);
			throw new Error('User not found');
		}

		const customer = await stripe.customers.create({
			email: user.email,
			name: user.fullName,
			metadata: { userId: user._id.toString() },
		});

		await userModel.findByIdAndUpdate(userId, { customerId: customer.id });

		logger.info(`[StripeService] Stripe customer created for userId: ${userId}, customerId: ${customer.id}`);
		return customer;
	} catch (error) {
		logger.error(`[StripeService] Error creating customer for userId: ${userId} - ${error.message}`);
		throw new Error(error);
	}
};

const getCustomer = async userId => {
	try {
		logger.info(`[StripeService] Retrieving Stripe customer for userId: ${userId}`);

		const user = await userModel.findById(userId);
		if (!user) {
			logger.warn(`[StripeService] User not found for userId: ${userId}`);
			throw new Error('User not found');
		}

		if (!user.customerId) {
			logger.info(`[StripeService] No customerId found for userId: ${userId}, creating new customer`);
			return await createCustomer(userId);
		}

		const customer = await stripe.customers.retrieve(user.customerId);

		logger.info(`[StripeService] Retrieved Stripe customer for userId: ${userId}, customerId: ${user.customerId}`);
		return customer;
	} catch (error) {
		logger.error(`[StripeService] Error retrieving customer for userId: ${userId} - ${error.message}`);
		throw new Error(error);
	}
};

module.exports = { getCustomer };
