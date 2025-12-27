// utils/sendReferralEmail.js
import resend from './emailUtils.js';

export const sendReferralEmail = async (toEmail, subject, plainText, html) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'AbriTech LMS <onboarding@resend.dev>', // Change later when domain verified
      to: toEmail,
      subject: subject,
      text: plainText,   // Plain text fallback
      html: html,        // This is the beautiful version
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