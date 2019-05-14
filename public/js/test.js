/** @type {import("../typescript/phaser")} */

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,

    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
let game = new Phaser.Game(config)
let mykeyboard;
let player;
var upKey;
var downKey;
var leftKey;
var rightKey;
function preload ()
{
    // this.load.image('test','assets/player.png')
    this.load.spritesheet('player', 'assets/player.png', {frameWidth: 32 , frameHeight: 32});
    this.load.image('background','assets/background.jpg');
}

function create ()
{
    player = this.add.sprite(400,300,'player');
    // game.world.setBounds()
    // mykeyboard = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    // upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    // downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    // leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    // rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    mykeyboard = this.input.keyboard.addKeys({
        'enter': Phaser.Input.Keyboard.KeyCodes.ENTER,
        'up': Phaser.Input.Keyboard.KeyCodes.UP,
        'down': Phaser.Input.Keyboard.KeyCodes.DOWN,
        'left': Phaser.Input.Keyboard.KeyCodes.LEFT,
        'right': Phaser.Input.Keyboard.KeyCodes.RIGHT,
        'w': Phaser.Input.Keyboard.KeyCodes.W,
        'a': Phaser.Input.Keyboard.KeyCodes.A,
        's': Phaser.Input.Keyboard.KeyCodes.S,
        'd': Phaser.Input.Keyboard.KeyCodes.D
    });
}

function update ()
{
    // player.x += 10;
    if(mykeyboard.up.isDown){
        player.y -= 10;
    }
    if(mykeyboard.down.isDown){
        player.y += 10;
    }
    if(mykeyboard.right.isDown){
        player.x += 10;
    }
    if(mykeyboard.left.isDown){
        player.x -= 10;
    }
}

function setKeys(){

}
// var game = new Phaser.Game(config);