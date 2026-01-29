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
        console.log(`[EmailUtils] Attempting to send email to: ${to}`);
        console.log(`[EmailUtils] Using API Key: ${process.env.EMAIL_API_KEY ? 'Present' : 'MISSING'}`);

        const { data, error } = await resend.emails.send({
            from: 'AbriTech LMS <onboarding@resend.dev>',
            to,
            subject,
            text,
            html: html || text,
        });

        if (error) {
            console.error('[EmailUtils] Resend API Error:', JSON.stringify(error, null, 2));
            return false;
        }

        console.log('[EmailUtils] Email sent successfully. ID:', data.id);
        return true;
    } catch (err) {
        console.error('[EmailUtils] Unexpected error during email sending:', err);
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            console.error('[EmailUtils] Hint: This could be a network issue or an incompatible Node.js version for the native fetch API.');
        }
        return false;
    }
};

module.exports = {
    resend,
    sendEmail
};
