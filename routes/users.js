var express = require('express');
var bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  //'local-mongoose' plugin provide some method for signup and login
  //'register' method is example of plugin method
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => { 
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      //here we try to authenticate, user which we already register early
      //we use authenticate() function which come with 'local-mongoose' plugin 
      //and it automatically return  error if authentication failed
      //and if authentication success then next function and parameters follows
      passport.authenticate('local') (req, res, () => {
      //when authentication done 'authenticate()' method add user property inside req message  
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful!'});
      });
    }
  });
});
//here username and password include in post req message body instead of authorization header
router.post('/login', passport.authenticate('local'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'You are Successfully Logged in!'});
});

router.get('/logout', (req, res) => {
  if(req.session) {
    req.session.destroy(); //destorying the session for particular user
    res.clearCookie('session-id'); // clear cookie for that particular user
    res.redirect('/'); //moving to the homepage
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
})

module.exports = router;
