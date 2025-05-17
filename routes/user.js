const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectURL } = require("../middleware.js");
const userController = require("../controllers/user.js");
const generateOTP = require("../utils/generateOtp.js");

// Signup routes
router.route("/signup")
    .get(userController.signupForm)
    .post(wrapAsync(userController.createUser));

// Login routes
router.route("/login")
    .get(userController.loginForm)
    .post(
        saveRedirectURL,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true
        }),
        wrapAsync(userController.loginUser)
    );

// Verify OTP route
router
    .route("/otp")
    .get(userController.otpform)
    .post(wrapAsync(userController.verifyOtp));

// Forgot password routes
router.route("/forgot-password")
    .get(userController.forgotPasswordForm)
    .post(wrapAsync(userController.forgotPasswordRequest));

// Reset password routes
router.route("/reset-password/:token")
    .get(wrapAsync(userController.resetPasswordForm))
    .post(wrapAsync(userController.resetPassword));

// Logout route
router.get("/logout", userController.logoutUser);

module.exports = router;