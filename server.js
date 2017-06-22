var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var Player = require('./shared/player.js');
var PlayerUtils = require('./shared/player_utils.js');
var _ = require('./shared/constants.js');

app.use('/css', express.static(__dirname + '/css'));
app.use('/game', express.static(__dirname + '/game'));
app.use('/shared', express.static(__dirname + '/shared'));
app.use('/assets', express.static(__dirname + '/assets'));

server.listen(process.env.PORT || _.PORT, function() {
	console.log('Listening on ' + server.address().port);
	Pipe.$Generate();
});

app.get('/', function(request, response) {
	response.sendFile(__dirname + '/index.html');
});


const Socket = {
	$Map: {}
};

const Pipe = function(x, y, dir) {
	let _self = {
		id: guid(),
		x: x,
		y: y,
		dir: dir // 1 = down, -1 = up, 0 = not valid
	};

	_self.playercollide = function(player) {

		if (_self.dir == 1) {
			return _self.pipedown(player);
		}

		if (_self.dir == -1) {
			return _self.pipeup(player);
		}

		console.error('Pipe [' + _self.id + '] has invalid direction: ' + _self.dir);
		return false;
	};

	_self.pipedown = function(player) {
		return player.y < _self.y && _self.pipe(player);
	};

	_self.pipeup = function(player) {
		return player.y + _.PLAYERHEIGHT > _self.y && _self.pipe(player);
	};

	_self.pipe = function(player) {
		let leftx = _self.x - (_.PIPEWIDTH / 2);
		let rightx = _self.x + (_.PIPEWIDTH / 2);
		return (player.x + _.PLAYERWIDTH) > leftx && player.x < rightx;
	};

	_self.getinitpacket = function() {
		return _self;
	};

	Pipe.$List.push(_self);
	return _self;
};
Pipe.$List = [];
Pipe.$Generate = function() {
	let prevy = _.WORLDHEIGHT / 2;
	for (let x = _.VIEWWIDTH; x <= _.WORLDWIDTH; x += 350) {
		let y = prevy;
		let gap = (_.PLAYERHEIGHT * 2) + (_.PLAYERHEIGHT * getRandomInt(3 , 8));
		// down
		Pipe(x, y - (gap / 2), 1);
		// up
		Pipe(x, y + (gap / 2), -1);
		prevy = y;
	}
	Pipe.$List.sort(function(a, b) {
		if (a.x < b.x)
			return -1;
		if (a.x > b.x)
			return 1;
		if (a.x === b.x)
			return 0;
	});
};
Pipe.$GetInitPacket = function() {
	let packet = [];
	for (let p = 0; p < Pipe.$List.length; p++) {
		packet.push(Pipe.$List[p].getinitpacket());
	}
	return packet;
};
Pipe.$CheckCollision = function(player) {
	for (let p = 0; p < Pipe.$List.length; p++) {
		if (player.x < Pipe.$List[p].x - _.PIPEWIDTH) {
			return false;
		} else if (Pipe.$List[p].playercollide(player)) {
			return true;
		}
	}
	return false;
};


io.on('connection', function(socket) {

	Socket.$Map[socket.id] = socket;

	PlayerUtils.Connect(socket, {
		players: PlayerUtils.GetInitPacket(),
		pipes: Pipe.$GetInitPacket()
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