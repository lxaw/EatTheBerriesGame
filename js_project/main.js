// Written (with love) by Lex Whalen

class Globals{
    /*
    This class holds all of the globally referenced variables necessary
    For example, references to the canvas or the window width
    Just a container essentially
    */


    constructor(){
        this.canvas = document.getElementById('game__canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas_rect = this.canvas.getBoundingClientRect();
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';

        this.bg = new Image();
        this.bg.src = "https://art.pixilart.com/61f484ce7cee5ad.png";

        this.win_h = $(window).height();
        this.win_w = $(window).width();
        this.MAX_BERRIES = 100;
        // set dims of canvas
    }
    clearListeners(){
        // removes all event listeners
        var cleared = this.canvas.cloneNode(true);
        this.canvas.parentNode.replaceChild(cleared,this.canvas);
    }
}
class Tools{
    /*
    This class is a container for any tools I thought would be useful within other classes.
    */
    getRandomInt(min,max){
        return Math.floor(Math.random() * (max-min + 1) + min);
    }
    getHTMLText(element){
        return element.innerHTML;
    }
    playSND(snd_url){
        var snd = new Audio(snd_url);
        snd.play();
    }
}
class Entity{
    /*
    This class is the parent class of all sprites.
    Contains important drawing functions and position information about the sprites.
    */
    constructor(pos_x,pos_y,width,height,color){
        this.GLOBALS = new Globals();
        this.TOOLS = new Tools();
        this.color = color;
        this.width = width;
        this.height = height;
        this.pos = {X:pos_x,Y:pos_y};
    }
    draw(){
        this.GLOBALS.ctx.beginPath();
        this.GLOBALS.ctx.rect(this.pos.X,this.pos.Y,this.width,this.height);
        this.GLOBALS.ctx.fillStyle = this.color;
        this.GLOBALS.ctx.fill();
    }
    checkCollision(b){
        // a is this, b is block
        if(
            this.pos.X <= b.pos.X + b.width && 
            this.pos.X + this.width >= b.pos.X &&
            this.pos.Y + this.height >= b.pos.Y &&
            this.pos.Y <= b.pos.Y + b.height
        ){
            return true;
        }
    }
    getRandomInt(min,max){
        return this.TOOLS.getRandomInt(min,max);
    }
    update(){
        this.draw();
    }
    // Setters and Getters
    getPos(){
        return this.pos;
    }
    getColor(){
        return this.color;
    }
    getWidth(){
        return this.width;
    }
    getHeight(){
        return this.height
    }
    setPos(x,y){
        this.pos.X = x;
        this.pos.Y = y;
    }

    
}
class Player extends Entity{
    /*
    This is the player, which inherits from Entity.
    Note that I check collisions in the Game class.
    */
    constructor(pos_x,pos_y,width,height,color){
        super(pos_x,pos_y,width,height,color);
        this.U_WB = 200;
        this.L_WB = 10;
    }
    grow(num){
        if(num >0){
            // growing
            if(this.width <= this.U_WB && this.width >= 1){
                this.addWidthHeight(num);
            }
        }
        else{
            var difference = this.width + num;
            if(difference < this.L_WB){
                // cant be smaller than bound
                console.log("adjusting difference")
                difference = this.width - this.L_WB;
                console.log('new difference: ' + difference);
            }
            // shrinking
            this.addWidthHeight(-difference);
        }
    }
    addWidthHeight(a){
        this.width += a;
        this.height += a;
    }
    checkBounds(){
        // To make sure you don't go off of the canvas
        if(this.pos.X < 0)
        {
            this.pos.X = 0;
        }
        if(this.pos.X + (this.width) > this.GLOBALS.canvas.width)
        {
            this.pos.X = this.GLOBALS.canvas.width - this.width;
        }
        if(this.pos.Y < 0)
        {
            this.pos.Y = 0;
        }
        if(this.pos.Y > this.GLOBALS.canvas.height - this.width)
        {
            this.pos.Y = this.GLOBALS.canvas.height - this.width;
        }
    }
    update(){
        this.checkBounds();
        super.update();
    }
}
class Block extends Entity{
    /*
    Block is the parent class of all berries.
    */
    constructor(pos_x,pos_y,width,height,color,dir)
    {
        super(pos_x,pos_y,width,height,color);
        this.dir = dir;
        this.CURRENT_SPEED = 3;
        this.INIT_SPEED = this.CURRENT_SPEED;
        // Point val is the amount of score that will change when the player eats it
        // Similarly, size val is amount of size that changes when player eats it
        this.POINT_VAL = Math.floor((this.width * this.height) / 10)
        this.SIZE_VAL = Math.floor((this.POINT_VAL % 10)+1);

        // to check if it is the first time a block is off screen
        this.OFF_SCREEN_COUNTER = 0;
        this.FIRST_OFF_SCREEN = false;
    }
    checkOffScreen(){
        // this is designed to check if the block is off the screen for the first time
        // first time meaning first after spawn
        // still a bit buggy
        if(this.FIRST_OFF_SCREEN){
            this.OFF_SCREEN_COUNTER +=1;
        }
    }
    move(){
        // wrap around movement
        if(this.pos.X < 0)
        {
            // too far left
            this.pos.X = this.GLOBALS.win_h;
            this.checkOffScreen()
        }
        if(this.pos.X > this.GLOBALS.canvas.width)
        {
            // too far right
            this.pos.X = 0;
            this.checkOffScreen()
        }
        if(this.pos.Y < 0)
        {
            // too far up
            this.pos.Y = this.GLOBALS.canvas.height;
            this.checkOffScreen()
        }
        if(this.pos.Y > this.GLOBALS.canvas.width)
        {
            // too far down
            this.pos.Y =0 ;
            this.checkOffScreen()
        }
        else{
            this.FIRST_OFF_SCREEN = true;
            if(this.dir == "r")
            {
                this.pos.X += this.CURRENT_SPEED;
                
            }else if(this.dir == "l"){
                this.pos.X -= this.CURRENT_SPEED;
            }
            else if(this.dir == "u"){
                this.pos.Y -= this.CURRENT_SPEED;
            }
            else if(this.dir == "d"){
                this.pos.Y += this.CURRENT_SPEED;
            }
        }
    }
    getOffScreenCounter(){
        return this.OFF_SCREEN_COUNTER;
    }
    setDir(dir){
        this.dir = dir;
    }
    setSpeed(speed){
        this.CURRENT_SPEED = speed;
    }
    getInitSpeed(){
        return this.INIT_SPEED;
    }
    getSpeed(){
        return this.SPEED;
    }
    getPointVal(){
        return this.POINT_VAL;
    }
    getSizeVal(){
        return this.SIZE_VAL;
    }
    update(){
        this.move();
        super.update();
    }
}
class PoisonBerry extends Block{
    // PoisonBerries do damage and decrease player size (taste bad!)
    constructor(pos_x,pos_y,width,height,color,dir)
    {
        super(pos_x,pos_y,width,height,'purple');
        this.dir = dir;
        this.SPEED = 3;

        this.POINT_VAL *= 5;
        this.SIZE_VAL *= 5;
    }
}
class RegBerry extends Block{
    // RegBerries make player larger and score increase (tastes good!)
    constructor(pos_x,pos_y,width,height,color,dir)
    {
        super(pos_x,pos_y,width,height,color);
        this.dir = dir;
        this.SPEED = 3;
    }
}
class BlockManager{
    // Manages all berries / blocks
    constructor(block_cnt){
        this.GLOBALS = new Globals();
        this.TOOLS = new Tools();
        this.BLOCK_ARR = [];
        this.DEFAULT_DIR = 'r';
        this.BLOCK_CNT = block_cnt;

        this.MAX_SIZE = 50;
        this.MIN_SIZE = 10;

        this.DIRS = ["r","l","u","d"];
        this.DIR_INDEX = 0;
        this.CURRENT_DIR = this.DIRS[this.DIR_INDEX];
        // Berry Colors:
        this.COLORS = ['yellow','green','blue','red']
    }
    init()
    {
        this.addRegBerry(this.BLOCK_CNT);
    }
    getArrLen(){
        return this.BLOCK_ARR.length;
    }
    getRandomColor(){
        return this.COLORS[this.TOOLS.getRandomInt(0,this.COLORS.length-1)];
    }
    getSpawnPos(){
        // x just needs to be away from screen
        var x = -100;
        var y = this.TOOLS.getRandomInt(0,this.GLOBALS.win_h);

        return [x,y];
    }
    addRegBerry(num_berries){
        for(let i=0;i<num_berries;i++)
        {
            var size = this.TOOLS.getRandomInt(this.MIN_SIZE,this.MAX_SIZE);
            var [x,y] = this.getSpawnPos();
            this.BLOCK_ARR.push(new RegBerry(x,y,size,size,
                this.getRandomColor(),this.DEFAULT_DIR));
        }
    }
    addPoisonBerry(num_berries){
        for(let i=0;i<num_berries;i++)
        {
            var size = this.TOOLS.getRandomInt(this.MIN_SIZE,this.MAX_SIZE);
            var x_coord = this.TOOLS.getRandomInt(0,this.GLOBALS.canvas.width);
            var y_coord = this.TOOLS.getRandomInt(0,this.GLOBALS.canvas.height);
            this.BLOCK_ARR.push(new PoisonBerry(x_coord,y_coord,size,size,
                this.getRandomColor(),this.DEFAULT_DIR));
        }
    }
    resetBlocks(){
        this.BLOCK_ARR = [];
        this.addRegBerry(this.BLOCK_CNT);
    }
    stopMotion(){
        this.BLOCK_ARR.forEach((b) =>{
            b.setSpeed(0);
        })
    }
    startMotion(){
        this.BLOCK_ARR.forEach((b) =>{
            b.setSpeed(b.getInitSpeed());
        })
    }
    shiftDirIndex(){
        if(this.DIR_INDEX == this.DIRS.length)
        {
            this.DIR_INDEX = 0;
        }
        this.CURRENT_DIR = this.DIRS[this.DIR_INDEX];
        this.DIR_INDEX +=1;
    }
    changeBlockDir(){
        this.shiftDirIndex();
        this.BLOCK_ARR.forEach((b) =>
        {
            b.setDir(this.CURRENT_DIR);
        });
    }
    setBlockCount(num){
        this.BLOCK_CNT = num;
    }
    update(){
        this.BLOCK_ARR.forEach((b)=>{

            if(b.getOffScreenCounter() > 1){
                // second time off screen, kill
                var type_berry = b.constructor.name;

                var index = this.BLOCK_ARR.indexOf(b);
                this.BLOCK_ARR.splice(index,1);

                if(this.BLOCK_ARR.length < 1){
                    if(type_berry == "RegBerry"){
                        this.addRegBerry(1);
                    }else{
                        this.addPoisonBerry(1);
                    }
                }
            }
            b.update();
        });
        
    }
}
class Screens{
    /*
    Manages intro and exit screens
    */
    constructor(){
        this.GLOBALS = new Globals();
        this.TOOLS = new Tools();
        // Need to init font or it looks goofy
        this.FONT = "bold 50px Courier";
        this.GLOBALS.ctx.font = this.FONT;
        this.INTRO_SND = "../resources/audio/intro_snd.mp3";
        this.WAIT_TIME = 3000;
    }
    pauseScreen(){
        this.GLOBALS.ctx.fillText("Paused",this.GLOBALS.canvas.width/2,
        this.GLOBALS.canvas.height/2);
    }
    introScreen(){
        this.GLOBALS.ctx.fillText("Yummy Berries!",this.GLOBALS.canvas.width/2,
        this.GLOBALS.canvas.height/2);
    }
    fitTextScreen(textArr,x,y,line_h){
        for(var i=0; i<textArr.length;i++){
            this.GLOBALS.ctx.fillText(textArr[i],x,y+(i*line_h));
        }
    }
    endGameScreen(score, p_berries,y_berries,berries){
        this.GLOBALS.ctx.font = "bold 30px Courier";
        var text = "Your Stats: \nScore: " + score + "\nYummy Berries: " + y_berries +"\nPoison Berries: " + p_berries + "\nTotal Berries: " + berries;
        
        var textArr = text.split('\n');
        var x = this.GLOBALS.canvas.width/2;
        var y = (this.GLOBALS.canvas.height/2) - 100;

        this.fitTextScreen(textArr,x,y,50);
    }
    runIntro(){
        this.TOOLS.playSND(this.INTRO_SND);
        this.introScreen();
    }
    clearScreen(){
        this.GLOBALS.ctx.clearRect(0,0,this.GLOBALS.canvas.width,this.GLOBALS.canvas.height);
    }
}
class Game{
    // is the main game class
    constructor(){
        this.GLOBALS = new Globals();
        this.BLOCK_MANAGER = new BlockManager(5);
        this.TOOLS = new Tools();
        this.SCREENS = new Screens();


        this.START_SIZE = 30;
        this.PLAYER = new Player(this.GLOBALS.canvas.width /2,
            this.GLOBALS.canvas.height /2,this.START_SIZE,this.START_SIZE,'black');

        // The intervals for timing

        this.SCORE = 0;
        this.P_BERRIES_ATE = 0;
        this.Y_BERRIES_ATE = 0;
        this.BERRIES_ATE = 0;
        this.P_BERRY_PROB = 20;

        this.HTML__SCORE = document.getElementById('game__score');
        this.HTML__P_BERRIES_ATE = document.getElementById("player__stats__p-berries");
        this.HTML__Y_BERRIES_ATE = document.getElementById("player__stats__y-berries");
        this.HTML__BERRIES_ATE = document.getElementById("player__stats__berries");

        // HTML Text:
        this.HTML__SCORE_TXT = this.TOOLS.getHTMLText(this.HTML__SCORE);
        this.HTML__P_BERRIES_TXT = this.TOOLS.getHTMLText(this.HTML__P_BERRIES_ATE);
        this.HTML__Y_BERRIES_TXT = this.TOOLS.getHTMLText(this.HTML__Y_BERRIES_ATE);
        this.HTML__BERRIES_TXT = this.TOOLS.getHTMLText(this.HTML__BERRIES_ATE);
        
        this.GAME_RUNNING = false;
        this.IS_PAUSED = false;

        // Sounds:
        this.PAIN_01 = "../resources/audio/pain_01.mp3";
        this.PAIN_02 = "../resources/audio/pain_02.mp3";
        this.MUNCH_01 = "../resources/audio/munch_01.mp3";

        // Play main theme song
        this.THEME_SONG = document.getElementById("game__theme-song");
        this.THEME_SONG.loop = true;


        // Event listener for moving player
        this.GLOBALS.canvas.addEventListener("mousemove",(e)=>{
            if(this.GAME_RUNNING){
                var newX = (e.pageX - this.GLOBALS.canvas_rect.left - scrollX)*this.GLOBALS.canvas.width/this.GLOBALS.canvas_rect.width;
                var newY = (e.pageY - this.GLOBALS.canvas_rect.top - scrollY)*this.GLOBALS.canvas.height/this.GLOBALS.canvas_rect.height;
                var adjustedX = newX - 0.5*this.PLAYER.getWidth();
                var adjustedY = newY - 0.5*this.PLAYER.getHeight();
                this.PLAYER.setPos(adjustedX,adjustedY);
                this.PLAYER.update();
            }
        });

        this.GLOBALS.canvas.addEventListener("click",()=>{
            if(this.GAME_RUNNING){
                this.pause_game();
            };
        });
        
    }
    checkCollisions(){
        // Checks collisions between player and berries
        this.BLOCK_MANAGER.BLOCK_ARR.forEach((b)=>{
            this.PLAYER.checkCollision(this.PLAYER,b);

            if(!this.IS_PAUSED && this.PLAYER.checkCollision(b)){
                //this.PLAYER.grow();
                var index = this.BLOCK_MANAGER.BLOCK_ARR.indexOf(b);
                if(b instanceof PoisonBerry)
                {
                    console.log("poison berry hit");
                    // increment berries
                    this.P_BERRIES_ATE += 1;
                    this.BERRIES_ATE += 1;
                    this.TOOLS.playSND(this.PAIN_01);
                    this.SCORE -= b.getPointVal();
                    this.PLAYER.grow(-b.getSizeVal());
                }
                else{
                    this.TOOLS.playSND(this.MUNCH_01);
                    console.log("yum berry hit");
                    // increment berries
                    this.Y_BERRIES_ATE +=1;
                    this.BERRIES_ATE +=1;
                    this.PLAYER.grow(b.getSizeVal());
                    this.SCORE += b.getPointVal();
                }
                
                this.BLOCK_MANAGER.BLOCK_ARR.splice(index,1);
                this.berryHit();
            }
            
        });
    }
    probDecision(chance){
        // returns true or false based on prob 
        // note need prob out of percent ie : 99 or 1
        return chance > this.TOOLS.getRandomInt(0,100)
    }
    berryHit(){
        // adds berries when you eat them!
        this.BLOCK_MANAGER.addRegBerry(1);
        if(this.probDecision(this.P_BERRY_PROB) &&
            this.BLOCK_MANAGER.getArrLen() < this.GLOBALS.MAX_BERRIES){
           var r_berries = this.TOOLS.getRandomInt(1,2);
           var p_berries = this.TOOLS.getRandomInt(1,4);
           console.log('here');
           this.BLOCK_MANAGER.addPoisonBerry(p_berries);
           this.BLOCK_MANAGER.addRegBerry(r_berries);
        }
    }
    getScore(){
        return this.SCORE;
    }
    getPBerriesAte(){
        return this.P_BERRIES_ATE;
    }
    getYBerriesAte(){
        return this.Y_BERRIES_ATE;
    }
    getBerriesAte(){
        return this.BERRIES_ATE;
    }
    endSong(){
        this.THEME_SONG.pause();
        this.THEME_SONG.currentTime = 0;
    }
    checkPause(){
        // checks if paused
        if(this.IS_PAUSED){
            // operations if paused
            this.SCREENS.pauseScreen();
        }
    }
    checkScore(){
        this.HTML__SCORE.innerHTML = this.HTML__SCORE_TXT + this.SCORE;
    }
    checkBerries(){
        this.HTML__BERRIES_ATE.innerHTML = this.HTML__BERRIES_TXT + this.BERRIES_ATE;
        this.HTML__Y_BERRIES_ATE.innerHTML = this.HTML__Y_BERRIES_TXT + this.Y_BERRIES_ATE;
        this.HTML__P_BERRIES_ATE.innerHTML = this.HTML__P_BERRIES_TXT + this.P_BERRIES_ATE;
    }
    updatePlayer(){
        this.GLOBALS.ctx.drawImage(this.GLOBALS.bg,0,0);
        this.PLAYER.update();

        // if screen paused show pause screen
        this.checkPause();
    }
    updateSurroundings(){
        this.updatePlayer();
        this.checkCollisions();
        this.checkBerries();
        this.checkScore();
        this.BLOCK_MANAGER.update();
    }
    pause_game(){
        if(this.IS_PAUSED){
            this.IS_PAUSED = false;
            console.log('is unpaused');
            this.BLOCK_MANAGER.startMotion();
        }
        else{
            this.IS_PAUSED = true;
            console.log('is paused');
            this.BLOCK_MANAGER.stopMotion();
        }
    }
    resetBerries(){
        // resets all info on berries
        this.P_BERRIES_ATE = 0;
        this.Y_BERRIES_ATE = 0;
        this.BERRIES_ATE = 0;

        this.HTML__BERRIES_ATE.innerHTML = this.HTML__BERRIES_TXT;
        this.HTML__P_BERRIES_ATE.innerHTML = this.HTML__P_BERRIES_TXT;
        this.HTML__Y_BERRIES_ATE.innerHTML = this.HTML__Y_BERRIES_TXT;
    }
    init(){
        this.GAME_RUNNING = true;
        this.BLOCK_MANAGER.init();
        this.PLAYER_UPDATE = setInterval(()=>{this.updatePlayer()},10);
        this.SURROUND_UPDATE = setInterval(()=>{this.updateSurroundings()},10);
        this.BLOCK_UPDATE = setInterval(()=>{this.BLOCK_MANAGER.changeBlockDir()},3000);
        this.THEME_SONG.play();
    }
    reset(){
        this.HTML__SCORE.innerHTML = this.HTML__SCORE_TXT;
        clearInterval(this.PLAYER_UPDATE);
        clearInterval(this.SURROUND_UPDATE);
        clearInterval(this.BLOCK_UPDATE);
        this.resetBerries();
        this.PLAYER = null;
        this.BLOCK_MANAGER = null;
        // this.GLOBALS.ctx.clearRect(0,0,this.GLOBALS.canvas.width,this.GLOBALS.canvas.height);
        this.GLOBALS.clearListeners();

        this.endSong();
    }
}


function newGame(){
    /*
    On button press, this is called
    */
    console.log('game begun');

    window.game = new Game();
    window.introEnd = new Screens();
    window.introEnd.clearScreen();
    
    var new_game_btn = document.getElementById("newGame__btn");
    var end_game_btn = document.getElementById("endGame__btn");
    // Make new game invisible, end game and new game visible
    new_game_btn.style.display = "none";
    end_game_btn.style.display = "block";
    window.introEnd.runIntro();
    setTimeout(()=>{
        game.init();
    },window.introEnd.WAIT_TIME);
}
function endGame(){
    console.log('game ended');

    var score = window.game.getScore();
    var p_berries = window.game.getPBerriesAte();
    var y_berries = window.game.getYBerriesAte();
    var berries = window.game.getBerriesAte();

    window.game.reset();

    window.introEnd = new Screens();
    window.introEnd.clearScreen();
    window.introEnd.endGameScreen(score, p_berries, y_berries, berries);

    var new_game_btn = document.getElementById("newGame__btn");
    var end_game_btn = document.getElementById("endGame__btn");
    // Make new game btn visible and end game invisible
    new_game_btn.style.display = "block";
    end_game_btn.style.display = "none";
}


