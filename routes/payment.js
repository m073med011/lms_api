// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const paymobService = require('../services/paymobService');
const Course = require('../models/Course');
const User = require('../models/User');
const Purchase = require('../models/Purchase');

// POST /api/payment/checkout/:courseId
router.post('/checkout/:courseId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const course = await Course.findById(req.params.courseId);

    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Step 1: Get auth token
    const token = await paymobService.authenticate();

    // Step 2: Create order
    const order = await paymobService.createOrder(token, course, req.user.id);

    // Step 3: Generate payment key
    const paymentToken = await paymobService.generatePaymentKey(token, order.id, course, user);

    // Step 4: Save purchase with Pending status
    await Purchase.create({
      user: req.user.id,
      course: course._id,
      status: 'Pending',
      amount: course.price,
      transactionId: order.id.toString()
    });

    // Step 5: Return iframe link
    const iframeUrl = paymobService.generateIframe(paymentToken);
    res.json({ success: true, iframeUrl });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: 'Checkout failed', error: error.message });
  }
});

module.exports = router;
