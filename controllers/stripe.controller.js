const asyncErrorHandler = require('../utils/asyncErrorHandler');
const stripeService = require('../service/stripe.service');

class StripeController {
	webhook = asyncErrorHandler(async (req, res) => {
		const result = await stripeService.handleWebhookEvent(req.body, req.headers);

		console.log('data', result.data);
		console.log('eventType', result.eventType);

		res.status(200).end();
	});
}

module.exports = new StripeController();
