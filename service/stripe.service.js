const { TransactionState } = require('../enum/transaction.enum');
const logger = require('../logger');
const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const transactionModel = require('../models/transaction.model');
const userModel = require('../models/user.model');
const mailService = require('../service/mail.service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


class StripeService {
	async handleWebhookEvent(body, headers) {
		logger.debug(`[StripeService] handleWebhookEvent ${JSON.stringify(body)} with ${JSON.stringify(headers)}`);
		let data;
		let eventType;
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

		if (webhookSecret) {
			const signature = headers['stripe-signature'];
			const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
			data = event.data.object;
			eventType = event.type;
		} else {
			data = body.data.object;
			eventType = body.type;
		}

		if (eventType === 'payment_intent.payment_failed') {
			await this.handlePaymentFailed(data);
		}

		if (eventType === 'payment_intent.succeeded') {
			await this.handlePaymentSucceeded(data);
		}

		logger.info(`[StripeService] handleWebhookEvent ${data, eventType}`);
		return { data, eventType };
	}

	async handlePaymentFailed(data) {
		logger.debug(`[StripeService] handlePaymentFailed called ${JSON.stringify(data)}`);
		const user = await userModel.findById(data.metadata.userId);
		
		const product = await productModel.findById(data.metadata.productId);
		await transactionModel.create({
			user: data.metadata.userId,
			product: data.metadata.productId,
			state: TransactionState.PaidCanceled,
			amount: product.price,
			provider: 'stripe',
		});
		logger.info(`[StripeService] handlePaymentFailed ${product}`);

		await mailService.sendCancelMail({ user, product });
	}

	async handlePaymentSucceeded(data) {
		logger.debug(`[StripeService] handlePaymentSucceeded called ${JSON.stringify(data)}`);

		const user = await userModel.findById(data.metadata.userId);
		
		const product = await productModel.findById(data.metadata.productId);
		await orderModel.create({
			user: data.metadata.userId,
			product: data.metadata.productId,
			price: product.price,
		});
		await transactionModel.create({
			user: data.metadata.userId,
			product: data.metadata.productId,
			state: TransactionState.Paid,
			amount: product.price,
			provider: 'stripe',
		});
		
		logger.info(`[StripeService] handlePaymentSucceeded ${user, product}`);
		await mailService.sendSuccessMail({ user, product });
	}
}

module.exports = new StripeService();
