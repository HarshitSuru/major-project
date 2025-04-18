if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const { redirect } = require("express/lib/response.js");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const { wrap } = require("module");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const user = require("./models/user.js");


const listingsRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
const dbUrl = process.env.ATLASDB_URL;


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60,
})

store.on("error", () => {
    console.log("session store error", e);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 7 * 24 * 1000 * 60 * 60,
        httpOnly: true
    }
}




app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/", (req, res) => {
//     res.send("Hi this is root");
// })


app.get("/demoUser", async (req, res) => {
    let fakeUser = new user({
        email: "harshitsuru@gmail.com",
        username: "delta-student"
    })
    let registeredUser = await user.register(fakeUser, "helloworld");
    console.log(registeredUser);

})

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);



main()
    .then(() => console.log("connected to db"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(dbUrl);
}



app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { err });
    // res.status(statusCode).send(message);
})




app.listen(8080, () => {
    console.log(`app is listening on the port ${8080}`);
})

