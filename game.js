// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INITIAL_POSITION  = new Point(0, 0); 
var PLAYER_DIRECTION = "right";             // The initial position of the player
var TIME_LEFT = 60;
var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                         // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed
var MONSTER_SIZE = new Size(70, 70);        // The size of a monster
var GAME_INTERVAL = 25;                     // The time interval of running the game
var BULLET_SIZE = new Size(10, 10);         // The size of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet
var SHOOT_INTERVAL = 500.0;                 // The period when shooting is disabled 
var GOOD_THING_SIZE = new Size(50, 50);
var NUMBER_OF_GOOD_THINGS = 8;
var MONSTER_LEVEL = [4, 7, 10];
//
// Variables in the game
//
var timeleft = 0;
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum
var timeleftTimer = null;
var nameShow = null; // The player name tag
var flip = true;                            // A flag indicating the direction of the player
var player = null;                          // The player object
var gameInterval = null;                    // The interval
var zoom = 1.0;                             // The zoom level of the screen
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet
var MonsterCanShoot = true;
var name = "Anonymous";
var current_level = 1;
var lastTime = 0;
var lastTime_disappearing_platform = -1;
var move_direction = 1;
var score = 0;
var current_good_things = 0;
var win = true;
var current_bullet_amount = 0;
var BULLETS = [];
var MONSTER_ATTACKS = [];
var MONSTERS = [];
var shootSound = document.getElementById("shoot");
var backgroundSound = document.getElementById("background_music");
var killSound = document.getElementById("kill");
var loseSound = document.getElementById("lose");
var winSound = document.getElementById("win");

function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}
function getUserName(){
    name = prompt("Enter your player name", name);
    player.name = name;
    if(player.name == '' || player.name == 'null' || player.name == null) {
        player.name = "Anonymous"
    }
    document.getElementById("nameValue").firstChild.data = player.name;
    nameShow = document.createElementNS("http://www.w3.org/2000/svg", "use");
    nameShow.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#name");
    document.getElementById("playerName").appendChild(nameShow);
    nameShow.setAttribute("y", player.position.y - 5);
    nameShow.setAttribute("x", player.position.x + 5);
}

// The player class used in this program
function Player() {
    this.name = name;
    this.node = document.getElementById("player");
    this.position = PLAYER_INITIAL_POSITION;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
}

Player.prototype.isOnPlatform = function() {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.isOnDisappearPlatform = function() {
    var disappearingPlatforms = document.getElementsByClassName("disappear");
    for (var i = 0; i < disappearingPlatforms.length; i++) {
        var node = disappearingPlatforms[i];
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            this.position.y + PLAYER_SIZE.h == y) {
                return i + 1;
        }
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) {
        return true;
    }
    return false;
}

Player.prototype.isOnVerticalPlatform = function() {
    var node = document.getElementById("moving_plat");
    var x = parseFloat(node.getAttribute("x"));
    var y = parseFloat(node.getAttribute("y"));
    var w = parseFloat(node.getAttribute("width"));
    if ((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) && ((this.position.y + PLAYER_SIZE.h) < y + 1)) {
        if (this.position.y < y - PLAYER_SIZE.h - 10) {
            return false;
        }
        this.position.y = y - PLAYER_SIZE.h -1;
        return true;
    } else {
        return false;
    }
}

Player.prototype.collidePlatform = function(position) {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);
        var onVertical = this.isOnVerticalPlatform();
        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h) {
                    position.y = y + h;
                } else {
                    position.y = y - PLAYER_SIZE.h;
                }
                if (onVertical == false) {
                    this.verticalSpeed = 0;
                }
            }
        }
    }
}
Player.prototype.collideScreen = function(position) {
    if (position.x < 0 && ( position.y <= 280 && position.y >= 235 ) || position.y <10 && position.x > 520 ) {
        if (position.y == 280) {
            position.x = 540;
            position.y = 20;
        } else {
            position.x = 5;
            position.y = 280;
        }
    } else {
        if (position.x < 0) {
            position.x = 0;
        }
        if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) {
            position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
        }
        if (position.y < 0) {
            position.y = 0;
            this.verticalSpeed = 0;
        }
        if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
            position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
            this.verticalSpeed = 0;
        }
    }
}
function Monster(i){
    this.node = document.getElementById("monsters").childNodes.item(i);
    this.position = new Point(parseInt(this.node.getAttribute("x")),parseInt(this.node.getAttribute("y")));
    this.displacement = new Point(parseFloat(Math.random()*2),parseFloat(Math.random()*2));
    this.flip = true;
}
Monster.prototype.collideScreen = function(position) {
    if (position.x < 0) {
        position.x = 0;
    }
    if (position.x + MONSTER_SIZE.w > SCREEN_SIZE.w) {
        position.x = SCREEN_SIZE.w - MONSTER_SIZE.w;
    }
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + MONSTER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - MONSTER_SIZE.h;
        this.verticalSpeed = 0;
    }
}
function good_thing_collidePlatform(position){
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);
        if (intersect(position, GOOD_THING_SIZE, pos, size)) {
            return false;
        }
        // prevent good thing to be put at the exit
        if (intersect(position, GOOD_THING_SIZE, new Point(80, 65) , new Size(120, 160))) {
            return false; 
        }
    }
    return true;
}
// Should be executed after the page is loaded
function load() {
    // Attach keyboard events
    document.addEventListener("keydown", keydown, false);
    document.addEventListener("keyup", keyup, false);
}
function count_down() {
    timeleft -= 1;
    document.getElementById("time_remaining").firstChild.data = timeleft;
    time_bar_width = timeleft * 2;
    document.getElementById("time_bar").setAttribute("width", time_bar_width);
    if (timeleft <= 0) {
      loseSound.play();
      win = false;
      end_game();
    }
}
function start_game() {
    current_bullet_amount = 8;
    //CLEAR BULLET DISPLAY
    document.getElementById("playerBullet").firstChild.data = current_bullet_amount;

    current_good_things = 0;
    var names = document.getElementById("playerName");
    for (var i = 0; i < names.childNodes.length; i++) {
        var name = names.childNodes.item(i);
        names.removeChild(name);
    }
    document.getElementById("high_score_table").style.setProperty("visibility", "hidden", null);
    //clear bullets
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        bullets.removeChild(node);
        BULLETS.splice(i, 1);
        i -= 1;
    }
    var monster_attacks = document.getElementById("monster_attacks");
    for (var i = 0; i < monster_attacks.childNodes.length; i++) {
        var node = monster_attacks.childNodes.item(i);
        monster_attacks.removeChild(node);
        MONSTER_ATTACKS.splice(i,1);
        i -= 1;
    }
    BULLETS = [];
    MONSTER_ATTACKS = [];
    MONSTERS = [];
    //clear monsters
    var monsters = document.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        monsters.removeChild(monster);
        i -= 1;
    }
    //claer good things
    var good_things = document.getElementById("good_things");
    for (var i = 0; i < good_things.childNodes.length; i++) {
        var good_thing = good_things.childNodes.item(i);
        good_things.removeChild(good_thing);
        i -= 1;
    }
    //clear the disappearing platform 
    var disappearingPlatforms = document.getElementsByClassName("disappear");
    for (var i = 0; i< disappearingPlatforms.length;i++) {
        disappearingPlatforms[i].remove();
        i -= 1;
    }
    //set the disappearing platform
    var disappearingPlatforms_1 = document.createElementNS("http://www.w3.org/2000/svg","rect");
    disappearingPlatforms_1.setAttribute("x", 180);
    disappearingPlatforms_1.setAttribute("y", 160);
    disappearingPlatforms_1.setAttribute("width", 120);
    disappearingPlatforms_1.setAttribute("height", 20);
    disappearingPlatforms_1.setAttribute("style", "fill: yellow");
    disappearingPlatforms_1.setAttribute("class","disappear");
    disappearingPlatforms_1.setAttribute("opacity", 1);
    platforms.appendChild(disappearingPlatforms_1);
    var disappearingPlatforms_2 = document.createElementNS("http://www.w3.org/2000/svg","rect");
    disappearingPlatforms_2.setAttribute("x", 400);
    disappearingPlatforms_2.setAttribute("y", 240);
    disappearingPlatforms_2.setAttribute("width", 100);
    disappearingPlatforms_2.setAttribute("height", 20);
    disappearingPlatforms_2.setAttribute("style", "fill: yellow");
    disappearingPlatforms_2.setAttribute("class","disappear");
    disappearingPlatforms_2.setAttribute("opacity", 1);
    platforms.appendChild(disappearingPlatforms_2);
    var disappearingPlatforms_3 = document.createElementNS("http://www.w3.org/2000/svg","rect");
    disappearingPlatforms_3.setAttribute("x", 440);
    disappearingPlatforms_3.setAttribute("y", 480);
    disappearingPlatforms_3.setAttribute("width", 70);
    disappearingPlatforms_3.setAttribute("height", 20);
    disappearingPlatforms_3.setAttribute("style", "fill: yellow");
    disappearingPlatforms_3.setAttribute("class","disappear");
    disappearingPlatforms_3.setAttribute("opacity", 1);
    platforms.appendChild(disappearingPlatforms_3);
    // Create the player
    player = new Player();
    if (win == false) {
        current_level = 1;
    }
    if (current_level >= 3) {
        alert("You have passed all the levels. The score and level will be reset to original settings.")
        getUserName();
        current_level = 1;
        score = 0;
        document.getElementById("score").firstChild.data = score;
    }
    else if (current_level == 1) {
        getUserName();
        score = 0;
        document.getElementById("score").firstChild.data = score;
    }
    else{
        alert(`You passed level ${current_level-1}. Prepare for the next level.`)
    }
    //Create good things
    var good_thing_create_counter = 0;
    var points = [];
    while (good_thing_create_counter < NUMBER_OF_GOOD_THINGS) {
        var x = Math.floor(Math.random() * 500) + 40;
        var y = Math.floor(Math.random() * 500) + 40;
        var point = new Point(x,y);
        if(good_thing_collidePlatform(point)){
            points.push(point);
            good_thing_create_counter += 1; 
        }
    }
    for (var i = 0; i < points.length; i++) {
        createGoodThings(points[i].x,points[i].y);
    }
    // Create the monsters
    createMonster(Math.floor(Math.random() * 500) + 40, Math.floor(Math.random() * 500) + 40, true);
    MONSTERS.push(new Monster(0));
    for (var i = 1; i < MONSTER_LEVEL[current_level - 1] + 2; i++) {
        createMonster(Math.floor(Math.random() * 500) + 40, Math.floor(Math.random() * 500) + 40);
        MONSTERS.push(new Monster(i));
    }
    //set Level
    document.getElementById("level").firstChild.data = current_level;
    // Start the game interval
    win = true;
    clearInterval(gameInterval);
    clearInterval(timeleftTimer);
    backgroundSound.play();
    timeleft = TIME_LEFT;
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    timeleftTimer = setInterval("count_down()", 1000);
}
function end_game(){
    backgroundSound.pause();
    backgroundSound.currentTime = 0;
    clearInterval(gameInterval);
    clearInterval(timeleftTimer);
    if (win == false || current_level == 3) {
        //claen the high score table first
        var oldhighscoretable = document.getElementById("high_score_text")
        for (var i = 0; i < oldhighscoretable.childNodes.length; i++) {
            oldhighscoretable.childNodes.item(i).remove();
            i -= 1;
        }
        // Get the high score table from cookies
        var highScoreTable = getHighScoreTable();
        // // Create the new score record
        var record = new ScoreRecord(player.name, score);
        // Insert the new score record
        var position = 0;
        while (position < highScoreTable.length) {
            var curPositionScore = highScoreTable[position].score;
            if (curPositionScore < score)
                break;
            position += 1;
        }
        if (position < 5) {
            highScoreTable.splice(position, 0, record);
            var top_5 = true;
        }
        // Store the new high score table
        setHighScoreTable(highScoreTable);
        // Show the high score table
        showHighScoreTable(highScoreTable, top_5, position );
        return;
    }
    if (win == true) {
        score = score + (current_level - 1)*100 + timeleft*10;
        document.getElementById("score").firstChild.data = score;
    }
    start_game();
}
function createGoodThings(x, y) {
    var good_thing = document.createElementNS("http://www.w3.org/2000/svg", "use");
    good_thing.setAttribute("x", x);
    good_thing.setAttribute("y", y);
    good_thing.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#good_thing");
    document.getElementById("good_things").appendChild(good_thing);
}
//
// This function creates the monsters in the game
//
function createMonster(x, y, can_shoot) {
    var monster = document.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    if (can_shoot) {
        monster.setAttribute("id", "monster_shoot")
    }
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    document.getElementById("monsters").appendChild(monster);
}
//
// This function shoots a bullet from the player
//
function shootBullet(direction) {
    // Disable shooting for a short period of time
    canShoot = false;
    setTimeout("canShoot = true", SHOOT_INTERVAL);
    // Create the bullet using the use node
    var bullet = document.createElementNS("http://www.w3.org/2000/svg", "use");
    bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
    bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    BULLETS.push(direction);
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    document.getElementById("bullets").appendChild(bullet);
}
function Monster_shootBullet(i){
    MonsterCanShoot = false;
    setTimeout("MonsterCanShoot = true", 900);
    var monster = MONSTERS[i];
    var monster_attack = document.createElementNS("http://www.w3.org/2000/svg", "use");
    monster_attack.setAttribute("x", monster.position.x + MONSTER_SIZE.w / 2 - BULLET_SIZE.w / 2);
    monster_attack.setAttribute("y", monster.position.y + MONSTER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    MONSTER_ATTACKS.push(monster.displacement.x);
    monster_attack.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster_attack");
    document.getElementById("monster_attacks").appendChild(monster_attack);
}
//
// This function updates the position of the bullets
//
function moveBullets() {
    // Go through all bullets
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var node = bullets.childNodes.item(i);
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        if (BULLETS[i]=="right") {
            node.setAttribute("x", x + BULLET_SPEED);
        } else if (BULLETS[i]=="left") {
            node.setAttribute("x", x - BULLET_SPEED);
        }
        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < 0) {
            bullets.removeChild(node);
            BULLETS.splice(i, 1);
        }
    }
}
function move_monster_attacks() {
    // Go through all bullets
    var monster_attacks = document.getElementById("monster_attacks");
    for (var i = 0; i < monster_attacks.childNodes.length; i++) {
        var node = monster_attacks.childNodes.item(i);
        // Update the position of the bullet
        var x = parseInt(node.getAttribute("x"));
        if (MONSTER_ATTACKS[i] >= 0) {
            node.setAttribute("x", x + BULLET_SPEED); 
        } else if (MONSTER_ATTACKS[i] < 0) {
            node.setAttribute("x", x - BULLET_SPEED);
        }
        // If the bullet is not inside the screen delete it from the group
        if (x > SCREEN_SIZE.w || x < 0) {
            monster_attacks.removeChild(node);
            MONSTER_ATTACKS.splice(i,1);
            i -= 1;
        }
    }
}
//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();
    switch (keyCode) {
        case "A".charCodeAt(0):
            player.motion = motionType.LEFT;
            PLAYER_DIRECTION = "left";
            break;
        case "D".charCodeAt(0):
            player.motion = motionType.RIGHT;
            PLAYER_DIRECTION = "right";
            break;
        case "W".charCodeAt(0):
            if (player.isOnPlatform() || player.isOnVerticalPlatform()) {
                player.verticalSpeed = JUMP_SPEED+4;
            }
            break;
        case "H".charCodeAt(0): 
            if (canShoot && current_bullet_amount >= 1) {
                shootSound.play();
                shootBullet(PLAYER_DIRECTION);
                current_bullet_amount -= 1;
                document.getElementById("playerBullet").firstChild.data = current_bullet_amount;
            }
			break;
    }
}
//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();
    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;
        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}
//
// This function checks collision
//
function collisionDetection() {
    // Check if the player find the exit
    var exit = document.getElementById("exit")
    var x = parseInt(exit.getAttribute("x"));
    var y = parseInt(exit.getAttribute("y"));
    if (intersect(new Point(x,y),new Size(50, 40),player.position, PLAYER_SIZE)&& current_good_things == NUMBER_OF_GOOD_THINGS) {
        winSound.play();
        alert("You won!");
        if (current_level <= 2){
            current_level += 1;
        }
        end_game();
    }
    // Check whether the player collides with a monster
    var monsters = document.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
            loseSound.play();
            win = false;
            end_game();
        }
    }
    //check whether the player collides with a good_thing
    var good_things = document.getElementById("good_things");
    for (var i = 0; i < good_things.childNodes.length; i++) {
        var good_thing = good_things.childNodes.item(i);
        var x = parseInt(good_thing.getAttribute("x"));
        var y = parseInt(good_thing.getAttribute("y"));

        if (intersect(new Point(x, y), GOOD_THING_SIZE, player.position, PLAYER_SIZE)) {
            score+=10;
            current_good_things++;
            document.getElementById("score").firstChild.data = score;
            good_things.removeChild(good_thing);
            i -= 1;
        }
    }
    var monster_attacks = document.getElementById("monster_attacks");
    for (var i = 0; i< monster_attacks.childNodes.length; i++) {
        var monster_attack = monster_attacks.childNodes.item(i);
        var x = parseInt(monster_attack.getAttribute("x"));
        var y = parseInt(monster_attack.getAttribute("y"));
        if (intersect(new Point(x, y), BULLET_SIZE, player.position, PLAYER_SIZE)) {
            loseSound.play();
            win = false;
            end_game();
        }
    }
    // Check whether a bullet hits a monster
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {
        var bullet = bullets.childNodes.item(i);
        var x = parseInt(bullet.getAttribute("x"));
        var y = parseInt(bullet.getAttribute("y"));

        for (var j = 0; j < monsters.childNodes.length; j++) {
            var monster = monsters.childNodes.item(j);
            var mx = parseInt(monster.getAttribute("x"));
            var my = parseInt(monster.getAttribute("y"));

            if (intersect(new Point(x, y), BULLET_SIZE, new Point(mx, my), MONSTER_SIZE)) {
                killSound.play();
                score+=30;
                document.getElementById("score").firstChild.data = score;
                monsters.removeChild(monster);
                MONSTERS.splice(j,1);
                j -= 1;
                BULLETS.splice(i, 1);
                bullets.removeChild(bullet);
                i -= 1;
            }
        }
    }
}
function switch_direction(node){
    if (node.motion == motionType.LEFT) {
        node.motion == motionType.RIGHT;
    } else if (node.motion == motionType.RIGHT) {
        node.motion == motionType.LEFT;
    }
}
function move_monster(monster){
    var MONS_WIDTH = 40;
    var MONS_HEIGHT = 40;
    var x, y;
    var object = monster.node;
    var width = SCREEN_SIZE.w;
    var height = SCREEN_SIZE.h;

    if (object == null) {
        return;
    }
    x = parseFloat(object.getAttribute("x"));
    if (isNaN(x) == true) {
        x = 0;
    }
    y = parseFloat(object.getAttribute("y"));
    if (isNaN(y) == true) {
        y = 0;
    }
    x += monster.displacement.x;

    if (monster.displacement.x > 0) {
        monster.flip = true;
        object.setAttribute("transform", "translate(" + MONSTER_SIZE.w + ", 0) scale(-1, 1)");
    } else if (monster.displacement.x < 0) {
        monster.flip = false;
    }
    if (x < 0) {
        x = 0;
        monster.displacement.x = -monster.displacement.x;
    }
            
    if (x > width - MONS_WIDTH) {
        x = width - MONS_WIDTH;
        monster.displacement.x = -monster.displacement.x;
    }

    y += monster.displacement.y;
    if (y < 0) {
        y = 0;
        monster.displacement.y = -monster.displacement.y;
    }
                    
    if (y > height - MONS_HEIGHT) {
        y = height - MONS_HEIGHT;
        monster.displacement.y = -monster.displacement.y;
    }
    monster.position.x = x;
    monster.position.y = y;
    object.setAttribute("x", x);
    object.setAttribute("y", y);
    if (monster.flip) {
        object.setAttribute("transform", "translate(" + (monster.position.x*2 + MONSTER_SIZE.w) + "," + 0 + ") scale(-1, 1)");           
    } else {
        object.setAttribute("transform", "scale(1,1)");    
    }
}
function move_platform(move_direction){
    var node = document.getElementById("moving_plat");
    var y = parseFloat(node.getAttribute("y"));
    var h = parseFloat(node.getAttribute("height"));
    var move;
    if (y+h <= 520 && move_direction == 1) {
        move = y+move_direction;
        node.setAttribute("y", `${move}`);
    } else if (y > 100 && move_direction == -1 ) {
        move = y+move_direction;
        node.setAttribute("y", `${move}`);
    } else if (y+h > 520) {
        move_direction = -1;
        node.setAttribute("y", `${520-h}`);
    } else if (y <= 100) {
        move_direction = 1;
        node.setAttribute("y", "101");
    }
    return move_direction;
}
//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    move_direction = move_platform(move_direction);
    var init_position = new Point();
    init_position.x = player.position.x;
    init_position.y = player.position.y;

    // Check collision with platforms and screen
    var vertical_speed = player.verticalSpeed;
    player.collidePlatform(init_position);
    player.position = init_position;

    var isOnDisappearPlatform = player.isOnDisappearPlatform();
    if (isOnDisappearPlatform) {
        var i =isOnDisappearPlatform-1;
        if (lastTime_disappearing_platform == -1) {
            lastTime_disappearing_platform = i;
            lastTime = new Date();
        }
        else if ((Math.floor((new Date() - lastTime)/1000) >= 1 || Math.floor((new Date() - lastTime)/1000) <= 2) && lastTime_disappearing_platform == i) {
            document.getElementsByClassName("disappear")[i].setAttribute("fill-opacity", `${1- ((new Date() - lastTime)/1000)}`);
        } 
        if (Math.floor((new Date() - lastTime)/1000) >= 1 && lastTime_disappearing_platform == i) {
            // get from url
            document.getElementsByClassName("disappear")[i].remove();
            lastTime = 0;
            lastTime_disappearing_platform = -1;
        }
    } else {
        lastTime = 0;
        lastTime_disappearing_platform = -1;
        var disappearingPlatforms = document.getElementsByClassName("disappear");
        for (var i = 0; i < disappearingPlatforms.length; i++) {
            var node = disappearingPlatforms[i];
            node.setAttribute("fill-opacity","1");
        }
    }
    var isOnVerticalPlatform = player.isOnVerticalPlatform();
    collisionDetection();
	
    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT) {   
        flip = true;
        player.node.setAttribute("transform", "translate(" + PLAYER_SIZE.w + ", 0) scale(-1, 1)");
        displacement.x = -MOVE_DISPLACEMENT;
    }
    if (player.motion == motionType.RIGHT) {
        flip = false;
        displacement.x = MOVE_DISPLACEMENT;
    }

    if (isOnVerticalPlatform) {
        if (player.verticalSpeed > 0 ) {
            displacement.y = -player.verticalSpeed;
            player.verticalSpeed -= VERTICAL_DISPLACEMENT;
            if (player.verticalSpeed <= 0) {
                player.verticalSpeed = 0;
            }
        }
    } else {
        // Fall
        if (!isOnPlatform && player.verticalSpeed <= 0) {
            displacement.y = -player.verticalSpeed;
            player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        }
        // Jump
        if (player.verticalSpeed > 0) {
            displacement.y = -player.verticalSpeed;
            player.verticalSpeed -= VERTICAL_DISPLACEMENT;
            if (player.verticalSpeed <= 0) {
                player.verticalSpeed = 0;
            }
        }
    }
    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;
    if (MonsterCanShoot) {
        var monster = document.getElementById("monster_shoot");
        if (monster) {
            Monster_shootBullet(0);
        }
    }
    for(var i = 0; i < MONSTERS.length; i++){
        var monster = MONSTERS[i];
        move_monster(monster);
    }
    move_monster_attacks();
    moveBullets();
    updateScreen();
}
//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
  // Transform the player
    if (!flip) {
        player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");
    }
    else {
        player.node.setAttribute("transform", "translate(" + (player.position.x + PLAYER_SIZE.w) + "," + player.position.y + ") scale(-1, 1)");
    }
    nameShow.setAttribute("y", player.position.y - 5);
    nameShow.setAttribute("x", player.position.x + 5);
}
