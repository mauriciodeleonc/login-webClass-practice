const {Router} = require('express');
const router = Router();
const admin = require('firebase-admin');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const serviceAccount = require('../../login-practica-web-firebase-adminsdk-x6ist-bf95dfeaff.json');

passport.serializeUser(function(user, cb){
    cb(null, user);
});
passport.deserializeUser(function(obj, cb){
    cb(null, obj);
});
passport.use(new FacebookStrategy({
    clientID: '606034266647816',
    clientSecret: '0ba28983c1449739a47a85fdb86b7308',
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['email']
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }
));

router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/' }), (req,res) => {
        req.session.user = req.user.emails[0].value;
        res.render('mostrar-usuario', {email: req.user.emails[0].value})
  });
//Fin Facebook

const GoogleStrategy = require('passport-google-oauth20').Strategy;
 
passport.use(new GoogleStrategy({
    clientID: '76475579006-5m0tno0n6c454450q2c2aih55brtdntp.apps.googleusercontent.com',
    clientSecret: 'Im7vlHWc7N9Macffp0Ufu6f3',
    callbackURL: "/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
  }
));

router.get('/auth/google',
  passport.authenticate('google', {
    scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
}));
 
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    req.session.user = req.user.emails[0].value;
    res.render('mostrar-usuario', {email: req.user.emails[0].value})
  });

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://login-practica-web.firebaseio.com',
});

router.get('/', (req,res) => {
    if(req.session.user){
        res.render('mostrar-usuario', {email: req.session.user});
    } else {
        res.render('index'); 
    }
});

router.get('/logout', (req,res) => {
    delete req.session.user;
    res.redirect('/');
});

router.post('/login', (req,res) => {
    admin.auth().getUserByEmail(req.body.correo)
    .then(function(userRecord) {
        req.session.user = req.body.correo;
        res.render('mostrar-usuario', {email: req.body.correo});
    })
    .catch(function(error) {
        res.render('index', {error: true});
    });
});


router.post('/registro', (req,res) => {
    admin.auth().getUserByEmail(req.body.correo)
        .then(function(userRecord) {
            res.render('registro', {error: true});
        })
        .catch(function(error) {
            if(req.body.password !== req.body.passwordValidate ){
                res.render('registro', {error: true});
            } else if(req.body.correo == undefined) { 
                res.render('registro', {error: false});
            } else {
                admin.auth().createUser({
                    email: req.body.correo,
                    password: req.body.password
                }).then(function(userRecord) {
                    req.session.user = req.body.correo;
                    res.render('mostrar-usuario', {email: req.body.correo});
                }).catch(function(error) {});
                //res.render('mostrar-usuario', {email: req.body.correo});
            }
        });
});


module.exports = router;