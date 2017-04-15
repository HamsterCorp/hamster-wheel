var myGamePiece;
var gravity = 0.2;
var keys = [];
var myScore;
var blockGroup = []
var gameOver = false;
function startGame() {
    map = new mapObject();
    player = new playerObject()
    //  wi  he   col   x    y    spe  rot  pla.he type
    smallblock1 = new blockObject(30, 30, "yellow", 460, 151, 3.2, 2.2, 435, 0);       //GS2R   HER
    largeblock1 = new blockObject(80, 30, "red", 219, 205, 2.8, 6.9 , 390, 0);   //GS3L  HERE #
    smallblock2 = new blockObject(30, 30, "magenta", 493, 418, 3.2, 10.1, 435, 0);    //GS5R  HERE
    largeblock2 = new blockObject(80, 30, "green", 258, 431, 2.8, 11.6, 390, 0);   //GS6L  HERE

    blockGroup.push(smallblock1, smallblock2, largeblock1, largeblock2)

    myGameArea.start();
    drawScore();
}
var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 700;
        this.canvas.height = 600;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.frameNo = 0;
        this.interval = setInterval(updateGameArea, 10);
    },
    stop : function() {
        clearInterval(this.interval);
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
function drawScore(){
  ctx = myGameArea.context;
  ctx.font = "22px 'Quantico', sans-serif";
  ctx.fillStyle = "black";
  myGameArea.frameNo += .05;
  myScore = Math.round(myGameArea.frameNo)
  ctx.fillText("Score: " + myScore, 300, 550);
}

function mapObject () {
    this.radius = 200;
    this.angle = 0;
    this.x = 350;
    this.y = 300;
    this.updateMap = function() {
        ctx = myGameArea.context;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.setLineDash([15, 20]);
        ctx.beginPath();
        ctx.arc(-(this.x)/360,-(this.y)/360,this.radius,0,2*Math.PI);
        ctx.stroke();
        ctx.restore();
    }
}
function playerObject(){
    this.x = map.x - 12
    this.y = map.y + 169
    this.width = 30
    this.height = 30
    this.speed = 3
    this.velX = 0
    this.velY = 0
    this.jumping = false
    this.updatePlayer = function(){
        ctx = myGameArea.context;
        ctx.save();
        // check keys
        if (keys[38] || keys[32]) {
            // up arrow or space
            if(!this.jumping){  // if player.jumping = false
             this.jumping = true;
             this.velY = -this.speed*2; //Negative so it can be lessened by the gravity, which is a positive number and a fraction
            }
        }
        this.velY += gravity;
        this.y += this.velY;
        if(this.y >= 500 - this.height){
            this.y = 500 - this.height;
            this.jumping = false;
        }
        ctx.fillStyle = '#3582ba';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.crashWith = function(otherobj) {
      var myleft = this.x;
      var myright = this.x + (this.width) + 12;
      var mytop = this.y;
      var mybottom = this.y + (this.height);
      var otherleft = otherobj.x;
      var otherright = otherobj.x + (otherobj.width) - 50;
      var othertop = otherobj.y;
      var otherbottom = otherobj.y + (otherobj.height);
      var crash = true;
      if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
          crash = false;
      }
      //for grounded square blocks
        if (mybottom < othertop && myright > otherleft+10 && myleft < otherright+20){
          if (this.y > otherobj.plat){
            this.jumping = false
            this.y = otherobj.plat
          }
      }
      return crash;
    }
}
// The type "keyup" event happens when the key is released
document.body.addEventListener("keydown", function(e) {
    console.log("DOWN")
    keys[e.keyCode] = true;   // e.keycode will return the ascii code for
});
document.body.addEventListener("keyup", function(e) {
    console.log("UP")
    keys[e.keyCode] = false;
});
  function blockObject(width, height, color, x, y, speed,rotate, plat, type)  {
  this.width = width;
  this.height = height;
  this.color = color;
  this.speed = speed;
  this.angle = rotate;
  this.moveAngle = 1;
  this.x = x;
  this.y = y;
  this.plat = plat;
  this.updateBlock = function() {
      ctx = myGameArea.context;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.fillStyle = color;
      ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
      ctx.restore();
  }
    this.newPos = function() {
    this.angle += this.moveAngle * Math.PI / 180;
    this.x += this.speed * Math.sin(this.angle);
    this.y -= this.speed * Math.cos(this.angle);
    }
}
function updateGameArea() {
  if (player.crashWith(blockGroup[0]) || player.crashWith(blockGroup[1]) || player.crashWith(blockGroup[2]) || player.crashWith(blockGroup[3])){
    myGameArea.stop()
    console.log('GAME OVER');
    gameOver = true;


  }
  else {
    myGameArea.clear();

    if (keys[87]){
      blockGroup[0].newPos();
      blockGroup[0].updateBlock();
    }
    if (keys[65]){

      blockGroup[1].newPos();
      blockGroup[1].updateBlock();
    }
    if (keys[83]){

      blockGroup[2].newPos();
      blockGroup[2].updateBlock();
    }
    if (keys[68]){

      blockGroup[3].newPos();
      blockGroup[3].updateBlock();
    }

    //speed
    map.angle += 0.5 * Math.PI / 180;
    map.updateMap();
    player.updatePlayer();
    drawScore();

  }
  if (gameOver) {
    console.log(myScore);
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
  }
}
