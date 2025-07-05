// services/paymobService.js
const axios = require('axios');

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
const INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
const IFRAME_ID = process.env.PAYMOB_IFRAME_ID;

class PaymobService {
  async authenticate() {
    const response = await axios.post('https://accept.paymob.com/api/auth/tokens', {
      api_key: PAYMOB_API_KEY,
    });
    return response.data.token;
  }

  async createOrder(token, course, userId) {
    const response = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
      auth_token: token,
      delivery_needed: false,
      amount_cents: course.price * 100,
      currency: "EGP",
      items: [{
        name: course.title,
        amount_cents: course.price * 100,
        quantity: 1,
      }]
    });

    return response.data;
  }

  async generatePaymentKey(token, orderId, course, user) {
    const response = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
      auth_token: token,
      amount_cents: course.price * 100,
      expiration: 3600,
      order_id: orderId,
      currency: "EGP",
      integration_id: INTEGRATION_ID,
    redirect_url: `http://localhost:3000/en/payment/callback`, 
      billing_data: {
        email: user.email,
        first_name: user.name.split(" ")[0] || user.name,
        last_name: user.name.split(" ")[1] || user.name,
        phone_number: "01000000000",
        apartment: "NA",
        floor: "NA",
        street: "NA",
        building: "NA",
        city: "Cairo",
        country: "EG",
        state: "NA"
      }
    });

    return response.data.token;
  }

  generateIframe(paymentToken) {
    return `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentToken}`;
  }
}

module.exports = new PaymobService();
