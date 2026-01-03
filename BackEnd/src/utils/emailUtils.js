const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email transporter verification failed:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

/**
 * Generic function to send email via Nodemailer
 * @param {string} to 
 * @param {string} subject 
 * @param {string} text 
 * @param {string} html 
 */
const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: `"AbriTech LMS" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: html || text, // Fallback to text if html is not provided
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (err) {
        console.error('Failed to send email:', err);
        return false;
    }
};

module.exports = {
    transporter,
    sendEmail
};
