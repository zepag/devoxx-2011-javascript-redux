/**************************************************
** GAME VARIABLES
**************************************************/
var canvas,			// Canvas DOM element
	ctx,			// Canvas rendering context
	keys,			// Keyboard input
	localPlayer,	// Local player
	remotePlayers,  // Remote players
	socket;			// Server socket


/**************************************************
** GAME INITIALISATION
**************************************************/
var init = function () {
	// Declare the canvas and rendering context
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");

	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// Initialise keyboard controls
	keys = new Keys();

	// Calculate a random start position for the local player
	// The minus 5 (half a player size) stops the player being
	// placed right on the egde of the screen
	var startX = Math.round(Math.random()*(canvas.width-5)),
		startY = Math.round(Math.random()*(canvas.height-5));

	// Initialise the local player
	localPlayer = new Player(startX, startY);
	// Initialise the remote players' array
	remotePlayers = [];
	socket = io.connect("http://localhost", {port: 8000, transports: ["websocket"]});
	// Start listening for events
	setEventHandlers();
};


/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Keyboard
	window.addEventListener("keydown", onKeydown, false);
	window.addEventListener("keyup", onKeyup, false);

	// Window resize
	window.addEventListener("resize", onResize, false);
	socket.on("connect", onSocketConnected);
	socket.on("disconnect", onSocketDisconnect);
	socket.on("new player", onNewPlayer);
	socket.on("move player", onMovePlayer);
	socket.on("remove player", onRemovePlayer);
};

// Keyboard key down
var onKeydown = function (e) {
	if (localPlayer) {
		keys.onKeyDown(e);
	};
};

// Keyboard key up
var onKeyup = function (e) {
	if (localPlayer) {
		keys.onKeyUp(e);
	};
};

// Browser window resize
var onResize = function (e) {
	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
};

var onSocketConnected = function () {
    console.log("Connected to socket server");
	socket.emit("new player", {x: localPlayer.getX(), y: localPlayer.getY()});
};

var onSocketDisconnect = function () {
    console.log("Disconnected from socket server");
};

var onNewPlayer = function (data) {
    console.log("New player connected: "+data.id);
	var newPlayer = new Player(data.x, data.y);
	newPlayer.id = data.id;
	remotePlayers.push(newPlayer);
};

var onMovePlayer = function (data) {
	var movePlayer = playerById(data.id);

	if (!movePlayer) {
	    console.log("Player not found: "+data.id);
	    return;
	};

	movePlayer.setX(data.x);
	movePlayer.setY(data.y);
};

var onRemovePlayer = function (data) {
	var removePlayer = playerById(data.id);
	if (!removePlayer) {
	    console.log("Player not found: "+data.id);
	    return;
	};
	remotePlayers.splice(remotePlayers.indexOf(removePlayer), 1);
};


/**************************************************
** GAME ANIMATION LOOP
**************************************************/
var animate = function () {
	update();
	draw();

	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
};


/**************************************************
** GAME UPDATE
**************************************************/
var update = function () {
	if (localPlayer.update(keys)) {
	    socket.emit("move player", {x: localPlayer.getX(), y: localPlayer.getY()});
	};
};


/**************************************************
** GAME DRAW
**************************************************/
var draw = function () {
	// Wipe the canvas clean
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Draw the local player
	localPlayer.draw(ctx);
	
	// Draw the remote players
	var i;
	for (i = 0; i < remotePlayers.length; i++) {
	    remotePlayers[i].draw(ctx);
	};
};

var playerById = function (id) {
    var i;
    for (i = 0; i < remotePlayers.length; i++) {
        if (remotePlayers[i].id == id)
            return remotePlayers[i];
    };

    return false;
};