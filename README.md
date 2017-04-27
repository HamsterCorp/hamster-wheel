<h1>Hamster Wheel</h1>
This game lets the user play as a jumping hamster to avoid randomly generated obstacles spinning in a wheel. After reaching 200 points, blocks from the opposite direction are generated as well, making the game much more challenging. The hamster is able to jump on or over the blocks safely, but when the hamster hits a block, it's game over. Once that happens, the player's score is appended to a PostgreSQL database, which is used to display the top 10 high scores on the leaderboard. The database stores all the user's usernames, passwords (which are encrypted using bcrypt), and high scores. 

<a href="https://wheelgame.debramaelee.com">Live Demo</a>

<h2>Team Members<h2>

<h2>Team Strategy</h2>
<p>
We used a combination of pair programming and mob programming during this group project. We split in pairs, working on the front end game mechanics and back end server logic. We used mob programming when merging our code to ensure that there were no discrepansies. We relied heavily on GitHub toward the end of the project to make sure that we were all working on the most up to date file versions and that there would be no merge conflicts, which we did not run into.
</p>

<h2>Languages and Technologies Used</h2>
<ul>
<li>JavaScript</li>
<li>jQuery</li>
<li>Node.js</li>
<li>Express</li>
<li>PostgreSQL</li>
<li>Ajax</li>
<li>HTML</li>
<li>CSS</li>
</ul>

<h2>Dependencies and Plugins</h2>
<ul>
<li>express</li>
<li>express-session</li>
<li>bluebird</li>
<li>pg-promise</li>
<li>body-parser</li>
<li>bcrypt</li>
</ul>

<h2>Project Walkthrough</h2>
<h3>Log in / Sign up Page</h3>
<!-- login screen image here -->
<p>
If the user is new to the game, they can create a username and password at the bottom of the screen. This username must be unique, meaning it must not already exist in the database, or else they will be asked to choose another username. This inserts as a new row in the leaderboard database with a name, encrypted password, and a default score of zero. If they have already played before, they can log in at the top of the screen by entering the username and password that was previously established. After creating a login, or logging in, the page redirects to the game screen.
<p>

<h3>Game Screen</h3>
<!-- game screen image here -->
<p>
To play the game, the player can press the space bar or the up arrow key to make the hamster jump and avoid colliding with the randomly generated blocks. Once the player reaches 200 points, blocks begin to generate from the opposite direction. Any direct collision with the blocks will cause the game to end. However, the hamster can jump on top of the blocks as platforms. The goal of the game is to survive as long as possible to achieve a spot on the leaderboard. The longer the player stays alive, the higher the score will be. 
</p>

<h3>Leaderboard</h3>
<!-- leaderboard screen image here -->

The leaderboard displays the highest 10 scores in the database. To display the database, we used the SQL query 
```select username, score from hamster order by score desc limit 10```. Using an AJAX post method, the scores are sent to the database once the GameOver event becomes true. Below is the code snippet from the frontend file.
```
if (gameOver) {
    $.ajax({
            type: 'POST',
            data: {myScore : myScore},
            url: '/endpoint',
            success: function (result) {
              console.log(result);
            },
            failure: function (errMsg) {
                console.log(errMsg);
            }
    });
```
Below is the code snippet from the backend file which is posting the score to the database.
```
app.post('/endpoint', function(req, resp){
    var username = req.session.loggedInUser;
    db.none(`update hamster set score = $1 where username = $2`, [req.body.myScore, username])
    .then(function(){
      resp.send(req.body);
      //
      resp.render('leaderboard.hbs');
    })
    .catch(function(err){
    });
});
```
<h2>Challenges<h2>
<h3>Movement and Gravity</h3>
<h3>Collisions and Platforms</h3>
<h3>Generating Obstacles</h3>
<h3>Posting Scores to the Database</h3>
Although we were able to successfully connect the server to the database, entering the usernames and passwords, we ran into the obstacle of recording the final score and sending it to the database. The scores were being saved as null 


