var express = require('express');
var bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
var cors = require('./cors');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
//callback function doesn't required to define the parameters inside it and also the defination of itself
//thats's why we use callback function here
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  
  User.find({}).then((users) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json')
    res.json(users)
}, error => next(error)).catch(error => next(error))
});

router.post('/signup', cors.corsWithOptions,  (req, res, next) => {
  //'local-mongoose' plugin provide some method for signup and login
  //'register' method is example of plugin method
  User.register(new User({username: req.body.username}), req.body.password, (err, user) => { 
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      if(req.body.firstname)
        user.firstname = req.body.firstname;
      if(req.body.lastname)
        user.lastname = req.body.lastname;
      user.save((err, user) => {
        if(err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({err: err}); 
        }
        //here we try to authenticate, user which we already register early
      //we use authenticate() function which come with 'local-mongoose' plugin 
      //and it automatically return  error if authentication failed
      //and if authentication success then next function and parameters follows
        passport.authenticate('local') (req, res, () => {
        //when authentication done 'authenticate()' method add user property inside req message  
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success: true, status: 'Registration Successful!'});
        })         
      });
    }
  });
});
//here username and password include in post req message body instead of authorization header

router.post('/login', cors.corsWithOptions,  passport.authenticate('local'), (req, res) => {

  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

router.get('/logout', cors.corsWithOptions,  (req, res, next) => {
  if(req.session) {
    req.session.destroy()
    res.clearCookie('session-id')
    res.redirect('/')
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
})
module.exports = router;
