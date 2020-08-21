var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');

//configuring passport with new LocalStrategy
//LocalStrategy use the mongoose plugin method 'authenticate' to authenticate or verifying the user and password
//we can also use here 'authentication function' which we already implement instead of 'authenticate' method
exports.local = passport.use(new LocalStrategy(User.authenticate()));
//To support sessions we need to serialize or deserialize the user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());