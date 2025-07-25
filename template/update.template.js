const { formatPrice } = require('../libs/utils');

function updateTemplate({ user, product, status }) {
	return `
		<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f6f9fc;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #235af2;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 24px;
        }
        .content {
            padding: 20px;
        }
        .product {
            display: flex;
            align-items: center;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            margin: 10px 0;
            overflow: hidden;
        }
        .product img {
            width: 100px;
            height: 100px;
            object-fit: cover;
        }
        .product-details {
            padding: 10px;
            flex: 1;
        }
        .product-details h3 {
            margin: 0;
            font-size: 18px;
            color: #333;
        }
        .product-details p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
        }
        .status {
            font-size: 16px;
            font-weight: bold;
            color: #235af2;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            padding: 10px;
            background-color: #f1f1f1;
            color: #7a7a7a;
            font-size: 14px;
        }
        .footer a {
            color: #235af2;
            text-decoration: none;
        }
        .footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            Order Status Update
        </div>
        <div class="content">
            <p>Dear <strong>${user.fullName}</strong>,</p>
            <p>We wanted to update you on the status of your order. Here are the details:</p>
            <div class="product">
                <img src="${product.image}" alt="${product.title}">
                <div class="product-details">
                    <h3>${product.title}</h3>
                    <p>Price: <strong>${formatPrice(product.price)}</strong></p>
                </div>
            </div>
            <p class="status">Order Status: <strong>${status}</strong></p>
            <p>We’ll notify you about further updates or changes. Thank you for your patience!</p>
        </div>
        <div class="footer">
            <p>Thank you for shopping with us!</p>
            <p>
                Need help? <a href="mailto:dssrinman@gmail.com">Contact Support</a>
            </p>
        </div>
    </div>
</body>
</html>

	`;
}

module.exports = updateTemplate;
