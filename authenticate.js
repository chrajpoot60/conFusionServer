
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user');
var JwtStrategy = require('passport-jwt').Strategy; //use for strategy in jwt
var ExtractJwt = require('passport-jwt').ExtractJwt; //extract the jwt
var jwt = require('jsonwebtoken'); //used to create sign and verify tokens

var config = require('./config');

//configuring passport with new LocalStrategy
//LocalStrategy use the mongoose plugin method 'authenticate' to authenticate or verifying the user and password
//we can also use here 'authentication function' which we already implement instead of 'authenticate' method
exports.local = passport.use(new LocalStrategy(User.authenticate()));
//To support sessions we need to serialize or deserialize the user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function( user ) {
    //creating a sign token and return it to the client or user
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
}

//configuration for jwtStrategy
var opts = {};
//extracting token from incoming request authHeader
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

//exporting jwtStrategy which is explicity use for token authentication 
//jwtStrategy use as parameter inside authentication function for token authentication
exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        console.log('JWT payload: ', jwt_payload);
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if(err) {
                return done(err, false);
            }
            else if(user) {
                return done (null, user);
            }
            else {
                return done(null, false);
            }
        });
    }));

    //exporting verifyUser which is contain the autheticity of token
    exports.verifyUser = passport.authenticate('jwt', {session: false});

    