const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Admin = require('../models/admins');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken'); 

const config = require('./dbconfig');

passport.use(new LocalStrategy(Admin.authenticate()));
passport.serializeUser(Admin.serializeUser());
passport.deserializeUser(Admin.deserializeUser());

exports.getToken = function(admin) {
    return jwt.sign(admin, config.secretKey,
        {expiresIn: 60 * 60 * 24});
};

let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new LocalStrategy(
    function(username, password, done) {
      Admin.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }
  ));



exports.verifyAdmin = passport.authenticate('jwt', {session: false});