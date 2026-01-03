const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.EMAIL_API_KEY);

/**
 * Generic function to send email via Resend
 * @param {string} to 
 * @param {string} subject 
 * @param {string} text 
 * @param {string} html 
 */
const sendEmail = async (to, subject, text, html) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'AbriTech LMS <onboarding@resend.dev>', // Change later when domain verified
            to,
            subject,
            text,
            html: html || text, // Fallback to text if html is not provided
        });

        if (error) {
            console.error('Resend error:', error);
            return false;
        }

        console.log('Email sent successfully:', data.id);
        return true;
    } catch (err) {
        console.error('Failed to send email:', err);
        return false;
    }
};

module.exports = {
    resend,
    sendEmail
};
