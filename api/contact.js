// portfolio-backend/api/contact.js
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests allowed' });
    }

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', 
        auth: {
            user: process.env.EMAIL_USER, 
            pass: process.env.EMAIL_PASS, 
        },
    });

    const mailOptions = {
        from: `"${name}" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, 
        replyTo: email,
        subject: `New Portfolio Contact from ${name}`,
        text: `From: ${name} <${email}>\n\nMessage:\n${message}`,
        html: `<p>From: <strong>${name}</strong> <${email}></p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send message.' });
    }
}