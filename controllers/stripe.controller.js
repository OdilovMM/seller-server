const asyncErrorHandler = require('../utils/asyncErrorHandler');
const stripeService = require('../service/stripe.service');
const logger = require('../logger');


class StripeController {
	webhook = asyncErrorHandler(async (req, res) => {
		logger.info(`[StripeController] Webhook data sent: ${req.body, req.headers}`);
		const result = await stripeService.handleWebhookEvent(req.body, req.headers);
		logger.info(`[StripeController] Webhook data fetched: ${result}`);
		res.status(200).end();
	});
}

module.exports = new StripeController();
