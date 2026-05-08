const pool = require('../config/db');
const prisma = require('../config/prisma');
const paymentService = require('../services/payment.service');
const courseService = require('../services/course.service');
const { v4: uuidv4 } = require('uuid');

const payWithTelebirr = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { courseId, phoneNumber } = req.body;
    const { userId } = req.user;

    if (!courseId || !phoneNumber) {
      return res.status(400).json({ message: 'Course ID and phone number are required' });
    }

    // Get student ID
    const [students] = await connection.execute('SELECT id FROM student WHERE "userId" = ?', [userId]);
    if (students.length === 0) {
      return res.status(403).json({ message: 'Only registered students can purchase courses' });
    }
    const studentId = students[0].id;

    // Check if course exists and get pricing
    const course = await courseService.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // If course is actually free, they shouldn't be here, but we can just auto-enroll
    if (course.isFree || (!course.price && !course.discountPrice)) {
      return res.status(400).json({ message: 'This course is free. Please use the standard enrollment button.' });
    }

    // Calculate final amount using centralized service
    const amount = courseService.calculateFinalPrice(course);
    
    if (amount <= 0) {
      return res.status(400).json({ message: 'Invalid course price.' });
    }

    // Check if already actively enrolled
    const [existingEnrollment] = await connection.execute(
      'SELECT id, status FROM enrollment WHERE "studentId" = ? AND "courseId" = ?',
      [studentId, courseId]
    );

    if (existingEnrollment.length > 0 && existingEnrollment[0].status === 'active') {
      return res.status(400).json({ message: 'You are already enrolled in this course.' });
    }

    // Start payment process
    await connection.beginTransaction();

    const transactionReference = `TB-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Create pending payment record
    await connection.execute(
      'INSERT INTO payment ("studentId", "courseId", amount, "transactionReference", status, "paymentMethod", "phoneNumber") VALUES (?, ?, ?, ?, ?, ?, ?)',
      [studentId, courseId, amount, transactionReference, 'pending', 'Telebirr', phoneNumber]
    );

    await connection.commit();

    // Trigger Telebirr USSD API
    const paymentResult = await paymentService.initiateTelebirrUSSD(phoneNumber, amount, transactionReference);

    if (paymentResult.success) {
      // Update payment status
      await connection.execute(
        'UPDATE payment SET status = ? WHERE "transactionReference" = ?',
        ['success', transactionReference]
      );

      // Handle Enrollment
      if (existingEnrollment.length > 0) {
        // e.g. was pending or inactive, make it active
        await connection.execute(
          'UPDATE enrollment SET status = ? WHERE id = ?',
          ['active', existingEnrollment[0].id]
        );
      } else {
        await connection.execute(
          'INSERT INTO enrollment ("studentId", "courseId", "progressPercentage", status) VALUES (?, ?, 0, \'active\')',
          [studentId, courseId]
        );
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Payment completed successfully. Course is now unlocked!',
        transactionReference
      });
    } else {
      // Update payment to failed
      await connection.execute(
        'UPDATE payment SET status = ? WHERE "transactionReference" = ?',
        ['failed', transactionReference]
      );

      return res.status(400).json({ 
        success: false, 
        message: paymentResult.message || 'Payment failed. Please check your Telebirr balance or try again.',
        transactionReference
      });
    }

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Telebirr Payment Error:', error);
    res.status(500).json({ message: 'An error occurred during payment processing', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

const payWithChapa = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { courseId } = req.body;
    const { userId } = req.user;

    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }

    // Get student ID
    const [students] = await connection.execute('SELECT id, "userId" FROM student WHERE "userId" = ?', [userId]);
    if (students.length === 0) {
      return res.status(403).json({ message: 'Only registered students can purchase courses' });
    }
    const student = students[0];

    // Get user details for Chapa
    const [users] = await connection.execute('SELECT email, "fullName" FROM "user" WHERE id = ?', [userId]);
    const userEmail = users[0]?.email || 'student@abritech.com';
    const userFullName = users[0]?.fullName || 'AbriTech Student';
    const firstName = userFullName.split(' ')[0] || 'AbriTech';
    const lastName = userFullName.split(' ')[1] || 'Student';

    // Check if course exists and get pricing using centralized service
    const course = await courseService.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.isFree || (!course.price && !course.discountPrice)) {
      return res.status(400).json({ message: 'This course is free. Please use the standard enrollment button.' });
    }

    // Calculate final amount using centralized service
    const amount = courseService.calculateFinalPrice(course);

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Invalid course price.' });
    }

    const [existingEnrollment] = await connection.execute(
      'SELECT id, status FROM enrollment WHERE "studentId" = ? AND "courseId" = ?',
      [student.id, courseId]
    );

    if (existingEnrollment.length > 0 && existingEnrollment[0].status === 'active') {
      return res.status(400).json({ message: 'You are already enrolled in this course.' });
    }

    // Use purely alphanumeric txRef to avoid any potential Chapa UI issues with hyphens
    const txRef = `CHAPA${Date.now()}${uuidv4().substring(0, 4).toUpperCase()}`;
    const returnUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/verify?tx_ref=${txRef}`;

    // Get user's phone number if available
    const userPhone = users[0]?.phoneNumber || 'N/A';

    await connection.beginTransaction();

    await connection.execute(
      'INSERT INTO payment ("userId", "studentId", "courseId", amount, "transactionId", "transactionReference", status, provider, "paymentMethod", "phoneNumber", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [userId, student.id, courseId, amount, txRef, txRef, 'pending', 'Chapa', 'Chapa', 'N/A']
    );

    await connection.commit();

    const chapaResult = await paymentService.initiateChapaPayment(
      amount,
      'ETB',
      userEmail,
      firstName,
      lastName,
      txRef,
      returnUrl,
      userPhone !== 'N/A' ? userPhone : undefined
    );

    console.log(`[Payment Controller] Initialized Chapa for user ${userId}, course ${courseId}. Amount: ${amount}, Ref: ${txRef}`);

    if (chapaResult.success) {
      return res.status(200).json({
        success: true,
        checkoutUrl: chapaResult.checkoutUrl
      });
    } else {
      await connection.execute(
        'UPDATE payment SET status = ?, "updatedAt" = NOW() WHERE "transactionReference" = ? OR "transactionId" = ?',
        ['failed', txRef, txRef]
      );
      return res.status(400).json({
        success: false,
        message: chapaResult.message
      });
    }
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Chapa Initialization Error:', error);
    res.status(500).json({ message: 'An error occurred during payment processing', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

const verifyChapaTransaction = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { tx_ref } = req.params;

    if (!tx_ref) {
      return res.status(400).json({ message: 'Transaction reference is required' });
    }

    // Check if we already processed this
    const [payments] = await connection.execute(
      'SELECT id, status, "studentId", "courseId" FROM payment WHERE "transactionReference" = ? OR "transactionId" = ?',
      [tx_ref, tx_ref]
    );

    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    const payment = payments[0];

    if (payment.status === 'success') {
      return res.status(200).json({ success: true, message: 'Payment already verified and successful' });
    }

    // Call Chapa API to verify
    const verifyResult = await paymentService.verifyChapaPayment(tx_ref);

    if (verifyResult.success) {
      // Use helper to complete the transaction and enrollment
      await processSuccessfulPayment(connection, tx_ref, payment.studentId, payment.courseId);
      
      console.log(`[Payment] Manually verified success for ref: ${tx_ref}`);
      return res.status(200).json({ success: true, message: 'Payment verified and course unlocked' });
    } else {
      await connection.execute(
        'UPDATE payment SET status = ?, "updatedAt" = NOW() WHERE "transactionReference" = ? OR "transactionId" = ?',
        ['failed', tx_ref, tx_ref]
      );
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    console.error('Chapa Verification Error:', error);
    res.status(500).json({ message: 'An error occurred during verification', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

const chapaWebhook = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const payload = req.body;
    const signature = req.headers['x-chapa-signature'];
    
    // Log the webhook call
    console.log('[Chapa Webhook] Received event:', payload.event, 'for ref:', payload.tx_ref || payload.data?.tx_ref);

    // Verify signature
    if (!paymentService.verifyWebhookSignature(payload, signature)) {
      console.error('[Chapa Webhook] Invalid signature');
      return res.status(401).send('Invalid signature');
    }

    // Basic verification: check if it's a success event
    if (payload.event !== 'charge.success' && payload.status !== 'success') {
      return res.status(200).send('Event ignored'); // Always return 200 to Chapa
    }

    const tx_ref = payload.tx_ref || payload.data?.tx_ref;
    
    if (!tx_ref) {
      return res.status(400).send('Missing transaction reference');
    }

    // Check if we have this payment record
    const [payments] = await connection.execute(
      'SELECT id, status, "studentId", "courseId" FROM payment WHERE "transactionReference" = ? OR "transactionId" = ?',
      [tx_ref, tx_ref]
    );

    if (payments.length === 0) {
      console.warn(`[Chapa Webhook] Payment record not found for ref: ${tx_ref}`);
      return res.status(200).send('Record not found, but acknowledged');
    }

    const payment = payments[0];

    // If already success, just acknowledge
    if (payment.status === 'success') {
      return res.status(200).send('Already processed');
    }

    // Complete the payment and enrollment
    await processSuccessfulPayment(connection, tx_ref, payment.studentId, payment.courseId);

    console.log(`[Chapa Webhook] Successfully processed payment for ref: ${tx_ref}`);
    return res.status(200).send('OK');

  } catch (error) {
    console.error('Chapa Webhook Error:', error);
    // Even on error, we might want to return 200 so Chapa stops retrying if we can't fix it
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    if (connection) connection.release();
  }
};

// Helper function to handle the database updates for a successful payment
const processSuccessfulPayment = async (connection, tx_ref, studentId, courseId) => {
  await connection.beginTransaction();
  try {
    // 1. Update payment record
    await connection.execute(
      'UPDATE payment SET status = ?, "updatedAt" = NOW() WHERE "transactionReference" = ? OR "transactionId" = ?',
      ['success', tx_ref, tx_ref]
    );

    // 2. Handle Enrollment (Check if exists first)
    const [existingEnrollment] = await connection.execute(
      'SELECT id FROM enrollment WHERE "studentId" = ? AND "courseId" = ?',
      [studentId, courseId]
    );

    if (existingEnrollment.length > 0) {
      await connection.execute(
        'UPDATE enrollment SET status = ?, "updatedAt" = NOW() WHERE id = ?',
        ['active', existingEnrollment[0].id]
      );
    } else {
      await connection.execute(
        'INSERT INTO enrollment ("studentId", "courseId", "progressPercentage", status, "updatedAt") VALUES (?, ?, 0, \'active\', NOW())',
        [studentId, courseId]
      );
    }

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  }
};

module.exports = {
  payWithTelebirr,
  payWithChapa,
  verifyChapaTransaction,
  chapaWebhook
};

