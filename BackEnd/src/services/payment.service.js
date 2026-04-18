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

module.exports = {
  initiateTelebirrUSSD
};
