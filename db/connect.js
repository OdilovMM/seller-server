const mongoose = require('mongoose');
const logger = require('../logger');


const connectDB = url => {
	return mongoose
		.connect(url)
		.then(() => {
			logger.info(' [ConnectDB.js] Successfully connected to MongoDB');
		})
		.catch(err => {
			logger.error('[ConnectDB.js] Failed to connect to MongoDB:', err);
			process.exit(1); 
		});
};

module.exports = connectDB;
