const pool = require('../config/db');
const paymentService = require('../services/payment.service');
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
    const [courses] = await connection.execute('SELECT id, price, "isFree", "hasDiscount", "discountPrice" FROM course WHERE id = ?', [courseId]);
    if (courses.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    const course = courses[0];
    
    // If course is actually free, they shouldn't be here, but we can just auto-enroll
    if (course.isFree || (!course.price && !course.discountPrice)) {
      return res.status(400).json({ message: 'This course is free. Please use the standard enrollment button.' });
    }

    // Calculate final amount
    const amount = Number(course.hasDiscount && course.discountPrice ? course.discountPrice : course.price);
    
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

module.exports = {
  payWithTelebirr
};
