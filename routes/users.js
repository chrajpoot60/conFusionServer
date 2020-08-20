var express = require('express');
var bodyParser = require('body-parser');
var User = require('../models/user');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then((user) => {
    if(user != null){
      var err = new Error('User '+ req.body.username +' already exists!');
      err.status = 403;
      next(err); 
    }
    else {
      return User.create({
        username: req.body.username,
        password: req.body.password});
    }
  })
      .then((user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({status: 'Registration Successful!', user: user});
      },(err) => next(err))
      .catch((err) => next(err));
})

router.post('/login', (req, res, next) => {
  if(!req.session.user) {
      //extracting authorization header
    var authHeader = req.headers.authorization;
    //checking authHeader is not null
    if(!authHeader) {
      var err = new Error('You are not authenticated:');
      res.setHeader('WWW-Authenticate','Basic');
      err.status = 401;
      return next(err);
    }
    //extracting username and password from authHeader
    var auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

    var username = auth[0];
    var password = auth[1];

    User.findOne({username: username}) //getting information about username from database
    .then((user) => {
      if (user === null) {
        var err = new Error('User ' + username + ' does not exist!');
        err.status = 403;
        return next(err);
      }
      else if(user.password != password){
        var err = new Error('Your password is incorrect');
        err.status = 403;
        return next(err);
      }
      //checking for authentication information
      else if(user.username == username && user.password == password) {
        req.session.user = 'authenticated';
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('You are authenticated');
      }
    },(err) => next(err))
    .catch((err) => next(err));
  }
  //session content the cookie or authenticate 
  else {
    res.statusCode = 200;
    res.setHeader('Content-type', 'text/plain');
    res.end('You are already authenticated');
  }
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
