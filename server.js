var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
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

		// if (_self.dir == 1) {
		// 	return _self.pipedown(player);
		// }

		// if (_self.dir == -1) {
		// 	return _self.pipeup(player);
		// }

		console.error('Pipe [' + _self.id + '] has invalid direction: ' + _self.dir);
		return false;
	};

	_self.pipedown = function(player) {
		if (player.y < _self.y) {
			return true;
		} else {
			return _self.pipe(player);
		}
	};

	_self.pipeup = function(player) {
		if (player.y + _.PLAYERHEIGHT > _self.y) {
			return true;
		} else {
			return _self.pipe(player);
		}
	};

	_self.pipe = function(player) {
		let leftx = _self.x - (_.PIPEWIDTH / 2);
		let rightx = _self.x + (_.PIPEWIDTH / 2);
		return player.x > leftx && (player.x + _.PLAYERWIDTH) < rightx;
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

const Player = function(id, nick, x, y, color) {
	let _self = {
		id: id,
		nick: nick,
		active: false,

		x: _.STARTX,
		xvel: _.MOVEVELOCITY,
		xaccl: 0,

		y: _.STARTY,
		yvel: _.JUMPVELOCITY,
		yaccl: _.GRAVITY,

		pressingjump: false,
		previous: null
	};

	_self.start = function() {
		_self.active = true;
	};

	_self.update = function() {
		if (!_self.active)
			return;

		_self.updatepos();
	};

	_self.updatepos = function() {

		_self.yvel += _self.yaccl * _.SERVERDELTA;

		if (_self.pressingjump) {
			_self.pressingjump = false;
			_self.yvel = _.JUMPVELOCITY;
		}

		_self.y += _self.yvel * _.SERVERDELTA;
		_self.x += _self.xvel * _.SERVERDELTA;

		_self.updatecollision();
	};

	_self.updatecollision = function() {
		if (_self.y > 650) {
			_self.reset();
		}
	};

	_self.jump = function() {
		_self.pressingjump = true;
	};

	_self.reset = function() {
		_self.active = false;
		_self.pressingjump = false;
		_self.yvel = _.JUMPVELOCITY;
		_self.x = _.STARTX;
		_self.y = _.STARTY;
	};

	_self.getinitpacket = function() {
		return {
			id: _self.id,
			nick: _self.nick,
			x: _self.x,
			y: _self.y
		};
	};

	_self.getupdatepacket = function() {
		return {
			id: _self.id,
			x: _self.x,
			y: _self.y
		};
	};

	Player.$Map[_self.id] = _self;
	Player.$ToCreate.push(_self.getinitpacket());
	return _self;
};
Player.$Map = {};
Player.$ToCreate = [];
Player.$ToRemove = [];
Player.$Connect = function(socket) {
	//when a client connects
	//create new player obj, send init packets
	let player = Player(socket.id, null, 0, 0, '#00FF00');

	// Listen for keypress from client
	socket.on('keypress', function(data) {
		//data.type, ie. jump, attack etc
		//data.state, up down
		switch (data.type) {
			case _.JUMP : {
				if (data.state == _.KEYDOWN) {
					if (player.active) {
						player.jump();
						debug(1, player.id + ' has jumped');
					}
				}
				break;
			}
			case _.START : {
				if (data.state == _.KEYUP) {
					player.start();
					debug(1, player.id + ' has started');
				}
				break;
			}
			case _.RESET : {
				if (data.state == _.KEYUP) {
					player.reset();
					debug(1, player.id + ' has reset');
				}
				break;
			}
			default: {
				console.log('Unknown keypress type' + data);
			}
		}
	});

	// On connect inform client of all players
	socket.emit('init', {
		players: Player.$GetInitPacket(),
		pipes: Pipe.$GetInitPacket()
	});
};
Player.$Disconnect = function(socket) {
	Player.$ToRemove.push(socket.id);
	delete Player.$Map[socket.id];
};
Player.$GetInitPacket = function() {
	let packet = [];
	for (let p in Player.$Map) {
		packet.push(Player.$Map[p].getinitpacket());
	}
	return packet;
};
Player.$GetUpdatePacket = function() {
	let packet = [];
	for (let p in Player.$Map) {
		packet.push(Player.$Map[p].getupdatepacket());
	}
	return packet;
};
Player.$UpdatePlayers = function() {
	for (let p in Player.$Map) {
		Player.$Map[p].update();
	}
};



io.on('connection', function(socket) {

	Socket.$Map[socket.id] = socket;

	Player.$Connect(socket);

	socket.on('disconnect', function() {
		Player.$Disconnect(socket);
		delete Socket.$Map[socket.id];
	});

});


let Update_Packet;

setInterval(function() {

	Player.$UpdatePlayers();

	Update_Packet = {
		update: Player.$GetUpdatePacket()
	};

	if (Player.$ToCreate.length) {
		debug(1, 'Create:', Player.$ToCreate);
		Update_Packet['init'] = Player.$ToCreate;
	}

	if (Player.$ToRemove.length) {
		debug(1, 'Remove:', Player.$ToRemove);
		Update_Packet['remove'] = Player.$ToRemove;
	}

	for (let s in Socket.$Map) {
		Socket.$Map[s].emit('update', Update_Packet);
	}

	// Cleanup
	Player.$ToCreate = [];
	Player.$ToRemove = [];

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