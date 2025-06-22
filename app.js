require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', require('./routes/index'));

// Error middleware
app.use(errorMiddleware);

// App starting
const bootstrap = async () => {
	try {
		const PORT = process.env.PORT || 5050;
		mongoose.connect(process.env.MONGO_URI).then(() => console.log('Mongoose Connection success!'));
		app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
	} catch (error) {
		console.log(error);
	}
};

bootstrap();
