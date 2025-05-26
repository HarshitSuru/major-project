const User = require("../models/user.js");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { generateOTP, sendOTP } = require("../utils/generateOtp.js");
const otpStore = {}; // temporary store for dev

module.exports.signupForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.createUser = async (req, res) => {
    const { username, email } = req.body;  // **No password here**
    try {
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            if (existingUser.username === username) {
                req.flash("error", "Username is already taken.");
            } else if (existingUser.email === email) {
                req.flash("error", "Email is already registered.");
            } else {
                req.flash("error", "User already exists.");
            }
            return res.redirect("/signup");
        }

        const otp = generateOTP();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        otpStore[email] = {
            otp,
            expiry: otpExpiry,
            userData: { username, email }
        };

        await sendOTP(email, otp);

        req.flash("success", "OTP sent to your email. Please verify and set your password.");
        return res.redirect(`/otp?email=${encodeURIComponent(email)}`);

    } catch (err) {
        console.error(err);
        req.flash("error", "Error while sending OTP.");
        return res.redirect("/signup");
    }
};
module.exports.otpform = (req, res) => {
    const { email } = req.query;
    if (!email) {
        req.flash("error", "Invalid access to OTP verification.");
        return res.redirect("/signup");
    }
    res.render("users/otp", { email, error: null, success: null });
};
module.exports.verifyOtp = async (req, res, next) => {
    const { email, otp, password, confirmPassword } = req.body;

    if (!otpStore[email]) {
        req.flash("error", "OTP expired or invalid. Please signup again.");
        return res.redirect("/signup");
    }

    const record = otpStore[email];

    if (Date.now() > record.expiry) {
        delete otpStore[email];
        req.flash("error", "OTP expired. Please signup again.");
        return res.redirect("/signup");
    }

    if (otp !== record.otp) {
        return res.render("users/otp", { email, error: "Invalid OTP. Try again.", success: null });
    }
    if (!password || !confirmPassword) {
        return res.render("users/otp", { email, error: "Please enter password and confirm password.", success: null });
    }
    if (password !== confirmPassword) {
        return res.render("users/otp", { email, error: "Passwords do not match.", success: null });
    }

    try {
        // Create new user now that OTP is verified and password confirmed
        const newUser = new User(record.userData);
        await User.register(newUser, password);

        delete otpStore[email]; // clear otpStore

        req.login(newUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Welcome! Signup complete.");
            return res.redirect("/listings");
        });

    } catch (err) {
        console.error(err);
        req.flash("error", "Error creating user.");
        res.redirect("/signup");
    }
};



module.exports.loginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.loginUser = async (req, res) => {
    req.flash("success", "Welcome to TripNest! you are logged in!!");
    res.redirect(res.locals.redirectURL || "/listings");
}

module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash("success", "Goodbye! You are logged out now!");
        res.redirect("/listings");
    });
}

module.exports.forgotPasswordForm = (req, res) => {
    res.render("users/forgot-password", { message: null });
};

module.exports.forgotPasswordRequest = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            req.flash("error", "No account with that email address exists.");
            return res.redirect("/forgot-password");
        }

        // Generate token
        const token = crypto.randomBytes(20).toString('hex');

        // Set reset fields
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const resetUrl = `http://${req.headers.host}/reset-password/${token}`;

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset',
            html: `<p>You requested a password reset.</p>
                   <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
                   <p>If you didn't request this, please ignore this email.</p>`
        };

        await transporter.sendMail(mailOptions);

        req.flash("success", `An email has been sent to ${email} with further instructions.`);
        res.redirect("/forgot-password");
    } catch (err) {
        req.flash("error", "Error while sending reset link.");
        res.redirect("/forgot-password");
    }
};

module.exports.resetPasswordForm = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash("error", "Password reset token is invalid or has expired.");
        return res.redirect("/forgot-password");
    }

    res.render("users/reset-password", {
        token: req.params.token,
        message: null
    });
};

module.exports.resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        req.flash("error", "Passwords do not match.");
        return res.redirect(`/reset-password/${token}`);
    }

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash("error", "Password reset token is invalid or has expired.");
            return res.redirect("/forgot-password");
        }

        await user.setPassword(password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        req.flash("success", "Your password has been successfully reset. You can now login with your new password.");
        res.redirect("/login");
    } catch (err) {
        req.flash("error", "Error resetting password.");
        res.redirect(`/reset-password/${token}`);
    }
};