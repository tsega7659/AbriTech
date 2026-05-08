const axios = require('axios');
require('dotenv').config();

const testChapa = async () => {
  const CHAPA_SECRET_KEY = 'CHASECK_TEST-Eyjfm9M1vmbcas9eJt28YuKIHqH8SRDy';
  try {
    const response = await axios.post('https://api.chapa.co/v1/transaction/initialize', {
      amount: '0.00',
      currency: 'ETB',
      email: 'student@abritech.com',
      first_name: 'Test',
      last_name: 'User',
      tx_ref: `TEST-${Date.now()}`,
      return_url: 'http://localhost:5173/payment/verify',
      customization: {
        title: 'AbriTech Test',
        description: 'Testing Chapa Integration'
      }
    }, {
      headers: {
        Authorization: `Bearer ${CHAPA_SECRET_KEY}`
      }
    });

    console.log('Chapa Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Chapa Error:', error.response?.data || error.message);
  }
};

testChapa();
