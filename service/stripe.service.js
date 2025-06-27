const { TransactionState } = require('../enum/transaction.enum');
const orderModel = require('../models/order.model');
const productModel = require('../models/product.model');
const transactionModel = require('../models/transaction.model');
const userModel = require('../models/user.model');
const mailService = require('../service/mail.service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
	async handleWebhookEvent(body, headers) {
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

		return { data, eventType };
	}

	async handlePaymentFailed(data) {
		const user = await userModel.findById(data.metadata.userId);
		console.log('payment failed', data);
		const product = await productModel.findById(data.metadata.productId);
		await transactionModel.create({
			user: data.metadata.userId,
			product: data.metadata.productId,
			state: TransactionState.PaidCanceled,
			amount: product.price,
			provider: 'stripe',
		});
		await mailService.sendCancelMail({ user, product });
	}

	async handlePaymentSucceeded(data) {
		const user = await userModel.findById(data.metadata.userId);
		console.log('payment succeeded', data);
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
		await mailService.sendSuccessMail({ user, product });
	}
}

module.exports = new StripeService();
