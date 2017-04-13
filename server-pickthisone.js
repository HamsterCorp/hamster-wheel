const express = require('express');
const Promise = require('bluebird');
const dbConfig = require('./db-config');
const session = require('express-session');
const pgp = require('pg-promise')({
  promiseLib: Promise
});
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
const bcrypt = require('bcrypt');









app.use(express.static('public'));

app.use(session({
  secret: 'topsecret',
  cookie: {
    maxAge: 600000000
  }
}));

app.use(function myMiddleware(request, response, next) {
  console.log(request.method, request.path);
  var contents = request.method + ' ' + request.path + '\n';
  fs.appendFile('log.txt', contents, function(err) {
    next();
  });
});

app.use(bodyParser.urlencoded({ extended: false }));

const db = pgp(dbConfig);


app.use(function(req, resp, next) {
  resp.locals.session = req.session;
  next();
});


//This is where the game page would go
app.get('/game', function(req, resp) {
  resp.render('game.hbs');
});

//This is the landing page
app.get('/', function(req, resp) {
  resp.render('landing_page.hbs');
});

//This is the landing page
app.get('/tryagain', function(req, resp) {
  resp.render('tryagain.hbs');
});

// app.post('/create_login', function(req, resp, next) {
app.post('/create_login', function(req, resp, next) {
  var info = req.body;
  bcrypt.hash(info.password, 10)
    .then(function(encryptedPassword) {
      return db.none(`insert into hamster (username, password) values($1, $2)`, [info.username, encryptedPassword]);
    })
    .then(function(){
      req.session.loggedInUser = info.username;
      resp.redirect('/game');
    })
    // .catch(next);
    .catch(function(err) {
      resp.redirect('/tryagain');
      console.log(err.message);  //user name taken
    });

});

app.post('/submit_login', function(req, resp) {
  var username2 = req.body.username2;
  var password2 = req.body.password2;
  console.log(username2, password2);
  db.any(`
    select * from hamster where
    username = $1 and password = $2
  `, [username2, password2])
    .then(function() {
      req.session.loggedInUser = username2;
      resp.redirect('/game');
    })
    .catch(function(err) {
      resp.redirect('/');
    });
});



app.use(function authentication(req, resp, next) {
  if (req.session.loggedInUser) {
    next();
  } else {
    resp.redirect('/login');
  }
});



app.listen(3000, function() {
  console.log('Listening on port 3000.');
});
