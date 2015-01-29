/*********************************************************
 *              Game Object Definition
 *********************************************************/

 /* Game constructor
 *
 *
 */
var Game = function() {
    // Game general variables
    this.boundaries             = [0, 0, 505, 555]; //canvas boundaries
    this.activeBoard            = [0, 50, 505, 300]; //active board boundaries
    this.gameScore              = 0;  //total score of player reached the water
    this.gemsScore              = 0;  //count of gems collected during the game
    this.scoreWithNoCollisions  = 0; //score made with no collisions
    this.diffIncreaseScore      = 5; //score count that triggers level increase

    this.activeBoardYPaths      = [60, 145, 230]; // Y axis coordinates on active part of the board;

    // Enemy Variables
    this.numEnemies             = 3;  //number of enemies
    this.allEnemies             = []; //array with enemy objects
    this.enemyPos               = [-50, 50]; //enemy initial position x,y

    this.enemySpeed             = 100; //enemy default speed in px
    this.spdUp                  = 1;  //enemy speed factor - should be increased (TODO How ?? )

    // Player Variables
    this.playerXSpeed           = 100; //player step on X axis in px
    this.playerYSpeed           = 90;  //player step on Y axis in px

    //Gems Variables
    this.numGems                = 2; //number of gems on the board;s
    this.allGems                = [];

    //DOM objects
    this.playersList            = document.getElementById("players").children; //list of available player characters (HTMLCollection of li)
    this.settingInputs          = document.getElementsByTagName("input"); //List of game settings (HTMLCollection of inputs)
}



/* Initiate player object and related functions
 *
 *
 */
Game.prototype.initPlayer = function() {
    this.player = new Player;

    // This listens for key presses and sends the keys to your
    // Player.handleInput() method. You don't need to modify this.
    document.addEventListener('keydown', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        Game.player.handleInput(allowedKeys[e.keyCode]);
    });

    //Listens for click on player character and performs main player change
    for (i=0;i<this.playersList.length;i++) {
        this.playersList[i].addEventListener("click"  , function(e) {

            // change player sprite to choosen one
            Game.player.sprite = this.querySelector("img").attributes.src.value;

            // toggle class selected on choosen player
            document.querySelector(".player-selected").className = "";
            this.className = "player-selected";
        });
    }
}


/* Initiate enemies method.
 *
 *
 */
Game.prototype.initEnemies = function() {

    for (i=1; i <=this.numEnemies; i++) {
        this.allEnemies.push(new Enemy);
    }
}


/* Initiate enemies method.
 *
 *
 */
Game.prototype.initGems = function() {

    for (i=1; i <=this.numGems; i++) {
        this.allGems.push(new Gem);
    }
}




/* Initiate game settings method
 *
 *
 */
Game.prototype.initSettings = function() {


    /* Below code is aimed to run through settings inputs and record initial values
     *
     */
    var difficultyInputs = document.getElementsByName("difficulty");
    for (i=0;i<difficultyInputs.length;i++) {
        if (difficultyInputs[i].checked == true) {
            this.gameDifficulty = difficultyInputs[i].value;

        }
    }

    var collectGemsInputs = document.getElementsByName("collect-gems");
    for (i=0;i<collectGemsInputs.length;i++) {
        if (collectGemsInputs[i].checked == true) {
            this.collectGems = collectGemsInputs[i].value;
        }
    }

    var difficultyGrowthInputs = document.getElementsByName("increase-difficulty");
    for (i=0;i<difficultyGrowthInputs.length;i++) {
        if (difficultyGrowthInputs[i].checked == true) {
            this.difficultyGrowth = difficultyGrowthInputs[i].value;
        }
    }

    var soundInputs = document.getElementsByName("sound");
    for (i=0;i<soundInputs.length;i++) {
        if (soundInputs[i].checked == true) {
            this.soundEnabled = soundInputs[i].value;
        }
    }

    /* Bind function on radio button click event
    *  Function is aimed to check game settings depending on radio button clicked
    */
    for (i=0;i<this.settingInputs.length;i++) {
        this.settingInputs[i].addEventListener("click", function(e) {
            switch (this.name)   {
                case "difficulty":
                    Game.gameDifficulty = this.value;
                    break;
                case "collect-gems":
                    Game.collectGems = this.value;
                    break;
                case "increase-difficulty":
                    Game.difficultyGrowth = this.value;
                    break;
                case "sound":
                    Game.sound = this.value;
                    break;
            }
            Game.applySettings();
        });
    }
}

/* Update game
 *
 *
 */
 Game.prototype.update = function() {
    //check whether  user reached water 20 times w/o collisions and decrease speed;
    if (Game.difficultyGrowth === "true") {
        if ( this.scoreWithNoCollisions === this.diffIncreaseScore) {
            this.scoreWithNoCollisions = 0;
            this.numEnemies++;
            this.spdUp +=0.3;
        }
    }
 }


/* Apply settings to game
 *
 *
 */
Game.prototype.applySettings = function() {

    //Apply difficulty level settings
    switch (this.gameDifficulty) {
        case "easy":
            this.numEnemies = 3;
            this.enemySpeed = 100;
            break;
        case "medium":
            this.numEnemies = 4;
            this.enemySpeed = 120;
            break;
        case "hard":
            this.numEnemies = 5;
            this.enemySpeed = 150;
    }
    //re-initialize enemies
    this.updateEnemiesCount();


    //Apply Collect Gems Settings
    if (this.collectGems === "true") {
        this.initGems();
    } else {
        this.allGems = [];
        this.gemsScore = 0;
        this.updateGemScore();

    }

    if (this.difficultyGrowth === "false") {
        this.scoreWithNoCollisions = 0;
        this.numEnemies = 3;
        this.spdUp = 1;
    }

}

/* Increase/Decrease Enemies count depending on Game settings
 *
 *
 */
Game.prototype.updateEnemiesCount = function() {

    var delta = this.numEnemies - this.allEnemies.length;

    if (delta > 0) {
        for (i=1;i<=delta;i++) {
            this.allEnemies.push(new Enemy);
        }
    } else if (delta < 0) {
        for (i=0;i>=delta;i--) {
            this.allEnemies.pop();
        }
    }
}

/* Checks whether enemy item goes off the edge of the canvas
 * and if so, returns it to original position.
 *
 *
 */
Game.prototype.checkEnemyBoundaries = function(enemy) {
    if ( enemy.x > this.boundaries[2] ) {
        enemy.reset();
    }
}

/* Controls whether player pos goes off the canvas
 *
 *
 *
 */
Game.prototype.checkPlayerBoundaries = function(player) {

    if ( player.x < this.boundaries[0] ) {
        player.x = this.boundaries[0]
    } else if ( player.x > this.boundaries[2] - player.width ) {
        player.x = this.boundaries[2] - player.width;
    };

    if ( player.y < this.boundaries[1] ) {
        player.y = this.boundaries[1]
    } else if ( player.y > this.boundaries[3] - player.height ) {
        player.y = this.boundaries[3] - player.height;

    };
}

/* Checks whether player reached the water blocks and if so, returns it to the initial pos. + adding a score
 *
 *
 *
 */
Game.prototype.checkReachedWater = function(player) {
   if (player.y === this.boundaries[1]) {

        this.updateScore(1);
        this.scoreWithNoCollisions++;
        player.reset();
    }
}


/* Checks whether player collides with the enemy items and if so, returns player to initial pos
 *
 *
 *
 */
Game.prototype.checkCollisions = function(obj, isEnemy, isGem) {
    if (Math.abs(this.player.x - obj.x) < this.player.width/2 && Math.abs(this.player.y - obj.y) < 50) {
        if (isEnemy == true) {
            this.scoreWithNoCollisions = 0;
            this.updateScore(-1);
            this.player.reset();
        } else if (isGem == true) {
            console.log("gems collected");
            obj.destroy();
            this.gemsScore += 1;
            this.updateGemScore();
        }

    }
}


/* Update game score
 *
 *
 *
 */
Game.prototype.updateScore = function(delta) {

    //Set score to 0 if it goes to negative
    (this.gameScore + delta < 0 ) ? this.gameScore = 0 : this.gameScore += delta;
    document.getElementById("gamescore").innerHTML = this.gameScore;
}

/* Update gem score
 *
 *
 *
 */
Game.prototype.updateGemScore = function() {
    //Set score to 0 if it goes to negative
    document.getElementById("gemsscore").innerHTML = this.gemsScore;
}

/*********************************************************
 *              Game Object Definition END
 *********************************************************/


/*********************************************************
 *              Gems Object Definition
 *********************************************************/

/* Gem object constructor
 *
 *
 *
 */
 var Gem = function() {
    this.spritesArr = ['images/Gem Blue.png', 'images/Gem Green.png', 'images/Gem Orange.png'];
    this.sprite = this.spritesArr[Math.floor((Math.random()*3))];

    //Should be randomly generated within active board boundaries
    this.x = Math.floor((Math.random()*5))*101;
    this.y = Game.activeBoardYPaths[Math.floor((Math.random()*3))];
 }

/* Gem render method
 *
 *
 *
 */
 Gem.prototype.render = function() {
     ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
 }

/* Gem update method
 *
 *
 *
 */
 Gem.prototype.update = function() {


    Game.checkCollisions(this, false, true);

    //re-draw gems in case all are collected
    if (Game.allGems.length <=0) {
        Game.initGems();
    }

 }

 /* Gem destroy method
 *
 *
 *
 */
 Gem.prototype.destroy = function() {
    var index = Game.allGems.indexOf(this);
    Game.allGems.splice(index, 1);
 }

 /*********************************************************
 *              Gems Object Definition END
 *********************************************************/




/*********************************************************
 *              Enemy Object Definition
 *********************************************************/
 /* Enemy object constructor
 *
 *
 *
 */
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.width  = 101;
    this.height = 171;

    this.x      = Game.enemyPos[0];
    //randomly choose Y from the default paths
    this.y      = Game.activeBoardYPaths[Math.floor(Math.random() * 3)];

    //Give Enemy a random speed (defaul enemy speed multiplied on factor 1-2)
    // spdUp factor is aimed to increase speed during the game
    this.speed  = ((Math.random() * 2 + 1) + Game.enemySpeed);
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
}

/*  Update the enemy's position, required method for game
 *  Parameter: dt, a time delta between ticks
 *
 */
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed*dt*Game.spdUp;

    Game.checkEnemyBoundaries(this);
    Game.checkCollisions(this, true, false);

}

/* Draw the enemy on the screen, required method for game
 *
 *
 *
 */
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}


/* Reset enemy function
 *
 *
 *
 */
Enemy.prototype.reset = function() {
    this.x      = Game.enemyPos[0];
    this.y      = Game.activeBoardYPaths[Math.floor(Math.random() * 3)];
    this.speed  = (Math.random()*2 + 1 )*Game.enemySpeed*Game.spdUp;
}

/*********************************************************
 *              Enemy Object Definition END
 *********************************************************/


/*********************************************************
 *              Player Object Definition
 *********************************************************/

 /* Player object constructor
 *
 *
 *
 */
// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
    this.sprite = 'images/char-boy.png';

    //player size
    this.width  =  101; // So far hardcoded, as resources are not ready : Resources.get(this.sprite).width;
    this.height = 171;  //So far hardcoded, as  resources are not ready : Resources.get(this.sprite).height;

    //player position coords
    this.x = Game.boundaries[2]/2 - this.width/2; //playerPos[0];
    this.y = Game.boundaries[3] - this.height;
}


/* Player handleInput method
 *
 *
 *
 */
Player.prototype.handleInput = function(key) {
    switch (key) {
        case "up" :
            this.y -= Game.playerYSpeed;
            break;
        case "down" :
            this.y += Game.playerYSpeed;
            break;
        case "left" :
            this.x -= Game.playerXSpeed;
            break;
        case "right" :
            this.x += Game.playerXSpeed;
            break;
    }
}


/* Player reset method
 *
 *
 *
 */
Player.prototype.reset = function() {
    this.x = Game.boundaries[2]/2 - this.width/2;
    this.y = Game.boundaries[3] - this.height;
}


/* Player update method
 *
 *
 *
 */
Player.prototype.update = function() {
    Game.checkPlayerBoundaries(this);
    Game.checkReachedWater(this);
}


/* PLayer render method
 *
 *
 *
 */
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}
/*********************************************************
 *              Player Object Definition END
 *********************************************************/




/*********************************************************
 *              INIT
 *********************************************************/
//Init Game
var Game = new Game();
Game.initSettings();
Game.initPlayer();
Game.initEnemies();

if (Game.collectGems === "true") {
    Game.initGems();
}

/*********************************************************
 *              INIT END
 *********************************************************/


/*********************************************************
 *              Utility Functions
 *********************************************************/
clickLocations = [];

function logClicks(x,y) {
  clickLocations.push(
    {
      x: x,
      y: y
    }
  );
  console.log('x location: ' + x + '; y location: ' + y);
}

document.onclick = function(loc) {
  // your code goes here!
  logClicks(loc.layerX, loc.layerY);
};
/*********************************************************
 *              Utility Functions END
 *********************************************************/
