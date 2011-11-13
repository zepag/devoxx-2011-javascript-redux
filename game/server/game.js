var util = require("util"),
    io = require("socket.io"),
	Player = require("./Player").Player;

var socket,
	players;


var playerById = function (id) {
	var i;
	for (i = 0; i < players.length; i++) {
		if (players[i].id == id){
			return players[i];
		}
	}
	return false;
};

var onClientDisconnect = function () {
	util.log("Player has disconnected: "+this.id);
	var removePlayer = playerById(this.id);

	if (!removePlayer) {
	    util.log("Player not found: "+this.id);
	    return;
	};

	players.splice(players.indexOf(removePlayer), 1);
	this.broadcast.emit("remove player", {id: this.id});
};
var onNewPlayer = function (data) {
	var newPlayer = new Player(data.x, data.y);
	newPlayer.id = this.id;
	this.broadcast.emit("new player", {
		id: newPlayer.id,
		x: newPlayer.getX(),
		y: newPlayer.getY()
	});
	var i, existingPlayer;
	for (i = 0; i < players.length; i++) {
	    existingPlayer = players[i];
	    this.emit("new player",{
			id: existingPlayer.id, 
			x: existingPlayer.getX(), 
			y: existingPlayer.getY()
		});
	};
	players.push(newPlayer);
};
var onMovePlayer = function (data) {
	var movePlayer = playerById(this.id);

	if (!movePlayer) {
	    util.log("Player not found: "+this.id);
	    return;
	};

	movePlayer.setX(data.x);
	movePlayer.setY(data.y);

	this.broadcast.emit("move player", {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()});
};

var onSocketConnection = function (client) {
	util.log("New player has connected: "+client.id);
	client.on("disconnect", onClientDisconnect);
	client.on("new player", onNewPlayer);
	client.on("move player", onMovePlayer);
};

var setEventHandlers = function () {
    socket.sockets.on("connection", onSocketConnection);
};

var init = function () {
	players = [];
	socket = io.listen(8000);
	socket.configure(function() {
	    socket.set("transports", ["websocket"]);
	    socket.set("log level", 2);
	});
	setEventHandlers();
};

init();