const mongoose = require('mongoose');

const connectDB = url => {
	return mongoose
		.connect(url)
		.then(() => {
			console.log('✅ Successfully connected to MongoDB');
		})
		.catch(err => {
			console.error('❌ Failed to connect to MongoDB:', err);
			process.exit(1); 
		});
};

module.exports = connectDB;
