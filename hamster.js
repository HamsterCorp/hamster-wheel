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

//This is the try again page
app.get('/tryagain', function(req, resp) {
  resp.render('tryagain.hbs');
});

//This is the try again page
app.get('/leaderboard', function(req, resp, next) {
  db.any('select username, score from hamster order by score desc')
  .then(function(hamsters) {
    resp.render('leaderboard.hbs', {
      hamsters:hamsters
    });
  })
  .catch(next);
});


// Send score to the database
// app.post('/submit_score', function(req, resp) {
//   var score = +req.body.score;
//   var username =   req.body.username;
//
//   console.log(username);
//   db.any(`update hamster set score = $1 where username = $2`, [score, username])
//   .then(function(){
//     resp.redirect('/leaderboard');
//   })
//   .catch(function(err) {
//     console.log(err.message);
//     resp.redirect('/game');
//   })
// });


//Ajax submit score
app.post('/endpoint', function(req, res){
    var username = req.session.loggedInUser;
    console.log('What is username', username);
    db.none(`update hamster set score = $1 where username = $2`, [req.body.myScore, username])
    .then(function(){
      res.send(req.body);
    })
    .catch(function(err){
      console.log(err.message);
    });

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
  var username = req.body.username;
  var password = req.body.password;
  console.log("dfasdfas",username, password);
  db.any(`
    select * from hamster where
    username = $1 and password = $2
  `, [username, password])
    .then(function() {
      console.log("keyur",username);
      req.session.loggedInUser = username;
      console.log('create login screen', req.session.loggedInUser);
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



app.listen(3001, function() {
  console.log('Listening on port 3001.');
});
