const User = require("../models/user.js");
module.exports.signupForm = (req, res) => {
    res.render("users/signup.ejs");
}


module.exports.createUser = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            req.flash("success", "Successfully registered, welcome to Wanderlust!");
            res.redirect("/listings");
        });

    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}



module.exports.loginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.loginUser = async (req, res) => {
    req.flash("success", "Welcome to WANDERLUST! you are logged in!!");
    res.redirect(res.locals.redirectURL || "/listings");
}

module.exports.logoutUser = (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.flash("success", "Goodbye! You are logged out now!");
        res.redirect("/listings");
    });
}