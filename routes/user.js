const userController = require('../controllers/user.controller');
const authUserMiddleware = require('../middlewares/user.middleware');

const router = require('express').Router();

router.get('/products', userController.getProducts);
router.get('/product/:id', userController.getProduct);
router.get('/profile/:id', userController.getProfile);
router.get('/orders', authUserMiddleware, userController.getOrders);
router.get('/transactions', authUserMiddleware, userController.getTransactions);
router.get('/favorites', authUserMiddleware, userController.getFavorites);
router.get('/statistics', authUserMiddleware, userController.getStatistics);

router.post('/add-favorite', authUserMiddleware, userController.addFavorite);

router.put('/update-profile', authUserMiddleware, userController.updateProfile);
router.put('/update-password', authUserMiddleware, userController.updatePassword);

router.delete('/delete-favorite/:id', authUserMiddleware, userController.deleteFavorite);

module.exports = router;
