exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendOTP = async (email, otp) => {
    await transporter.sendMail({
        to: email,
        subject: "Your OTP Code",
        html: `<p>Your OTP code is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
    });
};
