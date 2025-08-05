// utils/monitoring.js
const client = require('prom-client');

client.collectDefaultMetrics(); // Collect default Node.js metrics

// Example of custom counter
const httpRequestCounter = new client.Counter({
	name: 'http_requests_total',
	help: 'Total number of HTTP requests',
	labelNames: ['method', 'route', 'status_code'],
});

const requestDuration = new client.Histogram({
	name: 'http_request_duration_seconds',
	help: 'Duration of HTTP requests in seconds',
	labelNames: ['method', 'route', 'status_code'],
	buckets: [0.1, 0.5, 1, 2, 5], // You can adjust this
});

// Metrics endpoint
const register = client.register;

module.exports = {
	client,
	register,
	httpRequestCounter,
	requestDuration,
};
