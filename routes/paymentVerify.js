const express = require('express');
const router = express.Router();
const Purchase = require('../models/Purchase');

router.post('/verify', async (req, res) => {
  const { transactionId, status } = req.body;

  console.log('=== Verifying Payment ===');
  console.log("Body:", req.body);

  try {
    const purchase = await Purchase.findOne({ transactionId });

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    if (status === 'true') {
      if (purchase.status !== 'Paid') {
        purchase.status = 'Paid';
        await purchase.save();
      }
    } else {
      purchase.status = 'Failed';
      await purchase.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
