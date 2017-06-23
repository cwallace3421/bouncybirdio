const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);

const _ = require('./shared/constants.js');
const Utils = require('./shared/utils.js');
const Player = require('./shared/player.js');
const PlayerUtils = require('./shared/player_utils.js');
const Pipe = require('./shared/pipe.js');
const PipeUtils = require('./shared/pipe_utils.js');

app.use('/css', express.static(__dirname + '/css'));
app.use('/game', express.static(__dirname + '/game'));
app.use('/shared', express.static(__dirname + '/shared'));
app.use('/assets', express.static(__dirname + '/assets'));

server.listen(process.env.PORT || _.PORT, function() {
	init();
	console.log('Listening on ' + server.address().port);
});

app.get('/', function(request, response) {
	response.sendFile(__dirname + '/index.html');
});


let SocketMap = {};
let Update_Packet = {};

function init() {
	PipeUtils.Generate();
}

io.on('connection', function(socket) {

	SocketMap[socket.id] = socket;

	PlayerUtils.Connect(socket, {
		players: PlayerUtils.GetInitPacket(),
		pipes: PipeUtils.GetInitPacket()
	});

	socket.on('disconnect', function() {
		PlayerUtils.Disconnect(socket);
		delete SocketMap[socket.id];
	});

});

setInterval(function() {

	PlayerUtils.UpdatePlayers(PipeUtils);

	Update_Packet = {
		update: PlayerUtils.GetUpdatePacket()
	};

	if (PlayerUtils.ToCreate.length) {
		Update_Packet['init'] = PlayerUtils.ToCreate;
	}

	if (PlayerUtils.ToRemove.length) {
		Update_Packet['remove'] = PlayerUtils.ToRemove;
	}

	for (let key in SocketMap) {
		SocketMap[key].emit('update', Update_Packet);
	}

	PlayerUtils.ToCreate.length = 0;
	PlayerUtils.ToRemove.length = 0;
	
}, 1000 / _.SERVERTICK);