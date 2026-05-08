const axios = require('axios');
const crypto = require('crypto');

const initiateChapaPayment = async (amount, currency, email, firstName, lastName, txRef, returnUrl, phoneNumber) => {
  try {
    const payload = {
      amount: Number(amount).toFixed(2),
      currency,
      email,
      first_name: firstName,
      last_name: lastName,
      tx_ref: txRef,
      return_url: returnUrl,
      customization: {
        title: 'AbriTech',
        description: 'Payment for your chosen course'
      }
    };

    if (phoneNumber) {
      payload.phone_number = phoneNumber;
    }

    const response = await axios.post('https://api.chapa.co/v1/transaction/initialize', payload, {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
      }
    });

    return {
      success: true,
      checkoutUrl: response.data.data.checkout_url
    };
  } catch (error) {
    console.error('[Chapa API] Init Error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to initialize payment with Chapa'
    };
  }
};

const verifyChapaPayment = async (txRef) => {
  try {
    const response = await axios.get(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
      headers: {
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
      }
    });

    if (response.data.status === 'success' && response.data.data.status === 'success') {
      return { success: true, data: response.data.data };
    } else {
      const msg = response.data.data?.status === 'failed' ? 'Payment was declined by the provider' : 'Payment verification failed';
      return { success: false, message: msg };
    }
  } catch (error) {
    console.error('[Chapa API] Verify Error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Error verifying payment'
    };
  }
};

const initiateTelebirrUSSD = async (phoneNumber, amount, transactionRef) => {
  console.log(`[Telebirr Mock API] Triggering USSD push to ${phoneNumber} for ETB ${amount}. Ref: ${transactionRef}`);
  
  // Simulate API delay waiting for user to type PIN on their phone's USSD menu
  return new Promise((resolve) => {
    setTimeout(() => {
      // 90% success rate mock for testing
      if (Math.random() > 0.1) {
        console.log(`[Telebirr Mock API] Payment successful for ref: ${transactionRef}`);
        resolve({ success: true, message: 'Payment successful', transactionRef });
      } else {
        console.log(`[Telebirr Mock API] Payment failed for ref: ${transactionRef}`);
        resolve({ success: false, message: 'Insufficient balance or user cancelled', transactionRef });
      }
    }, 4000); // 4 seconds delay to mock real USSD interaction time
  });
};

const verifyWebhookSignature = (payload, signature) => {
  const secret = process.env.CHAPA_WEBHOOK_SECRET;
  if (!secret) return true; // If no secret configured, skip verification (not recommended for production)

  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return hash === signature;
};

module.exports = {
  initiateTelebirrUSSD,
  initiateChapaPayment,
  verifyChapaPayment,
  verifyWebhookSignature
};
