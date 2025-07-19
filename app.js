require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { rateLimit } = require('express-rate-limit');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');

const stripeController = require('./controllers/stripe.controller');
const errorHandlerMiddleware = require('./middlewares/error-handler');
const notFoundMiddleware = require('./middlewares/not-found');

const app = express();

// database
const connectDB = require('./db/connect');

// webhooks
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeController.webhook);

// Middlewares.
app.use(helmet());
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

app.use(
	rateLimit({
		windowMs: 1 * 60 * 1000,
		limit: 300,
		standardHeaders: 'draft-7',
		legacyHeaders: false,
	}),
);

app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Test middleware
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

// Routes
app.use('/api', require('./routes/index'));

// Error middleware
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// App starting
const bootstrap = async () => {
	try {
		const PORT = process.env.PORT || 5050;
		await connectDB(process.env.MONGO_URI);
		app.listen(PORT, () => console.log(`🌎 Server running on port ${PORT}`));
	} catch (error) {
		console.log(error);
	}
};

bootstrap();
