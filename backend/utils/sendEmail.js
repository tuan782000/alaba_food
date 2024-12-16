import nodemailer from 'nodemailer';

const sendMail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.MAIL_USER, // Email trong file .env
                pass: process.env.MAIL_PASSWORD // Mật khẩu hoặc App Password từ Gmail
            }
        });

        const mailOptions = {
            from: `"Alaba Food" <${process.env.MAIL_USER}>`, // Địa chỉ email gửi
            to, // Email người nhận
            subject, // Tiêu đề email
            text, // Nội dung email dạng text
            html // Nội dung email dạng HTML
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.response);
        return info;
    } catch (error) {
        console.error('Error sending email: ', error);
        throw error;
    }
};

export default sendMail;
