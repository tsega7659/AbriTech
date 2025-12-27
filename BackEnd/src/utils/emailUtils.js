import { Resend } from 'resend';

const resend = new Resend(process.env.EMAIL_API_KEY);

export default resend;
