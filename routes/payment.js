const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/initiate-payment', paymentController.initiatePayment);
router.post('/callback', paymentController.handlePaymentCallback);
router.get('/status/:purchaseId', paymentController.checkPurchaseStatus);
router.post('/confirm', paymentController.confirmPurchase); // New route

module.exports = router;