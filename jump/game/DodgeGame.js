//@author Rhys Howell
//No engines. Just code. HTML5 Canvas.

var canvas;
var ctx;

//game is based on these. Scale variable is then multiplied to fit users
var originalWidth = 1000;
var originalHeight = 1000;

//reset to window size
var gameWidth = 1000;
var gameHeight = 1000;

var scale;

var fps = 60;
var lastTime;

var ratio = 1;

//for drawing the floor
var floorSize = 20; //based on orig height

//images
var dogRm = [];
var dogLm = [];
var dogR;
var dogL;

var RIGHT = 1;
var LEFT = 0;

var jumpingOverBlock = false;

var score = 0;
var highScore = 0;
var savedHighScore = 0;
var currentCombo = 0;
var comboEnded = true;
var firstTimeFalling = true;
var doItAgain = false;
var realLife = false;

//position based on bottom of the screen so it's easier for different screen sizes
//Your character!
var pop;
var jumpSpeed = 30 * fps;//was then 25
var playerSpeed = 8 * fps; //it was 8 at fps = 25(40)
var playerFallSpeed = 80 * fps; // was 1
//popXPos , popYPos , popXDir , popYDir , popFacing(0 or 1) , runCount
var dogBase = function () {
    this.xPos = 0;
    this.yPos = 0;

    this.xDir = 0;
    this.yDir = 0;

    this.facing = RIGHT; //1 right 0 left
    this.left = false;
    this.right = false;

    this.runCount = 0;

    this.jump = false;
    this.space = false;

    //square dimensions
    this.width = 30;
};

var blocks = [];
var blockSpeed = 10 * fps;
//var amountOfBlocks;

var currentMaxSize = 100;
var spawnRate = 2;//how many seconds
var spawnChance = 0.5;
var spawnCount = 0;

var keepUpdating;

var block = function() {
    this.xPos = 0;
    this.yPos = 0;

    //direction going, 1 is Left, -1 is Right
    this.direction = 1;

    //square dimensions
    this.height = 80;
    this.width = 36;
    this.colors = [];
}

//half the time returns the val as negative
function getNegative (toNegate) {
    if(Math.random() * 100 > 50)
        return -toNegate;
    else
        return toNegate;
}


function init() {
    canvas = document.getElementById('backgroundCanvas');
    ctx = canvas.getContext('2d');

    gameWidth = window.innerWidth;
    gameHeight = window.innerHeight;

    ctx.canvas.width  = gameWidth;
    ctx.canvas.height = gameHeight;

    scale = gameWidth/originalWidth;
    yScale = gameHeight/originalHeight;

    // local storage highscore
    if (localStorage.getItem("rhysHighScorPLZDONTCHEATOMG")) {
        // there was a highscore! cool...
        highScore = localStorage.getItem("rhysHighScorPLZDONTCHEATOMG");
        savedHighScore = localStorage.getItem("rhysHighScorPLZDONTCHEATOMG");
    }

    console.log("Canvas created, dimensions: " + gameWidth + "x" + gameHeight + " scaling: " + scale);

    lastTime = Date.now();

    loadImages();

    //particles
    parts = [];
    for(i = 0; i < numberOfParts; i++) {
        parts[i] = new part(false, 0,0,0,0, 0);
    }

    resetGame();

    MSGs[0] = new msg(true, "Use arrow keys to control! Space to Jump!", gameWidth/2 - 100, floorSize + pop.width/2,1, "black");

    setTimeout(function() {
        MSGs[1] = new msg(true, "WATCH OUT!!!!", gameWidth - gameWidth/5, floorSize + pop.width/2,1, "black");
        MSGs[2] = new msg(true, "WATCH OUT!!!!", gameWidth/10, floorSize + pop.width/2,1, "black");
    }, 2000);

    //start the game loop
    setInterval(function () { gameLoop() }, 0);
}

function loadImages() {
    //dogs
    dogRm[0] = new Image();
    dogRm[0].src = (("game/pics/DogRm0.png"));
    dogRm[1] = new Image();
    dogRm[1].src = (("game/pics/DogRm1.png"));
    dogLm[0] = new Image();
    dogLm[0].src = (("game/pics/DogLm0.png"));
    dogLm[1] = new Image();
    dogLm[1].src = (("game/pics/DogLm1.png"));
    dogR = new Image();
    dogR.src = (("game/pics/DogR.png"));
    dogL = new Image();
    dogL.src = (("game/pics/DogL.png"));
}

function resetGame() {
    //create dog
    pop = new dogBase();
    pop.xPos = originalWidth/2;
    pop.yPos = originalHeight - pop.width;

    score = 0;
    currentCombo = 0;
    comboEnded = false;
    firstTimeFalling = true;

    jumpingOverBlock = false;

    //block variables
    blockSpeed = 8 * fps;
    currentMaxSize = 100;
    spawnRate = 1;//how many seconds
    spawnChange = 0.5;

    keepUpdating = true;

    MSGs = [];
    for(i = 0; i < numberOfMsg; i++) {
        MSGs[i] = new msg(false, "lol",0,0,1,"white");
    }
}

function gameLoop() {
    var currentTime = Date.now();

    var deltaTime = (currentTime - lastTime)/1000;

    if(deltaTime < 0.2) //dont allow when they come out and into tab for one iteration
        update(deltaTime);

    render();

    lastTime = currentTime;
}

function render() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    drawMSGs(ctx);
    drawPop();
    drawBlocks();
    drawParts(ctx);
    //console.log("DogX: " + pop.xPos + "  -  " + pop.yPos);

    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0, (gameHeight-floorSize), gameWidth, 4);
    ctx.fillRect(0, (gameHeight-floorSize) + 8, gameWidth, 2);
    ctx.fillRect(0, (gameHeight-floorSize) + 14, gameWidth, 1);

    ctx.font="30px Oswald";
    ctx.fillText("HIGHSCORE: "+highScore, 2, 30);
    ctx.fillText("SCORE: "+score, 2, 60);
}

function drawBlocks() {
    for(var i = 0; i < blocks.length; i++) {
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = "rgb(" + blocks[i].colors[0] + "," + blocks[i].colors[1] + ", " + blocks[i].colors[2] + ")";
        ctx.fillRect(blocks[i].xPos * scale, gameHeight - blocks[i].height - floorSize, blocks[i].width, blocks[i].height);
        ctx.globalAlpha = 1;
        //draw inner block design
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = "3";
        ctx.rect(blocks[i].xPos * scale, gameHeight - blocks[i].height - floorSize, blocks[i].width, blocks[i].height);
        //ctx.rect(blocks[i].xPos * scale + 2, gameHeight - blocks[i].height - floorSize + 2, blocks[i].width - 4, blocks[i].height - 1);
        ctx.stroke();
    }
}

function drawPop() {
    var dogImage;
    if (pop.left && pop.yDir == 0) {
        if (pop.runCount <= 7) {
            dogImage = dogLm[0];
        }
        if (pop.runCount > 7) {
            dogImage = dogLm[1];
        }
    }
    else if (pop.right && pop.yDir == 0) {
        if (pop.runCount <= 7) {
            dogImage = dogRm[0];
        }
        if (pop.runCount > 7) {
            dogImage = dogRm[1];
        }
    }
    else {
        if (pop.facing == LEFT)
            dogImage = dogL;
        else if (pop.facing == RIGHT)
            dogImage = dogR;

    }
    //console.log("Yo the dog: " + pop.width +" scaled to: "+ pop.width*scale + " Attempted subtract: " + ((pop.width*scale) - pop.width));
    //console.log("PLZ " + (gameHeight - pop.yPos - ((pop.width*scale) - pop.width)));
    // if(yScale < scale)
    //     ctx.drawImage(dogImage, pop.xPos * scale, gameHeight * (pop.yPos/originalHeight) - ((pop.width*scale) - pop.width) , pop.width * scale, pop.width * scale);
    // else
        ctx.drawImage(dogImage, pop.xPos * scale, gameHeight - pop.yPos, pop.width, pop.width);
}

//call all game updates
function update(delta) {
    if(keepUpdating) {
        checkCollisions();

        updateDogPos(delta);

        updateBlocks(delta);
    }

    updateMSGs(delta);
    updateParts(delta);
}

//dog/block collisions
function checkCollisions() {
    for(var i = 0; i < blocks.length; i++) {
        //x collide
        if((blocks[i].xPos >= pop.xPos && blocks[i].xPos <= pop.xPos + pop.width)
            //|| (blocks[i].xPos >= pop.xPos && blocks[i].xPos <= pop.xPos + pop.width)
            || (blocks[i].xPos <= pop.xPos && blocks[i].xPos + blocks[i].width >= pop.xPos))  {

            //y collide
            if(pop.yPos - pop.width - floorSize < blocks[i].height) {
                //console.log("It's a hit!");
                //blocks.splice(i,1);
                jumpingOverBlock = false;
                killPop();
            }
            else {
                jumpingOverBlock = true;
            }
        }
    }
}

//kill the dog and call the game reset
function killPop() {
    keepUpdating = false;

    if(savedHighScore < highScore) {
        localStorage.setItem("rhysHighScorPLZDONTCHEATOMG", highScore);
    }

    setTimeout( function() {
        //particles for doggy death
        var numberOfPartsToAdd = 50;
        for(k = 0; k < numberOfParts; k++) {
            if(parts[k].alive == false) {
                numberOfPartsToAdd--;
                if(numberOfPartsToAdd == 0)
                    break;
                parts[k] = new part(true,
                    pop.xPos + pop.width/2 + Math.random()*getNegative(pop.width/2),pop.yPos - pop.width/2 + Math.random()*getNegative(pop.width/2),
                    getNegative(Math.random()*maxPartSpeed),
                    -(Math.random()*maxPartSpeed + minPartSpeed),
                    "black");
                parts[k].rotation = Math.random()*359.0;
                parts[k].rotationVelo = getNegative(Math.random()*359.0);

                //console.log("New particle added xv: "+parts[k].xdir + " yv: "+parts[k].ydir);
            }
        }

        pop.xPos = -gameWidth;

        //explode the blocks after a bit
        setTimeout(function() {
            for(var i = 0; i < blocks.length; i++) {
                //particles for block death
                var numberOfPartsToAdd = 30;
                for(k = 0; k < numberOfParts; k++) {
                    if(parts[k].alive == false) {
                        numberOfPartsToAdd--;
                        if(numberOfPartsToAdd == 0)
                            break;
                        parts[k] = new part(true,
                            blocks[i].width/2 + blocks[i].xPos + Math.random()*getNegative(blocks[i].width/2),floorSize + blocks[i].height/2 + blocks[i].yPos + Math.random()*getNegative(blocks[i].height/2),
                            getNegative(Math.random()*maxPartSpeed),
                            -(Math.random()*maxPartSpeed + minPartSpeed),
                            "rgb(" + blocks[i].colors[0] + "," + blocks[i].colors[1] + "," + blocks[i].colors[2] + ")");
                        parts[k].rotation = Math.random()*359.0;
                        parts[k].rotationVelo = getNegative(Math.random()*359.0);

                        //console.log("New particle added xv: "+parts[k].xdir + " yv: "+parts[k].ydir);
                    }
                }
            }

            blocks = [];
        }, 1000);

        //start a new game
        setTimeout(function(){resetGame();},2000);
    }, 500);
}

function updateBlocks(delta) {

    for(var i = 0; i < blocks.length; i++) {
        //console.log("Update with x Pos: " + blocks[i].xPos);

        blocks[i].xPos -= blocks[i].direction*blockSpeed*delta;
        if(blocks[i].direction == 1 && blocks[i].xPos < -blocks[i].width - 5) {
            //particles for block death
            var numberOfPartsToAdd = 25;
            for(k = 0; k < numberOfParts; k++) {
                if(parts[k].alive == false) {
                    numberOfPartsToAdd--;
                    if(numberOfPartsToAdd == 0)
                        break;
                    parts[k] = new part(true,
                        blocks[i].xPos + blocks[i].width,floorSize + blocks[i].yPos - Math.random()*getNegative(blocks[i].height),
                        Math.random()*maxPartSpeed,
                        -(Math.random()*maxPartSpeed + minPartSpeed),
                        "rgb(" + blocks[i].colors[0] + "," + blocks[i].colors[1] + "," + blocks[i].colors[2] + ")");
                    parts[k].rotation = Math.random()*359.0;
                    parts[k].rotationVelo = getNegative(Math.random()*359.0);

                    //console.log("New particle added xv: "+parts[k].xdir + " yv: "+parts[k].ydir);
                }
            }
            blocks.splice(i,1);
        }
        else if(blocks[i].direction == -1 && blocks[i].xPos > originalWidth + 5) {
            //particles for block death
            var numberOfPartsToAdd = 25;
            for(k = 0; k < numberOfParts; k++) {
                if(parts[k].alive == false) {
                    numberOfPartsToAdd--;
                    if(numberOfPartsToAdd == 0)
                        break;
                    parts[k] = new part(true,
                        blocks[i].xPos + blocks[i].width,floorSize + blocks[i].yPos - Math.random()*getNegative(blocks[i].height),
                        -Math.random()*maxPartSpeed,
                        -(Math.random()*maxPartSpeed + minPartSpeed),
                        "rgb(" + blocks[i].colors[0] + "," + blocks[i].colors[1] + "," + blocks[i].colors[2] + ")");
                    parts[k].rotation = Math.random()*359.0;
                    parts[k].rotationVelo = getNegative(Math.random()*359.0);

                    //console.log("New particle added xv: "+parts[k].xdir + " yv: "+parts[k].ydir);
                }
            }
            blocks.splice(i,1);
        }
    }

    //see if new blocks be needed
    spawnCount += delta;
    //console.log(spawnCount+" > "+spawnRate+"  yah  "+delta);
    if(spawnCount > spawnRate) {
        spawnCount = 0;

        if(Math.random() < spawnChance) {
            //console.log("New block!!");

            //Add a new block!!!
            var newBlock = new block();
            if(Math.random()*10 > 5) {
                newBlock.xPos = -newBlock.width - 5;
                newBlock.direction = -1;
            }
            else {
                newBlock.xPos = originalWidth + 5 + newBlock.width;
            }
            newBlock.height = currentMaxSize * (0.3 + (0.7*Math.random()));

            //choose the colors
            var colorChance = Math.random() * 30;
            var r = Math.random()*255;
            var g = Math.random()*255;
            var b = Math.random()*255;
            if(colorChance > 20)
                r = 0;
            else if(colorChance > 10)
                g = 0;
            else
                b = 0;
            newBlock.colors[0] = Math.floor(r);
            newBlock.colors[1] = Math.floor(g);
            newBlock.colors[2] = Math.floor(b);
            //console.log("New color: "+newBlock.colors);
            blocks.unshift(newBlock);


            //adjusting difficulty
            if(currentMaxSize < 400)
                currentMaxSize += 2;

            if(blockSpeed > 1000)
                blockSpeed += 0.5;
            else if(blockSpeed > 500)
                blockSpeed += 2;
            else
                blockSpeed += 4;

            if(spawnRate < 0.5)
                spawnRate -= 0.005;
            else if(spawnRate < 1)
                spawnRate -= 0.02;
            else
                spawnRate -= 0.05;
            //spawnChance += 0.01;
        }
    }
}

function updateDogPos(modifier) {
    pop.yDir = pop.yDir - playerFallSpeed * modifier;

    pop.runCount = pop.runCount + fps * modifier;
    if (pop.runCount >= 14) {
        pop.runCount = 0;
    }

    if (pop.left == true) {
        pop.xDir = -playerSpeed;
    }
    else if (pop.right == true) {
        pop.xDir = playerSpeed;
    }
    else {
        pop.xDir = 0;
    }

    //edge of map
    if (pop.xPos + (pop.xDir * modifier) >= originalWidth - pop.width) {
        pop.xPos = originalWidth - pop.width - 1;
        if (pop.xDir > 0.01)
            pop.xDir = 0;
    }
    if (pop.xPos + (pop.xDir * modifier) <= 0) {
        pop.xPos = 1;
        if (pop.xDir < -0.01)
            pop.xDir = 0;
    }

    //bottom collision
    if (pop.yPos + (pop.yDir * modifier) < floorSize + pop.width) {
        if(pop.space) {
            pop.jump = true;
            pop.yPos = floorSize + pop.width;
            pop.yDir = jumpSpeed;

            //combo
            comboEnded = false;
            if(!jumpingOverBlock) {
                if(currentCombo > 1) {
                    for(k = 0; k < numberOfMsg; k++) {
                        if(MSGs[k].alive == false) {
                            MSGs[k] = new msg(true, "+"+currentCombo + " combo", 120, gameHeight - 120,-1, "black");
                            //"rgb(" + blocks[i].colors[0] + "," + blocks[i].colors[1] + "," + blocks[i].colors[2] + ")"
                            break;
                        }
                    }
                    score += currentCombo;
                    if(highScore < score) {
                        highScore = score;

                    }
                }
                comboEnded = true;
                currentCombo = 0;
            }

        }
        else {
            //combo things
            if(currentCombo > 1) {
                for(k = 0; k < numberOfMsg; k++) {
                    if(MSGs[k].alive == false) {
                        MSGs[k] = new msg(true, "+"+currentCombo + " combo",120, gameHeight - 120,-1, "black");
                        //"rgb(" + blocks[i].colors[0] + "," + blocks[i].colors[1] + "," + blocks[i].colors[2] + ")"
                        break;
                    }
                }
                score += currentCombo;
                if(score > highScore) {
                    highScore = score;
                }
            }
            comboEnded = true;
            currentCombo = 0;

            //stop player from falling
            pop.yDir = 0;
            pop.yPos = floorSize + pop.width;
            pop.jump = false;
        }

        if(jumpingOverBlock && !firstTimeFalling) {
            if(comboEnded == false)
                currentCombo++;

            //message for score
            for(k = 0; k < numberOfMsg; k++) {
                if(MSGs[k].alive == false) {
                    MSGs[k] = new msg(true, "+1", 120, gameHeight - 90,-1, "black");
                    //"rgb(" + blocks[i].colors[0] + "," + blocks[i].colors[1] + "," + blocks[i].colors[2] + ")"
                    break;
                }
            }
            score++;

            jumpingOverBlock = false;
            for(k = 0; k < numberOfMsg; k++) {
                if(MSGs[k].alive == false) {
                    var randomMessage = "Nice Jump!";
                    if(Math.random() < 0.03)
                        randomMessage = "Sweet!";
                    if(Math.random() < 0.03)
                        randomMessage = "Killing it!";
                    if(Math.random() < 0.01)
                        randomMessage = "puppums!";
                    if(Math.random() < 0.01)
                        randomMessage = "Jumping SKILLZZZ";
                    if(Math.random() < 0.03)
                        randomMessage = "Pro Moves!";
                    if(Math.random() < 0.01)
                        randomMessage = "Winning!";
                    if(Math.random() < 0.03)
                        randomMessage = "Do it again!";
                    if(Math.random() < 0.01)
                        randomMessage = "sick.";
                    if(Math.random() < 0.01)
                        randomMessage = "Never seen that b4";
                    if(Math.random() < 0.03)
                        randomMessage = "These blocks are too small!";
                    if(Math.random() < 0.03)
                        randomMessage = "EZ";
                    if(Math.random() < 0.01)
                        randomMessage = "pffff";
                    if(Math.random() < 0.03)
                        randomMessage = "ayyyyy";
                    if(Math.random() < 0.03)
                        randomMessage = "Insert Adjective!";
                    if(Math.random() < 0.03)
                        randomMessage = "Olympian";
                    if(Math.random() < 0.03)
                        randomMessage = "PLZ";
                    if(Math.random() < 0.01)
                        randomMessage = "Not even breaking a sweat";
                    if(Math.random() < 0.01)
                        randomMessage = "Getting tired yet?";
                    if(Math.random() < 0.01)
                        randomMessage = "Your score must be 8 sideways!";
                    if(Math.random() < 0.01)
                        randomMessage = "Athletic!";
                    if(Math.random() < 0.01)
                        randomMessage = "Mad Style.";
                    if(Math.random() < 0.01)
                        randomMessage = "I'm impressed.";
                    if(Math.random() < 0.01)
                        randomMessage = "what?";
                    if(Math.random() < 0.01)
                        randomMessage = "eh?";
                    if(Math.random() < 0.01)
                        randomMessage = "okay...";
                    if(Math.random() < 0.003)
                        randomMessage = "POWER!!!  -Kanye";
                    if(Math.random() < 0.01)
                        randomMessage = "What an athlete.";
                    if(Math.random() < 0.03)
                        randomMessage = "Great jump!";
                    if(Math.random() < 0.03)
                        randomMessage = "Smooth Sailing!";
                    if(Math.random() < 0.005)
                        randomMessage = "KAW! KAW! (You fly like a bird)";
                    if(Math.random() < 0.005)
                        randomMessage = "It's a bird? It's a plane? It's YOU!";
                    if(Math.random() < 0.03)
                        randomMessage = "FANTASTIC";
                    if(Math.random() < 0.03)
                        randomMessage = "INCREDIBLE";
                    if(Math.random() < 0.03)
                        randomMessage = "BREATHTAKING";
                    if(Math.random() < 0.03)
                        randomMessage = "UNBELIEVABLE";
                    if(Math.random() < 0.03)
                        randomMessage = "OH BABY";
                    if(Math.random() < 0.01)
                        randomMessage = "Is this the real life?";
                    if(Math.random() < 0.01)
                        randomMessage = "Stirring";
                    if(Math.random() < 0.01)
                        randomMessage = "YOUNG $$$$";
                    if(Math.random() < 0.01)
                        randomMessage = "Far out";
                    if(Math.random() < 0.03)
                        randomMessage = "Nice Skills!";
                    if(Math.random() < 0.005)
                        randomMessage = "Most dope";
                    if(Math.random() < 0.03)
                        randomMessage = "NOT BAD.";
                    if(Math.random() < 0.03)
                        randomMessage = "do it againnn";
                    if(Math.random() < 0.01)
                        randomMessage = "1-800 FLY JUMPS";
                    if(Math.random() < 0.03)
                        randomMessage = "ON FIRE!!1!";
                    if(Math.random() < 0.03)
                        randomMessage = "UNTOUCHABLE";
                    if(Math.random() < 0.01)
                        randomMessage = "Slick moves";
                    if(Math.random() < 0.03)
                        randomMessage = "You rock!";
                    if(doItAgain) {
                        doItAgain = false;
                        randomMessage = "did it againnn";
                    }
                    if(realLife) {
                        realLife = false;
                        randomMessage = "Is this just fantasy?";
                    }
                    if(randomMessage == "Is this the real life?")
                        realLife = true;
                    if (randomMessage == "do it againnn")
                        doItAgain = true;
                    MSGs[k] = new msg(true, randomMessage, pop.xPos + pop.width/2, pop.yPos - pop.width/2,1, "black");
                    if(currentCombo > 1 && k != numberOfMsg - 1)
                        MSGs[k + 1] = new msg(true, currentCombo + " combo!", pop.xPos + pop.width/2, pop.yPos - pop.width,1, "black");
                    else if(currentCombo > 1 && k == numberOfMsg - 1)
                        MSGs[0] = new msg(true, currentCombo + " combo!", pop.xPos + pop.width/2, pop.yPos - pop.width,1, "black");
                    //"rgb(" + blocks[i].colors[0] + "," + blocks[i].colors[1] + "," + blocks[i].colors[2] + ")"
                    break;
                }
            }
            if(highScore < score) {
                highScore = score;
            }
        }
        else if(firstTimeFalling) {
            firstTimeFalling = false;
        }
    }

    pop.xPos = pop.xPos + (pop.xDir * modifier);
    pop.yPos = pop.yPos + (pop.yDir * modifier);
}

window.addEventListener('keydown', this.keyPressed , false);

function keyPressed(e) {
    //document.getElementById("p1").innerHTML = "New text!";
    var key = e.keyCode;
    e.preventDefault();

    if(key == 37 || key == 65) { //left key
        pop.left = true;
        pop.facing = LEFT;
        pop.right = false;
    }
    if(key == 39 || key == 68) { //right key
        pop.right = true;
        pop.facing = RIGHT;
        pop.left = false;
    }
    if (key == 38 || key == 32) {
        if (pop.jump == false) {
            comboEnded = false;
            pop.jump = true;
            pop.yDir = jumpSpeed;
        }
        pop.space = true;
    }
}

window.addEventListener('keyup', this.keyReleased , false);

function keyReleased(e) {
    var upKey = e.keyCode;
    e.preventDefault();

    if(upKey == 37 || upKey == 65) { //left key
        pop.left = false;
    }
    if(upKey == 39 || upKey == 68) { //right key
        pop.right = false;
    }

    if(upKey == 32 || upKey == 38) {
        pop.space = false;
        //space
    }
}

//touch screen
//they can't move, but they can jump!!!
window.addEventListener('touchstart', this.touchStart, false);

function touchStart() {
    if (pop.jump == false) {
        pop.space = true;
        pop.jump = true;
        pop.yDir = jumpSpeed;
    }
}

window.addEventListener('touchend', this.touchEnd, false);

function touchEnd() {
    pop.space = false;
}
