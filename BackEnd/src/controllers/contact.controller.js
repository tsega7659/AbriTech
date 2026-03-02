const pool = require('../config/db');
const { sendEmail } = require('../utils/emailUtils');

/**
 * Public: Submit a contact form message
 */
const submitMessage = async (req, res) => {
    try {
        const { firstName, lastName, email, message } = req.body;

        if (!firstName || !lastName || !email || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const [result] = await pool.execute(
            'INSERT INTO contactmessage (firstName, lastName, email, message) VALUES (?, ?, ?, ?)',
            [firstName, lastName, email, message]
        );

        res.status(201).json({
            message: 'Your message has been sent successfully. We will get back to you soon!',
            messageId: result.insertId
        });
    } catch (error) {
        console.error('Submit Contact Message Error:', error);
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
};

/**
 * Admin: Get all messages
 */
const getMessages = async (req, res) => {
    try {
        const [messages] = await pool.execute('SELECT * FROM contactmessage ORDER BY createdAt DESC');
        res.json(messages);
    } catch (error) {
        console.error('Get Contact Messages Error:', error);
        res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
    }
};

/**
 * Admin: Update message status (pending/reviewed)
 */
const updateMessageStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'reviewed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        await pool.execute(
            'UPDATE contactmessage SET status = ? WHERE id = ?',
            [status, id]
        );

        res.json({ message: 'Message status updated successfully' });
    } catch (error) {
        console.error('Update Message Status Error:', error);
        res.status(500).json({ message: 'Failed to update status', error: error.message });
    }
};

/**
 * Admin: Reply to a message via email
 */
const replyToMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { replyMessage } = req.body;
        const { userId: adminId } = req.user;

        if (!replyMessage) {
            return res.status(400).json({ message: 'Reply message is required' });
        }

        // Get message detail
        const [messages] = await pool.execute('SELECT * FROM contactmessage WHERE id = ?', [id]);
        if (messages.length === 0) {
            return res.status(404).json({ message: 'Message not found' });
        }
        const message = messages[0];

        // Send email
        const subject = `Reply to your message - AbriTech Solutions`;
        const emailSent = await sendEmail(
            message.email,
            subject,
            replyMessage,
            `<div style="font-family: sans-serif; line-height: 1.6;">
                <p>Hello ${message.firstName},</p>
                <p>Thank you for reaching out to us. Here is our reply to your message:</p>
                <div style="background: #f4f4f4; padding: 15px; border-left: 4px solid #00B4D8; margin: 20px 0;">
                    ${replyMessage.replace(/\n/g, '<br/>')}
                </div>
                <p>Best regards,<br/>AbriTech Solutions Team</p>
            </div>`
        );

        if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send email reply' });
        }

        // Update database
        await pool.execute(
            'UPDATE contactmessage SET status = ?, replyMessage = ?, repliedAt = NOW(), repliedBy = ? WHERE id = ?',
            ['reviewed', replyMessage, adminId, id]
        );

        res.json({ message: 'Reply sent successfully via email' });
    } catch (error) {
        console.error('Reply To Message Error:', error);
        res.status(500).json({ message: 'Failed to send reply', error: error.message });
    }
};

module.exports = {
    submitMessage,
    getMessages,
    updateMessageStatus,
    replyToMessage
};
