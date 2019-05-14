var express = require('express');
var app = express(); // 建立Express Application 物件
var server = require('http').Server(app);
var io= require('socket.io').listen(server)
var players = {};
app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) { // '/'為伺服器根目錄，當使用者連線到根目錄時做出回應
  res.sendFile(__dirname + '/index.html');
	// res.send("Hello <b>World</b>");
});


io.on('connection', function (socket) {
  console.log('a user connected : '+socket.id);
  players[socket.id] = {
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    playerName: "default_name",
    team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
  };

  socket.on('addMe',function(username){
    // console.log('fuck');
    socket.username = username;
    // players[socket.id].playerName = username;
    socket.emit('setName',username,players);
    socket.emit('updateName',players);
    socket.emit('chat', 'SERVER', 'You have connected');
    socket.broadcast.emit('chat', 'SERVER', username + 'join the chatroom!');
  });
  socket.on('updateName',function (username,id) {
    players[id].playerName = username;
    console.log('update!');
    // send the players object to the new player
    socket.emit('currentPlayers', players);
// update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);
  })


  socket.on('sendChat', function(data) {
    io.sockets.emit('chat', socket.username, data);
  });

  // create a new player and add it to our players object



  socket.on('disconnect', function () {
    console.log('user disconnected');
// remove this player from our players object
    delete players[socket.id];
// emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });


// when a player moves, update the player data
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].rotation = movementData.rotation;
    // name.x = movementData.x;
    // name.y = movementData.y;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
    // console.log(players);
  });
});

// http.listen(process.env.PORT || 3000, function() {
//   // ...
// })


server.listen(process.env.PORT || 8000, function () {
  console.log(`Listening on ${server.address().port}`);
});