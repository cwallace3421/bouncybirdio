var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var _ = require('./shared/constants.js');
var Player = require('./shared/player.js');
var PlayerUtils = require('./shared/player_utils.js');
var Pipe = require('./shared/pipe.js');
var PipeUtils = require('./shared/pipe_utils.js');

app.use('/css', express.static(__dirname + '/css'));
app.use('/game', express.static(__dirname + '/game'));
app.use('/shared', express.static(__dirname + '/shared'));
app.use('/assets', express.static(__dirname + '/assets'));

server.listen(process.env.PORT || _.PORT, function() {
	console.log('Listening on ' + server.address().port);
	PipeUtils.Generate();
});

app.get('/', function(request, response) {
	response.sendFile(__dirname + '/index.html');
});


const Socket = {
	$Map: {}
};

io.on('connection', function(socket) {

	Socket.$Map[socket.id] = socket;

	PlayerUtils.Connect(socket, {
		players: PlayerUtils.GetInitPacket(),
		pipes: PipeUtils.GetInitPacket()
	});

	socket.on('disconnect', function() {
		PlayerUtils.Disconnect(socket);
		delete Socket.$Map[socket.id];
	});

});


let Update_Packet;

setInterval(function() {

	PlayerUtils.UpdatePlayers();

	Update_Packet = {
		update: PlayerUtils.GetUpdatePacket()
	};

	if (PlayerUtils.ToCreate.length) {
		debug(1, 'Create:', PlayerUtils.ToCreate);
		Update_Packet['init'] = PlayerUtils.ToCreate;
	}

	if (PlayerUtils.ToRemove.length) {
		debug(1, 'Remove:', PlayerUtils.ToRemove);
		Update_Packet['remove'] = PlayerUtils.ToRemove;
	}

	for (let s in Socket.$Map) {
		Socket.$Map[s].emit('update', Update_Packet);
	}

	// Cleanup
	PlayerUtils.ToCreate.length = 0;
	PlayerUtils.ToRemove.length = 0;

	debug(5, 'Update_Packet: ', Update_Packet);
}, 1000 / _.SERVERTICK);


/*
	Helpers
*/

function randomInt(low, high) {
	return Math.floor(Math.random() * (high - low) + low);
}

function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/*
	Logging
*/
let DEBUG_LEVEL = 1;

function debug(level, message, object) {
	if (DEBUG_LEVEL == 0)
		return;

	if (level <= DEBUG_LEVEL) {
		if (object) {
			console.log(message, object);
		} else {
			console.log(message);
		}
	}
}