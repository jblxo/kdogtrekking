require('dotenv').config();
var express = require("express"),
app = express(),
mongoose = require("mongoose"),
News = require("./models/news"),
Category = require("./models/category"),
bodyParser = require("body-parser"),
methodOverride = require("method-override"),
expressSanitizer = require("express-sanitizer"),
passport = require("passport"),
localStrategy = require("passport-local"),
passportLocalMongoose = require("passport-local-mongoose"),
User = require('./models/user');

// MONGOOSE CONFIG
mongoose.connect(process.env.DATABASEURL);

// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "Sweet home Alabama",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.moment = require("moment");
    res.locals.currentUser  = req.user;
    next();
 });

// routes

var indexRoutes = require("./routes/index");
var newsRoutes = require("./routes/news");
var adminRoutes = require("./routes/admin");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

app.use("/", indexRoutes);
app.use("/novinky", newsRoutes);
app.use("/admin", adminRoutes);

app.listen(process.env.PORT || 3000, process.env.IP, function() {
    console.log("KDogtrekking has started!");
});