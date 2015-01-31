/*********************************************************
 *              Game Object Definition
 *********************************************************/

 /* Constructor
 *
 *
 */
var Game = function() {
    /* List of predefined variables that
     * will be used within Game scope
     *
     * Game general variables
     */
    this.boundaries             = [0, 0, 505, 555]; //game board boundaries, used to keep player within;
    this.activeBoard            = [0, 50, 505, 300]; //active board boundaries - part of the board with enemies paths;
    this.gameScore              = 0;  //total score of player reached the water;
    this.gemsScore              = 0;  //count of gems player collected during the game;
    this.scoreWithNoCollisions  = 0; //water reaches made with no collisions, resets to 0 after each collide;
    this.diffIncreaseScore      = 5; //max score count that triggers game difficulty increase

    this.activeBoardYPaths      = [60, 145, 230]; // Y axis coordinates on active part of the board;

    // Enemy Variables
    this.numEnemies             = 3;  //number of enemies
    this.allEnemies             = []; //array containing  enemy objects instances
    this.enemyPos               = [-50, 50]; //enemy starting x,y position

    this.enemySpeed             = 100; //enemy default speed in px
    this.spdUp                  = 1;  //enemy speed factor - starts from 1 and increases per .3 each time difficulty increases.

    // Player Variables
    this.playerXSpeed           = 100; //player speed on X axis in px
    this.playerYSpeed           = 90;  //player speed on Y axis in px

    //Gems Variables
    this.numGems                = 2;  //number of gems on the board;
    this.allGems                = []; //array containing gem object instances

    //DOM
    this.playersList            = document.getElementById("players").children; //list of available player characters (HTMLCollection of li)
    this.settingInputs          = document.getElementsByTagName("input"); //List of game settings (HTMLCollection of inputs)
}


/* initGame method :
 *  - loads and applies game settings
 *  - assigns event listeners on page elements
 *
 */

Game.prototype.initGame = function() {

    /* Below code is aimed to run through game settings and record initial
     * values to Game properties
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


    /* Bind function on settings radio button click event.
    *  Function is aimed to change game settings according to changed setting;
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

    /* Bind function listening keypress event on  'H', 'h', 'X', 'x' to show/close Help dialog
     *
     */
    document.addEventListener('keypress', function(e) {

        //if H or h key  pressed open show help dialog
        if (e.charCode === 104 || e.charCode === 72) {

            document.getElementById("help").style.visibility = "visible";

         // if X or x key pressed hide help dialog
        } else if (e.charCode === 88 || e.charCode === 120  ) {
            document.getElementById("help").style.visibility = "hidden";
        }

    })

}
/* initPlayer method:
 *  - creates player instance
 *  - implements player movement
 *  - implements player character change
 */
Game.prototype.initPlayer = function() {
    this.player = new Player;

    /* This listens for key presses and sends the keys to your
     * Player.handleInput() method. You don't need to modify this.
     */
    document.addEventListener('keydown', function(e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        Game.player.handleInput(allowedKeys[e.keyCode]);
    });


    /* Function listens for click event on characters and performs main player change
     *
     */
    for (i=0;i<this.playersList.length;i++) {
        this.playersList[i].addEventListener("click"  , function(e) {

            // change player sprite to clicked character
            Game.player.sprite = this.querySelector("img").attributes.src.value;

            // toggle class selected on clicked character
            document.querySelector(".player-selected").className = "";
            this.className = "player-selected";
        });
    }
}


/* initEnemies method:
 *  - creates enemy instances and loads them into allEnemies array.
 *    Cound of enemies is defined in  property numEnemies
 */
Game.prototype.initEnemies = function() {

    //Fill enemies array with enemy instances
    for (i=1; i <=this.numEnemies; i++) {
        this.allEnemies.push(new Enemy);
    }
}


/* initGems method:
 *  - creates gems instances and loads them into allGems array.
 *    Cound of enemies is defined in  property numGems
 */
Game.prototype.initGems = function() {

    //Fill gems array with gem instances;
    for (i=1; i <=this.numGems; i++) {
        this.allGems.push(new Gem);
    }
}


/* update method:
 *  - controls game difficulty growth depending on player score
 *
 */
 Game.prototype.update = function() {
    //check whether user reached water this.scoreWithNoCollisions times , increase game difficulty;
    if (Game.difficultyGrowth === "true") {
        if ( this.scoreWithNoCollisions === this.diffIncreaseScore) {
            //reset counter
            this.scoreWithNoCollisions = 0;
            //increase number of Bugs
            this.numEnemies++;
            //increase speed factor (increases Enemy speed)
            this.spdUp +=0.3;
        }
    }
 }


/* applySettings method:
 *  - changes game in according to chosen settings;
 *
 */
Game.prototype.applySettings = function() {

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

    //re-initialize enemies count
    this.updateEnemiesCount();


    //in case collect gems mode has been enabled, initiate Gems objects
    if (this.collectGems === "true") {
        this.initGems();
    } else { //in case collect gems mode has been disabled, destroy Gems objects
        this.allGems = [];
        this.gemsScore = 0;
        this.updateGemScore();

    }

    //in case difficulty growth mode has been switch off reset game to its inital settings
    if (this.difficultyGrowth === "false") {
        this.scoreWithNoCollisions = 0;
        this.numEnemies = 3;
        this.spdUp = 1;
    }

}

/* updateEnemiesCount method:
 *  - manages enemies instances count ;
 *
 */
Game.prototype.updateEnemiesCount = function() {

    /* Check whether current number of enemies is different from defined number in game settings (numEnemies)
     * if > then remove number of enemies
     * if < then add number of enemies
     */
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

/* checkEnemyBoundaries method:
 *  Checks whether enemy item goes off the edge of the canvas
 *  and if so, returns it to original position.
 *
 */
Game.prototype.checkEnemyBoundaries = function(enemy) {
    if ( enemy.x > this.boundaries[2] ) {
        enemy.reset();
    }
}

/* checkPlayerBoundaries method:
 *  - ensures that player stays within canvas;
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

/* checkReachedWater method:
 *  - controls states when player reaches water;
 *
 * Checks whether player reached the water blocks and if so, returns it to the initial pos. + increases score
 */
Game.prototype.checkReachedWater = function(player) {
   if (player.y === this.boundaries[1]) {
        this.updateScore(1);
        this.scoreWithNoCollisions++;
        player.reset();
    }
}


/* checkCollisions method:
 *  - controls player collisions with enemies and gems
 *
 * isEnemy - boolean value pointing whether obj is enemy
 * isGem  - boolean value pointing whether obj is gem
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


/* updateScore method:
 *  - updates game score
 *
 *
 */
Game.prototype.updateScore = function(delta) {

    //Set score to 0 if it goes to negative
    (this.gameScore + delta < 0 ) ? this.gameScore = 0 : this.gameScore += delta;
    document.getElementById("gamescore").innerHTML = this.gameScore;
}

/* updateGemScore method:
 *  - updates gems score
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

/* Constructor
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

/* render method:
 *  - draws gems on canvas
 *
 *
 */
 Gem.prototype.render = function() {
     ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
 }

/* update method:
 *  - checks collisions;
 *  - re-creates gems in case all were collected;
 *
 */
 Gem.prototype.update = function() {

    Game.checkCollisions(this, false, true);
    //re-draw gems in case all are collected
    if (Game.allGems.length <=0) {
        Game.initGems();
    }
 }

 /* destroy method:
 *  - removes specific gem from the scene;
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
 /* Constructor
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


/*  update method:
 *  Update the enemy's position, required method for game
 *  Parameter: dt, a time delta between ticks
 */
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed*dt*Game.spdUp;

    Game.checkEnemyBoundaries(this);
    Game.checkCollisions(this, true, false);

}

/* render method:
 *
 * Draw the enemy on the screen, required method for game
 *
 */
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}


/* reset method:
 *
 * Reset enemy function
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


/* handleInput method:
 *
 *  - handle key pressed and update player position on canvas
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


/* reset method:
 *
 *  - set player position to initial
 *
 */
Player.prototype.reset = function() {
    this.x = Game.boundaries[2]/2 - this.width/2;
    this.y = Game.boundaries[3] - this.height;
}


/* update method:
 *
 *  - check player goes off boundaries
 *  - check player reaches water
 */
Player.prototype.update = function() {
    Game.checkPlayerBoundaries(this);
    Game.checkReachedWater(this);
}


/* render method:
 *
 *  - re-draw player on canvas
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
Game.initGame();
Game.initPlayer();
Game.initEnemies();

if (Game.collectGems === "true") {
    Game.initGems();
}

/*********************************************************
 *              INIT END
 *********************************************************/

