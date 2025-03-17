const axios = require('axios');
const Course = require('../models/Course');
const Purchase = require('../models/Purchase');
const User = require('../models/User');

const paymobBaseUrl = 'https://accept.paymobsolutions.com/api';

// Step 1: Authenticate with Paymob
const authenticate = async () => {
  try {
    const response = await axios.post(`${paymobBaseUrl}/auth/tokens`, {
      api_key: process.env.PAYMOB_API_KEY,
    });
    return response.data.token;
  } catch (error) {
    throw new Error('Authentication failed');
  }
};

// Step 2: Register an Order
const registerOrder = async (authToken, amount, courseId) => {
  try {
    const response = await axios.post(`${paymobBaseUrl}/ecommerce/orders`, {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: amount * 100,
      currency: 'EGP',
      merchant_order_id: `${courseId}-${Date.now()}`,
    });
    return response.data.id;
  } catch (error) {
    throw new Error('Order registration failed');
  }
};

// Step 3: Get Payment Key
const getPaymentKey = async (authToken, orderId, amount, user) => {
  try {
    const response = await axios.post(`${paymobBaseUrl}/acceptance/payment_keys`, {
      auth_token: authToken,
      amount_cents: amount * 100,
      currency: 'EGP',
      order_id: orderId,
      billing_data: {
        email: user.email,
        first_name: user.name.split(' ')[0] || 'N/A',
        last_name: user.name.split(' ')[1] || 'N/A',
        phone_number: '+20XXXXXXXXXX',
        street: 'N/A',
        city: 'N/A',
        country: 'EG',
        state: 'N/A',
        postal_code: 'N/A',
      },
      integration_id: process.env.PAYMOB_MERCHANT_ID,
    });
    return response.data.token;
  } catch (error) {
    throw new Error('Payment key generation failed');
  }
};

// Initiate Payment
exports.initiatePayment = async (req, res) => {
  const { courseId } = req.body;
  const user = req.user;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (user.purchasedCourses.includes(courseId)) {
      return res.status(400).json({ message: 'Course already purchased' });
    }

    const amount = course.price;
    const authToken = await authenticate();
    const orderId = await registerOrder(authToken, amount, courseId);
    const paymentKey = await getPaymentKey(authToken, orderId, amount, user);

    const purchase = await Purchase.create({
      user: user._id,
      course: courseId,
      transactionId: orderId,
      amount,
      status: 'Pending',
    });

    res.status(200).json({ paymentKey, purchaseId: purchase._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle Payment Callback
exports.handlePaymentCallback = async (req, res) => {
  console.log('Payment callback received:', req.body);
  const { obj } = req.body;
  const { success, order, amount_cents } = obj;

  try {
    const purchase = await Purchase.findOne({ transactionId: order.id });
    if (!purchase) {
      console.log('Purchase not found for transactionId:', order.id);
      return res.status(404).json({ message: 'Purchase not found' });
    }

    console.log('Found purchase:', purchase._id, 'Current status:', purchase.status);
    if (success) {
      purchase.status = 'Paid';
      await purchase.save();
      console.log('Purchase status updated to Paid:', purchase._id);

      await User.findByIdAndUpdate(purchase.user, {
        $addToSet: { purchasedCourses: purchase.course },
      });
      console.log('User updated with purchased course:', purchase.user);

      await Course.findByIdAndUpdate(purchase.course, {
        $addToSet: { enrolledStudents: purchase.user },
        $push: { purchases: { student: purchase.user, amount: amount_cents / 100 } },
      });
      console.log('Course updated with enrolled student:', purchase.course);
    } else {
      purchase.status = 'Failed';
      await purchase.save();
      console.log('Purchase status updated to Failed:', purchase._id);
    }

    res.status(200).json({ message: 'Callback processed' });
  } catch (error) {
    console.error('Error in payment callback:', error.message);
    res.status(500).json({ message: error.message });
  }
};


exports.checkPurchaseStatus = async (req, res) => {
  const { purchaseId } = req.params;

  try {
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    res.status(200).json({ status: purchase.status });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.confirmPurchase = async (req, res) => {
  const { transactionId, success } = req.body; // Expect transactionId and success from frontend

  try {
    // Find the purchase by transactionId
    const purchase = await Purchase.findOne({ transactionId });
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    if (purchase.status === 'Paid') {
      return res.status(400).json({ message: 'Purchase already confirmed' });
    }

    // Optionally verify with Paymob API (using transactionId)
    // This is an example; replace with actual Paymob verification endpoint if available
    const paymobAuthToken = await axios.post('https://accept.paymobsolutions.com/api/auth/tokens', {
      api_key: process.env.PAYMOB_API_KEY,
    }).then(response => response.data.token);

    const paymobResponse = await axios.get(`https://accept.paymobsolutions.com/api/ecommerce/orders/${transactionId}`, {
      headers: { Authorization: `Bearer ${paymobAuthToken}` },
    });

    if (!paymobResponse.data || paymobResponse.data.payment_status !== 'PAID') {
      return res.status(400).json({ message: 'Payment not confirmed by Paymob' });
    }

    // Update purchase status if Paymob confirms payment
    if (success) {
      purchase.status = 'Paid';
      await purchase.save();

      // Update User and Course documents
      await User.findByIdAndUpdate(purchase.user, {
        $addToSet: { purchasedCourses: purchase.course },
      });

      await Course.findByIdAndUpdate(purchase.course, {
        $addToSet: { enrolledStudents: purchase.user },
        $push: { purchases: { student: purchase.user, amount: purchase.amount } },
      });

      console.log('Purchase confirmed:', purchase._id);
      res.status(200).json({ message: 'Purchase confirmed successfully', purchaseId: purchase._id });
    } else {
      purchase.status = 'Failed';
      await purchase.save();
      res.status(400).json({ message: 'Purchase confirmation failed' });
    }
  } catch (error) {
    console.error('Error confirming purchase:', error.message);
    res.status(500).json({ message: error.message });
  }
};