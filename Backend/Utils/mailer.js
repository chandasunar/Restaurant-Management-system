const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: process.env.MAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    return transporter;
};

const sendVerificationOtpEmail = async ({ email, restaurantName, otp }) => {
    const mailTransporter = getTransporter();

    await mailTransporter.sendMail({
        from: process.env.MAIL_FROM || process.env.MAIL_USER,
        to: email,
        subject: 'Verify your restaurant account',
        text: `Hello ${restaurantName}, your verification OTP is ${otp}. It expires in 10 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 24px;">
                <h2>Restaurant account verification</h2>
                <p>Hello ${restaurantName},</p>
                <p>Your OTP for verifying the restaurant owner account is:</p>
                <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; margin: 18px 0;">
                    ${otp}
                </div>
                <p>This OTP expires in 10 minutes.</p>
            </div>
        `,
    });
};

module.exports = {
    sendVerificationOtpEmail,
};
