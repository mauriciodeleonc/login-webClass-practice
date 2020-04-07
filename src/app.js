const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const session = require('express-session');
const passport = require('passport');

const app = express();

//settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    extname: '.hbs'
}));
app.set('view engine', '.hbs');

//middlewares
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret: 'jiji',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 100000
    }
}));
app.use(passport.initialize());
app.use(passport.session());

//routes
app.use(require('./routes/index'))

//static files
app.use(express.static(path.join(__dirname, 'public')));


module.exports = app;