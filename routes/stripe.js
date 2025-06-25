const router = require('express').Router();
const userMiddleware = require('../middlewares/user.middleware');
const userController = require('../controllers/user.controller');



router.post('/checkout',userMiddleware, userController.stripeCheckout);


module.exports = router;
