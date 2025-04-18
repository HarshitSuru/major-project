const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const { authenticate } = require("passport");
const { redirect } = require("express/lib/response");
const passport = require("passport");
const { saveRedirectURL } = require("../middleware.js");
const userController = require("../controllers/user.js");
const user = require("../models/user.js");
//signup
router.route("/signup")
    .get(userController.signupForm)
    .post(wrapAsync(userController.createUser));


router.route("/login")
    .get(userController.loginForm)
    .post(saveRedirectURL, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), wrapAsync(userController.loginUser));

router.get("/logout", userController.logoutUser);

module.exports = router;
