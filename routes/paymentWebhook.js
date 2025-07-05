// routes/paymentWebhook.js
const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');

// routes/paymentWebhook.js
router.post('/webhook', async (req, res) => {
  try {
    const data = req.body;

    const isSuccess = data.type === 'TRANSACTION' && data.obj.success === true;
    const isFailure = data.type === 'TRANSACTION' && data.obj.success === false;

    const transactionId = data.obj.order.id.toString();

    if (isSuccess) {
      await Purchase.findOneAndUpdate(
        { transactionId },
        { status: 'Paid' },
        { new: true }
      );
      console.log('✅ Payment succeeded');
    } else if (isFailure) {
      await Purchase.findOneAndUpdate(
        { transactionId },
        { status: 'Failed' },
        { new: true }
      );
      console.log('❌ Payment failed');
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Internal error');
  }
});


module.exports = router;
