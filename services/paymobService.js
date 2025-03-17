const axios = require('axios');

class PaymobService {
  static paymobBaseUrl = 'https://accept.paymobsolutions.com/api';

  static async getAuthToken() {
    try {
      const response = await axios.post(`${this.paymobBaseUrl}/auth/tokens`, {
        api_key: process.env.PAYMOB_API_KEY,
      });
      return response.data.token;
    } catch (error) {
      throw new Error(`Paymob getAuthToken failed: ${error.response?.data?.error || error.message}`);
    }
  }

  static async createOrder(amount, authToken) {
    try {
      const response = await axios.post(`${this.paymobBaseUrl}/ecommerce/orders`, {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amount * 100, // Convert to cents
        currency: 'EGP',
        merchant_order_id: `${Date.now()}`,
      });
      return response.data.id;
    } catch (error) {
      throw new Error(`Paymob createOrder failed: ${error.response?.data?.error || error.message}`);
    }
  }

  static async getPaymentToken(orderId, authToken, user) {
    try {
      const payload = {
        auth_token: authToken,
        amount_cents: user.amount * 100,
        currency: 'EGP',
        order_id: orderId,
        billing_data: {
          email: user.email || 'test@example.com',
          first_name: user.firstName || user.name.split(' ')[0] || 'N/A',
          last_name: user.lastName || (user.name.split(' ')[1] || 'N/A'),
          phone_number: user.phone || '+20123456789000',
          street: 'N/A',
          city: 'N/A',
          country: 'EG',
          state: 'N/A',
          postal_code: 'N/A',
          building: 'N/A',
          floor: 'N/A',
          apartment: 'N/A',
        },
        integration_id: process.env.PAYMOB_MERCHANT_ID,
      };
      console.log('Paymob payment token request payload:', payload);
      const response = await axios.post(`${this.paymobBaseUrl}/acceptance/payment_keys`, payload);
      console.log('Paymob payment token response:', response.data);
      return response.data.token;
    } catch (error) {
      console.error('Paymob getPaymentToken error:', error.message, error.response?.data);
      throw new Error(`Paymob getPaymentToken failed: ${error.message}${error.response?.data ? ' ' + JSON.stringify(error.response.data) : ''}`);
    }
  }
}

module.exports = PaymobService;