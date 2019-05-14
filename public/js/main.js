var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {y: 0}
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
            createSpeechBubble: createSpeechBubble
        }
    }
};

var game = new Phaser.Game(config);
var my_id;

function preload() {
    this.load.image('test', 'assets/test.png')
    this.load.image('test2', 'assets/test2.png')
    this.load.image('background', 'assets/background1.png');
}


function create() {
    var self = this;
    this.cameras.main.setBounds(0, 0, 1920 * 2, 1080 * 2);
    this.physics.world.setBounds(0, 0, 1920 * 2, 1080 * 2)
    this.add.image(0, 0, 'background').setOrigin(0, 0).setDisplaySize(1920 * 2, 1080 * 2);
    this.socket = io();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.otherPlayers = this.physics.add.staticGroup();
    this.otherPlayersText = this.physics.add.group();

    var inputName = prompt("請輸入你的暱稱~ (最多10個字)");
    while (1) {
        if (inputName != null && inputName != "") {
            if(inputName.length > 10){
                inputName = inputName.substring(0,10);
            }
            this.socket.on('connect', function () {
                self.socket.emit('addMe', inputName);
                self.socket.on('setName', function (username, players) {
                    self.socket.on('currentPlayers', function (players) {
                        console.log('Your player has been created.')
                        Object.keys(players).forEach(function (id) {
                            my_id = id;
                            if (players[id].playerId === self.socket.id) {
                                addPlayer(self, players[id]);
                            } else {
                                addOtherPlayers(self, players[id]);
                            }
                        });
                    });


                    self.socket.on('newPlayer', function (playerInfo) {
                        console.log('another player has been created.');
                        addOtherPlayers(self, playerInfo);
                    });
                    // console.log('User Name' + username);
                    // console.log('Player Name'+playerInfo.playerName);
                    players[self.socket.id].playerName = username;
                    // self.test.name.setText(players[self.socket.id].playerName);
                    console.log(players[self.socket.id]);
                    self.socket.emit('updateName',username,self.socket.id);
                })
            });
            break;
        } else {
            inputName = prompt("輸入暱稱啦 幹");
        }
    }


    this.socket.on('disconnect', function (playerId) {
        console.log('somebody has disconnected.')
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
        self.otherPlayersText.getChildren().forEach(function (otherPlayerText) {
            if (playerId === otherPlayerText.playerId) {
                // otherPlayerText.setRotation(playerInfo.rotation);
                otherPlayerText.destroy();
            }
        });
    });

    this.socket.on('playerMoved', function (playerInfo,nameX,nameY) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setRotation(playerInfo.rotation);
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
        });
        self.otherPlayersText.getChildren().forEach(function (otherPlayerText) {
            if (playerInfo.playerId === otherPlayerText.playerId) {
                // otherPlayerText.setRotation(playerInfo.rotation);
                otherPlayerText.setPosition(playerInfo.x, playerInfo.y+35);

            }
        });
    });


    this.socket.on('chat', function (username, data) {
        var msg = document.createElement('msg');
        var user_name = document.createElement('name');
        var text = document.createElement('text')
        var output = document.getElementById('output');
        user_name.innerHTML = username + ' :  ';
        text.innerHTML = data;
        user_name.style.fontWeight = "bold"
        msg.append(user_name);
        msg.append(text);
        output.appendChild(msg);
        output.appendChild(document.createElement("br"))
        output.scrollTop = output.scrollHeight;
    });
    document.getElementById('sendtext').addEventListener('click', function () {
        var text = document.getElementById('data').value;
        if (text != "") {
            document.getElementById('data').value = '';
            self.socket.emit('sendChat', text);
            self.createSpeechBubble(self.test.x, self.test.y, 320, 160, text);
            // console.log('bubble has benn created!');
        }
    }, false);
    document.getElementById('data').addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode || 0;
        if (key === 13) {
            var text = document.getElementById('data').value;
            if (text != "") {
                self.socket.emit('sendChat', text);
                document.getElementById('data').value = '';
                self.createSpeechBubble(self.test.x, self.test.y, 320, 160, text);
                // console.log('bubble has benn created!');
            }
        }
    })
}

function update() {


    if (this.test) {
        if (this.cursors.left.isDown) {
            // this.test.setAngularVelocity(-150);
            this.test.setAccelerationX(-150);
        } else if (this.cursors.right.isDown) {
            // this.test.setAngularVelocity(150);
            this.test.setAccelerationX(150);
        } else {
            this.test.setAccelerationX(0);
        }

        if (this.cursors.up.isDown) {
            // this.physics.velocityFromRotation(this.test.rotation + 1.5, -100, this.test.body.acceleration);
            this.test.setAccelerationY(-150);
        } else if (this.cursors.down.isDown) {
            // this.physics.velocityFromRotation(this.test.rotation-1.5,-100    ,this.test.body.acceleration)
            this.test.setAccelerationY(150);
        } else {
            this.test.setAccelerationY(0);
        }

        this.physics.world.wrap(this.test, 5);

        // emit player movement
        var x = this.test.x;
        var y = this.test.y;
        var r = this.test.rotation;
        if (this.test.oldPosition && (x !== this.test.oldPosition.x || y !== this.test.oldPosition.y || r !== this.test.oldPosition.rotation )) {
            this.socket.emit('playerMovement', {x: this.test.x, y: this.test.y, rotation: this.test.rotation},this.test.name);
            this.test.name.x = x;
            this.test.name.y = y+35;
        }

// save old position data
        this.test.oldPosition = {
            x: this.test.x,
            y: this.test.y,
            rotation: this.test.rotation
        };

    }
}

function addPlayer(self, playerInfo) {
    self.test = self.physics.add.image(playerInfo.x, playerInfo.y, 'test').setOrigin(0.5, 0.5).setDisplaySize(48, 48).setBounce(1,1);
    if (playerInfo.team === 'blue') {
        // self.test.setTint(0x0000ff);
    } else {
        // self.test.setTint(0xff0000);
    }
    var user_name = playerInfo.playerName;
    console.log(playerInfo.playerName);
    var style = {
        font: "18px Arial",
        fill: "#ffffff",
        wordWrap: true,
        wordWrapWidth: self.test.width,
        align: "center"
        // backgroundColor: "#ffff00"
    };
    self.test.name = self.add.text(self.test.x, self.test.y+35, user_name, style).setOrigin(0.5,0.5);
    self.test.setCollideWorldBounds(true);
    self.cameras.main.startFollow(self.test);
    self.test.setDrag(300);
    // self.test.setAngularDrag(100);
    self.test.setMaxVelocity(1000);
}


function addOtherPlayers(self, playerInfo) {
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'test2').setOrigin(0.5, 0.5).setDisplaySize(48, 48);
    var style = {
        font: "18px Arial",
        fill: "#ffffff",
        wordWrap: true,
        align: "center"
        // backgroundColor: "#ffff00"
    };
    console.log(playerInfo);
    var user_name = playerInfo.playerName;

    const otherPlayerText =self.add.text(playerInfo.x, playerInfo.y+35,user_name,style).setOrigin(0.5,0.5);
    otherPlayerText.setText(user_name);
    otherPlayer.playerId = playerInfo.playerId;
    otherPlayerText.playerId =playerInfo.playerId;
    // otherPlayer.playerText =
    self.otherPlayers.add(otherPlayer);
    self.otherPlayersText.add(otherPlayerText);
}


function createSpeechBubble (x, y, width, height, quote)
{
    var bubble_class={
        bubble : null,
        bubbleText: null
    }
    var bubblePadding = 10;
    var arrowHeight = 12;
    var bubbleWidth = width;
    var bubble = this.add.graphics({ x: x, y: y });
    var content = this.add.text(0, 0, quote, { fontFamily: 'Arial', fontSize: 20, color: '#000000', align: 'center', wordWrap: { width: bubbleWidth - (bubblePadding * 2) ,useAdvancedWrap: true} });
    var bubbleHeight = content.height;
    if(bubbleWidth<25){
        bubbleWidth = 25;
    }
    if(bubbleHeight<50){
        bubbleHeight=50;
    }
    //  Bubble shadow
    bubble.fillStyle(0x222222, 0.5);
    bubble.fillRoundedRect(6, 6, bubbleWidth, bubbleHeight, 16);

    //  Bubble color
    bubble.fillStyle(0xffffff, 1);

    //  Bubble outline line style
    bubble.lineStyle(4, 0x565656, 1);

    //  Bubble shape and outline
    bubble.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);
    bubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 16);

    //  Calculate arrow coordinates
    var point1X = Math.floor(16);
    var point1Y =bubbleHeight;
    var point2X = Math.floor((16) * 2);
    var point2Y = bubbleHeight;
    var point3X = Math.floor(32 / 5);
    var point3Y = Math.floor(bubbleHeight + arrowHeight);

    //  Bubble arrow shadow
    bubble.lineStyle(4, 0x222222, 0.5);
    bubble.lineBetween(point2X - 1, point2Y + 6, point3X + 2, point3Y);

    //  Bubble arrow fill
    bubble.fillTriangle(point1X, point1Y, point2X, point2Y, point3X, point3Y);
    bubble.lineStyle(2, 0x565656, 1);
    bubble.lineBetween(point2X, point2Y, point3X, point3Y);
    bubble.lineBetween(point1X, point1Y, point3X, point3Y);

    console.log(content);
    var b = content.getBounds();
    bubble.setPosition(x+24,y-bubbleHeight-arrowHeight-24);
    content.setPosition(bubble.x + (bubbleWidth / 2) - (b.width / 2), bubble.y + (bubbleHeight / 2) - (b.height / 2));
    bubble_class.bubble = bubble;
    bubble_class.bubbleText = content;
    self.bubble = bubble_class;
}