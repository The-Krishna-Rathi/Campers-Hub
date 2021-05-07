if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./views/utilities/ExpressErrors');
const methodOverride = require('method-override'); //for using put,patch and delete methods in forms
const session = require('express-session'); //middleware for maintaining and security of a user session from login to logout of user
const flash = require('connect-flash'); //npm-middle ware for flash messages
const passport = require('passport'); //npm-middleware for authentication and authorisation
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

//the routers containing routes
const campgroundRoutes = require('./Router/campground');
const reviewRoutes = require('./Router/Review');
const userRoutes = require('./Router/user');

const app = express();

//connecting our expresss application to the moongose
const dbUrl = process.env.Db_Url || 'mongodb://localhost/Yelp-camp';
// 'mongodb://localhost/Yelp-camp'
const secret = process.env.Secret || 'IamSecret'
mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }) //connection to mongoose
    .then(() => console.log('connected with mongoose'))
    .catch(err => console.log('Disconnected , ERROR:', err));



app.set('view engine', 'ejs'); //setting the template rendering engine
app.set('views', path.join(__dirname, 'views')); //to maintain the path of views dir to be asscessed from any where
app.engine('ejs', ejsMate);



app.use(express.urlencoded({ extended: true })); //used for parsing the url specifically for getting form data in req.body
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    ttl: 14 * 24 * 60 * 60 // total time left = 14 days. Default
})

const sessionConfig = {  //configuring our session with essentials
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httponly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),  //mathmatical expression represents 7 days from now
        maxAge: (1000 * 60 * 60 * 24 * 7),
    }
}

app.use(session(sessionConfig));
app.use(flash());
mongoSanitize.sanitize();


app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvdu6rgqt/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

//stuff required for using passport , passport-local and passport-local-mongoose
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//by these two middleware passport will keep track of session of a user(from login to logout)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//This flash middleware should be placed before our routers so that flash defined could be available for templating...
app.use((req, res, next) => {
    res.locals.currentUser = req.user; //now current user would be avilable as req.user in whole app
    res.locals.success = req.flash('success'),
        res.locals.error = req.flash('error'),
        next()
})

//routes from routers
app.use('/campground', campgroundRoutes);
app.use('/campground/:id/reviews', reviewRoutes);
app.use('/user', userRoutes);

app.get('/',(req,res)=>{
    res.render('home');
})

app.all('*', (req, res, next) => {  //404 not found route
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {   //error route
    const { status = 500 } = err;
    if (!err.message) message = 'Oh no, Something Went Wrong';
    res.status(status).render('error', { err });
})

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Serving on the port ${port}`));  //starting the server